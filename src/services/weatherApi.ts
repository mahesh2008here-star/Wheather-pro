/**
 * Weather API Service
 * Scalable integration layer for Open-Meteo, Reverse Geocoding, and Geocoding APIs.
 */

import { ENV, DEFAULT_LOCATIONS } from '../config/env';
import { 
  CurrentWeatherMetrics, 
  DailyForecastItem, 
  HourlyForecastItem, 
  LocationInfo, 
  WeatherAlert, 
  AirQualityData,
  AstronomyData,
  MinuteRainItem
} from '../types/weather';
import { 
  mapWmoCode, 
  getCardinalDirection, 
  calculateDewPoint, 
  calculateMoonPhase, 
  determineSceneAutomatically 
} from '../utils/weatherUtils';

// Re-export utility functions for backwards compatibility across imports
export { mapWmoCode, getCardinalDirection, calculateDewPoint, calculateMoonPhase, determineSceneAutomatically, DEFAULT_LOCATIONS };

/**
 * Generate next hour minute-by-minute rain curve (MinuteCast)
 */
export function generateMinuteCast(
  currentPrecip: number, 
  rainProb: number,
  nextHourPrecip: number = 0,
  nextHourProb: number = 0
): MinuteRainItem[] {
  const items: MinuteRainItem[] = [];
  
  const p0 = currentPrecip > 0 ? currentPrecip : (rainProb > 25 ? (rainProb - 10) / 20 : 0);
  const p1 = nextHourPrecip > 0 ? nextHourPrecip : (nextHourProb > 25 ? (nextHourProb - 10) / 20 : 0);

  for (let i = 0; i <= 60; i += 5) {
    const t = i / 60;
    const smoothBase = p0 + (p1 - p0) * (0.5 - 0.5 * Math.cos(t * Math.PI));
    const wave = Math.sin(t * Math.PI * 2) * 0.15 * (smoothBase > 0 ? smoothBase : 0.4);
    let intensity = Math.max(0, Number((smoothBase + (smoothBase > 0 ? wave : 0)).toFixed(1)));

    if (smoothBase === 0 && (rainProb > 30 || nextHourProb > 30)) {
      const peakProb = Math.max(rainProb, nextHourProb);
      const drizzlePeak = Math.sin(t * Math.PI) * (peakProb / 80);
      intensity = Math.max(0, Number(drizzlePeak.toFixed(1)));
    }

    let label = 'No rain';
    if (intensity > 4) label = 'Heavy rain';
    else if (intensity > 1.8) label = 'Moderate rain';
    else if (intensity > 0) label = 'Light drizzle';

    items.push({
      minute: i,
      intensity,
      label,
    });
  }
  return items;
}

/**
 * In-memory & LocalStorage Cache for Weather Telemetry
 */
interface CachedWeatherEntry {
  timestamp: number;
  data: {
    current: CurrentWeatherMetrics;
    hourly: HourlyForecastItem[];
    daily: DailyForecastItem[];
  };
}

const WEATHER_CACHE_KEY_PREFIX = 'farmweather_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetch real Open-Meteo Air Quality telemetry (EPA AQI, PM2.5, PM10, Ozone, Pollen)
 */
export async function fetchLiveAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  const url = `${ENV.AIR_QUALITY_API_URL}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&hourly=us_aqi,pm2_5,pm10,ozone,alder_pollen,birch_pollen,grass_pollen,ragweed_pollen&timezone=auto`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const cur = data.current;
    if (!cur) return null;

    const aqi = Math.round(cur.us_aqi ?? 35);
    let category: AirQualityData['category'] = 'Good';
    let healthAdvice = 'Air quality is satisfactory and poses little to no risk.';
    if (aqi > 200) {
      category = 'Very Unhealthy';
      healthAdvice = 'Health warnings of emergency conditions for the entire population.';
    } else if (aqi > 150) {
      category = 'Unhealthy';
      healthAdvice = 'Everyone may begin to experience health effects; sensitive groups more.';
    } else if (aqi > 100) {
      category = 'Unhealthy for Sensitive';
      healthAdvice = 'Members of sensitive groups may experience health effects.';
    } else if (aqi > 50) {
      category = 'Moderate';
      healthAdvice = 'Air quality is acceptable for most; unusually sensitive individuals should take care.';
    }

    const treePollenVal = data.hourly?.birch_pollen?.[0] ?? data.hourly?.alder_pollen?.[0] ?? 0;
    const grassPollenVal = data.hourly?.grass_pollen?.[0] ?? 0;
    const weedPollenVal = data.hourly?.ragweed_pollen?.[0] ?? 0;

    const toPollenLevel = (val: number): 'Low' | 'Moderate' | 'High' | 'Very High' => {
      if (val > 50) return 'Very High';
      if (val > 20) return 'High';
      if (val > 5) return 'Moderate';
      return 'Low';
    };

    return {
      aqi,
      category,
      pm25: Math.round(cur.pm2_5 ?? 8),
      pm10: Math.round(cur.pm10 ?? 14),
      ozone: Math.round(cur.ozone ?? 35),
      no2: Math.round(cur.nitrogen_dioxide ?? 12),
      healthAdvice,
      primaryPollutant: (cur.pm2_5 ?? 0) > (cur.pm10 ?? 0) ? 'PM2.5' : 'Ozone',
      treePollen: toPollenLevel(treePollenVal),
      grassPollen: toPollenLevel(grassPollenVal),
      weedPollen: toPollenLevel(weedPollenVal),
    };
  } catch (e) {
    console.debug('Air quality fetch note:', e);
    return null;
  }
}

/**
 * Fetch live weather metrics and forecasts from Open-Meteo
 */
export async function fetchLiveWeather(
  lat: number = DEFAULT_LOCATIONS[0].latitude, 
  lon: number = DEFAULT_LOCATIONS[0].longitude,
  forceRefresh: boolean = false
): Promise<{
  current: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
  
  // 1. Check valid cached response unless forced refresh
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: CachedWeatherEntry = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch {}
  }

  const url = `${ENV.OPEN_METEO_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,relative_humidity_2m,uv_index,soil_temperature_0cm,soil_moisture_0_to_1cm&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,et0_fao_evapotranspiration&timezone=auto`;

  try {
    // Parallel fetch: Open-Meteo Forecast + Open-Meteo Air Quality
    const [res, airQualityResult] = await Promise.all([
      fetch(url),
      fetchLiveAirQuality(lat, lon)
    ]);

    if (!res.ok) {
      throw new Error(`Weather service returned HTTP ${res.status}`);
    }
    const data = await res.json();

    const cur = data.current;
    const isDay = Boolean(cur.is_day ?? 1);
    const temp = Math.round(cur.temperature_2m);
    const appTemp = Math.round(cur.apparent_temperature ?? temp);
    const hum = Math.round(cur.relative_humidity_2m);
    const dew = calculateDewPoint(temp, hum);
    const windSpd = Math.round(cur.wind_speed_10m);
    const windGst = Math.round(cur.wind_gusts_10m ?? windSpd * 1.3);
    const windDir = Math.round(cur.wind_direction_10m ?? 0);
    const windCardinal = getCardinalDirection(windDir);
    const precip = Number((cur.precipitation ?? 0).toFixed(1));
    const wCode = cur.weather_code ?? 0;
    const clouds = cur.cloud_cover ?? 20;
    const pressure = Math.round(cur.pressure_msl ?? cur.surface_pressure ?? 1013);

    const prevPressure = data.hourly?.surface_pressure?.[0] ?? pressure;
    const pDiff = pressure - prevPressure;
    const pressureTendency: 'rising' | 'falling' | 'steady' = pDiff > 0.8 ? 'rising' : pDiff < -0.8 ? 'falling' : 'steady';

    const wmo = mapWmoCode(wCode);
    const scene = determineSceneAutomatically(wCode, windSpd, precip, isDay);

    const visibilityRaw = data.hourly?.visibility?.[0] ?? 10000;
    const visibilityKm = Math.round(visibilityRaw / 1000);

    const tempMaxToday = Math.round(data.daily?.temperature_2m_max?.[0] ?? temp + 3);
    const tempMinToday = Math.round(data.daily?.temperature_2m_min?.[0] ?? temp - 5);

    const uvMax = Math.round(data.daily?.uv_index_max?.[0] ?? 5);
    let uvLevel = 'Moderate';
    if (uvMax <= 2) uvLevel = 'Low';
    else if (uvMax <= 5) uvLevel = 'Moderate';
    else if (uvMax <= 7) uvLevel = 'High';
    else if (uvMax <= 10) uvLevel = 'Very High';
    else uvLevel = 'Extreme';

    // Format sunrise/sunset in location's local time from ISO string "YYYY-MM-DDTHH:mm"
    const formatLocalTimeStr = (isoTimeStr?: string, fallback: string = '6:00 AM') => {
      if (!isoTimeStr) return fallback;
      try {
        const hr = parseInt(isoTimeStr.slice(11, 13), 10);
        const mn = isoTimeStr.slice(14, 16);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const hr12 = hr % 12 || 12;
        return `${hr12}:${mn} ${ampm}`;
      } catch {
        return fallback;
      }
    };

    const sunriseRaw = data.daily?.sunrise?.[0];
    const sunsetRaw = data.daily?.sunset?.[0];
    const sunriseTime = formatLocalTimeStr(sunriseRaw, '6:24 AM');
    const sunsetTime = formatLocalTimeStr(sunsetRaw, '6:58 PM');

    const moon = calculateMoonPhase();

    const astronomy: AstronomyData = {
      sunrise: sunriseTime,
      sunset: sunsetTime,
      solarNoon: '12:41 PM',
      dayLength: '12h 34m',
      goldenHour: '6:15 PM',
      isDaytime: isDay,
      moonPhase: moon.phase,
      moonIllumination: moon.illumination,
      moonrise: '8:14 PM',
      moonset: '6:42 AM',
    };

    const aqiBase = Math.round(25 + (clouds * 0.15) + (windSpd < 8 ? 20 : 5));
    let aqiCategory: AirQualityData['category'] = 'Good';
    let healthAdvice = 'Air quality is satisfactory and poses little to no risk.';
    if (aqiBase > 100) {
      aqiCategory = 'Unhealthy for Sensitive';
      healthAdvice = 'Sensitive groups should reduce prolonged outdoor exertion.';
    } else if (aqiBase > 50) {
      aqiCategory = 'Moderate';
      healthAdvice = 'Acceptable air quality for most individuals.';
    }

    // Use real measured Open-Meteo Air Quality telemetry when available, fallback gracefully
    const airQuality: AirQualityData = airQualityResult || {
      aqi: aqiBase,
      category: aqiCategory,
      pm25: Math.round(aqiBase * 0.28),
      pm10: Math.round(aqiBase * 0.45),
      ozone: 38,
      no2: 14,
      healthAdvice,
      primaryPollutant: 'PM2.5',
      treePollen: aqiBase > 60 ? 'Moderate' : 'Low',
      grassPollen: 'Low',
      weedPollen: 'Low',
    };

    const currentRainProb = Math.round(data.hourly?.precipitation_probability?.[0] ?? (precip > 0 ? 80 : 10));
    const nextHourPrecip = Number((data.hourly?.precipitation?.[1] ?? 0).toFixed(1));
    const nextHourProb = Math.round(data.hourly?.precipitation_probability?.[1] ?? currentRainProb);

    const nextHourRain = generateMinuteCast(precip, currentRainProb, nextHourPrecip, nextHourProb);

    const soilTempRaw = data.hourly?.soil_temperature_0cm?.[0];
    const soilMoistRaw = data.hourly?.soil_moisture_0_to_1cm?.[0];
    const et0Raw = data.daily?.et0_fao_evapotranspiration?.[0];

    const soilTemp = soilTempRaw !== undefined ? Math.round(soilTempRaw) : Math.round(temp - 1);
    const soilMoist = soilMoistRaw !== undefined ? Math.round(soilMoistRaw * 100) : Math.min(85, Math.max(20, Math.round(hum * 0.65)));
    const et0 = et0Raw !== undefined ? Number(et0Raw.toFixed(1)) : Number((0.0023 * (temp + 17.8) * Math.sqrt(Math.max(1, windSpd)) * 1.8).toFixed(1));

    // Formatted timestamp in selected location's local time zone
    const locationTimeFormatted = (() => {
      try {
        if (data.timezone) {
          return new Intl.DateTimeFormat('en-US', {
            timeZone: data.timezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).format(new Date());
        }
      } catch (tzErr) {
        console.debug('Timezone formatting note:', tzErr);
      }
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    })();

    const currentMetrics: CurrentWeatherMetrics = {
      temperature: temp,
      apparentTemperature: appTemp,
      tempMinToday,
      tempMaxToday,
      humidity: hum,
      dewPoint: dew,
      windSpeed: windSpd,
      windGusts: windGst,
      windDirection: windDir,
      windDirectionCardinal: windCardinal,
      pressure,
      pressureTendency,
      visibility: visibilityKm,
      cloudCover: clouds,
      uvIndex: uvMax,
      uvLevel,
      rainChance: currentRainProb,
      precipitationAmount: precip,
      precipitationRate: precip > 0 ? precip * 1.5 : 0,
      weatherCode: wCode,
      conditionTitle: wmo.title,
      conditionDescription: wmo.description,
      sceneState: scene,
      isDaytime: isDay,
      lastUpdated: locationTimeFormatted,
      isLive: true,
      airQuality,
      astronomy,
      nextHourRain,
      soilTemperature: soilTemp,
      soilMoisture: soilMoist,
      evapotranspiration: et0,
    };

    const hourlyItems: HourlyForecastItem[] = [];
    const hTimes = data.hourly?.time || [];
    const hTemps = data.hourly?.temperature_2m || [];
    const hApparent = data.hourly?.apparent_temperature || [];
    const hCodes = data.hourly?.weather_code || [];
    const hProbs = data.hourly?.precipitation_probability || [];
    const hPrecip = data.hourly?.precipitation || [];
    const hWind = data.hourly?.wind_speed_10m || [];
    const hHum = data.hourly?.relative_humidity_2m || [];
    const hUv = data.hourly?.uv_index || [];

    // Find the starting index for current hour in location's timeline
    const curTimePrefix = (cur.time || '').slice(0, 13); // e.g. "2026-10-11T10"
    let startIndex = hTimes.findIndex((t: string) => t.slice(0, 13) === curTimePrefix);
    if (startIndex === -1 && cur.time) {
      startIndex = hTimes.findIndex((t: string) => t >= cur.time);
    }
    if (startIndex === -1 || startIndex >= hTimes.length) {
      startIndex = 0;
    }

    const maxForecastHours = Math.min(startIndex + 24, hTimes.length);
    for (let i = startIndex; i < maxForecastHours; i++) {
      const isCurrentObservation = i === startIndex;
      const timeStr = hTimes[i] || '';
      const hour24 = parseInt(timeStr.slice(11, 13), 10);
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      const hour12 = hour24 % 12 || 12;
      const hourLabel = isCurrentObservation ? 'Now' : `${hour12} ${ampm}`;

      // Shared weather observation consistency:
      // When representing the current observation ("Now"), the forecast temperature
      // MUST agree with the current temperature.
      const itemTemp = isCurrentObservation ? temp : Math.round(hTemps[i] ?? temp);
      const itemApparent = isCurrentObservation ? appTemp : Math.round(hApparent[i] ?? temp);
      const itemCode = isCurrentObservation ? wCode : (hCodes[i] ?? 0);
      const itemRainProb = isCurrentObservation ? currentRainProb : Math.round(hProbs[i] ?? 0);

      hourlyItems.push({
        time: timeStr,
        hour: hourLabel,
        temperature: itemTemp,
        apparentTemp: itemApparent,
        weatherCode: itemCode,
        conditionTitle: mapWmoCode(itemCode).title,
        rainProbability: itemRainProb,
        precipitationAmount: Number((hPrecip[i] ?? 0).toFixed(1)),
        windSpeed: Math.round(hWind[i] ?? windSpd),
        humidity: Math.round(hHum[i] ?? hum),
        uvIndex: Math.round(hUv[i] ?? 0),
        isCurrent: isCurrentObservation,
      });
    }

    const dailyItems: DailyForecastItem[] = [];
    const dTimes = data.daily?.time || [];
    const dCodes = data.daily?.weather_code || [];
    const dMin = data.daily?.temperature_2m_min || [];
    const dMax = data.daily?.temperature_2m_max || [];
    const dProb = data.daily?.precipitation_probability_max || [];
    const dPrecipSum = data.daily?.precipitation_sum || [];
    const dUv = data.daily?.uv_index_max || [];
    const dWind = data.daily?.wind_speed_10m_max || [];
    const dWindDir = data.daily?.wind_direction_10m_dominant || [];
    const dEt0 = data.daily?.et0_fao_evapotranspiration || [];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < Math.min(7, dTimes.length); i++) {
      const d = new Date(dTimes[i]);
      const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];
      const code = dCodes[i] ?? 0;
      const wInfo = mapWmoCode(code);
      const pSum = Number((dPrecipSum[i] ?? 0).toFixed(1));
      const pProb = Math.round(dProb[i] ?? 10);
      const windDirDeg = Math.round(dWindDir[i] ?? 0);

      const itemMin = i === 0 ? tempMinToday : Math.round(dMin[i] ?? temp - 6);
      const itemMax = i === 0 ? tempMaxToday : Math.round(dMax[i] ?? temp + 4);

      dailyItems.push({
        date: dTimes[i],
        dayName,
        weatherCode: code,
        conditionDescription: wInfo.title,
        tempMin: itemMin,
        tempMax: itemMax,
        rainProbability: pProb,
        precipitationSum: pSum,
        uvIndexMax: Math.round(dUv[i] ?? 5),
        humidity: Math.min(96, Math.max(42, Math.round(hum + (pProb > 50 ? 12 : -8)))),
        windSpeedMax: Math.round(dWind[i] ?? windSpd),
        windDirectionCardinal: getCardinalDirection(windDirDeg),
        precipitationHours: pSum > 5 ? 5 : pProb > 40 ? 2 : 0,
        evapotranspiration: dEt0[i] !== undefined ? Number(dEt0[i].toFixed(1)) : et0,
      });
    }

    const result = {
      current: currentMetrics,
      hourly: hourlyItems,
      daily: dailyItems,
    };

    // Store in localStorage cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: result
      }));
    } catch {}

    return result;
  } catch (err) {
    console.error('fetchLiveWeather error:', err);
    throw err;
  }
}

/**
 * Reverse geocode latitude/longitude coordinates
 */
export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  // Tier 1: BigDataCloud Reverse Geocoding Client
  try {
    const url = `${ENV.REVERSE_GEOCODE_API_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const region = data.principalSubdivision || data.countryName || '';
      const country = data.countryName || '';
      if (city) {
        return {
          id: `gps_loc_${Date.now()}`,
          name: city,
          region,
          country,
          latitude: lat,
          longitude: lon,
          isCurrent: true,
        };
      }
    }
  } catch (e) {
    console.debug('BigDataCloud reverse geocode note:', e);
  }

  // Tier 2: OpenStreetMap Nominatim reverse geocode fallback
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const osmRes = await fetch(osmUrl, {
      headers: { 'Accept-Language': 'en' }
    });
    if (osmRes.ok) {
      const osmData = await osmRes.json();
      const addr = osmData.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county;
      const stateName = addr.state || addr.region || '';
      const countryName = addr.country || '';
      if (cityName) {
        return {
          id: `gps_loc_${Date.now()}`,
          name: cityName,
          region: stateName,
          country: countryName,
          latitude: lat,
          longitude: lon,
          isCurrent: true,
        };
      }
    }
  } catch (osmErr) {
    console.debug('OSM reverse geocode note:', osmErr);
  }

  // Fallback: Real GPS coordinate label, never a fake city
  const latStr = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
  const lonStr = lon >= 0 ? `${lon.toFixed(2)}°E` : `${Math.abs(lon).toFixed(2)}°W`;

  return {
    id: `gps_loc_${Date.now()}`,
    name: `${latStr}, ${lonStr}`,
    region: 'GPS Fix',
    country: 'Device Location',
    latitude: lat,
    longitude: lon,
    isCurrent: true,
  };
}

/**
 * Search locations using Geocoding API
 */
export async function searchLocations(query: string): Promise<LocationInfo[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `${ENV.GEOCODING_API_URL}?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to search locations');
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any, idx: number) => ({
      id: `loc_${item.id || idx}_${Date.now()}`,
      name: item.name,
      region: item.admin1 || item.admin2 || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));
  } catch (e) {
    console.error('searchLocations error:', e);
    return [];
  }
}

/**
 * Detect severe weather warnings
 */
export function detectSevereWeatherAlerts(metrics: CurrentWeatherMetrics): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  if (metrics.windGusts >= 35 || metrics.windSpeed >= 28) {
    alerts.push({
      id: 'alert_wind_' + metrics.windGusts,
      type: 'wind',
      severity: metrics.windGusts >= 45 ? 'warning' : 'advisory',
      title: metrics.windGusts >= 45 ? 'High Wind Warning' : 'Wind Advisory',
      message: `Damaging gusts up to ${metrics.windGusts} km/h expected. Secure loose outdoor objects and exercise caution while driving high-profile vehicles.`,
      recommendation: 'Seek shelter in sturdy structures and avoid wooded areas where branches may fall.',
      actionText: 'View Wind Precautions',
      actionType: 'wind_safety',
      affectedArea: 'Metropolitan & Coastal Ridges',
      effectiveTime: 'Active Now • Until 8:00 PM',
      icon: 'Wind',
    });
  }

  if (metrics.temperature <= 2) {
    alerts.push({
      id: 'alert_freeze_' + metrics.temperature,
      type: 'frost',
      severity: metrics.temperature <= -2 ? 'warning' : 'advisory',
      title: metrics.temperature <= -2 ? 'Hard Freeze Warning' : 'Frost Advisory',
      message: `Sub-freezing temperatures (${metrics.temperature}°C) will result in frost and ice formation on exposed roads, bridges, and vegetation.`,
      recommendation: 'Protect sensitive plants, insulate outdoor water pipes, and check on pets.',
      actionText: 'Freeze Safety Tips',
      actionType: 'freeze_safety',
      affectedArea: 'Valleys & Lowland Basins',
      effectiveTime: 'Overnight • 2:00 AM – 8:00 AM',
      icon: 'Snowflake',
    });
  }

  if (metrics.temperature >= 35 || metrics.apparentTemperature >= 38) {
    alerts.push({
      id: 'alert_heat_' + metrics.temperature,
      type: 'heat',
      severity: metrics.temperature >= 38 ? 'warning' : 'advisory',
      title: 'Excessive Heat Advisory',
      message: `Dangerous heat index values reaching ${metrics.apparentTemperature}°C. High risk of heat-related illnesses during prolonged outdoor exposure.`,
      recommendation: 'Drink plentiful fluids, remain in air-conditioned spaces, and never leave children or pets unattended in vehicles.',
      actionText: 'Heat Safety Guidelines',
      actionType: 'heat_safety',
      affectedArea: 'Urban Basin & Inland Valleys',
      effectiveTime: 'Daily • 11:00 AM – 7:00 PM',
      icon: 'Sun',
    });
  }

  if ([95, 96, 99].includes(metrics.weatherCode)) {
    alerts.push({
      id: 'alert_storm_' + metrics.weatherCode,
      type: 'storm',
      severity: 'warning',
      title: 'Severe Thunderstorm Warning',
      message: 'Potentially dangerous storm with frequent cloud-to-ground lightning, localized flash flooding, and hail.',
      recommendation: 'Move indoors away from windows immediately. Avoid using corded electronics and plumbing.',
      actionText: 'Storm Safety Plan',
      actionType: 'storm_safety',
      affectedArea: 'Regional Radar Corridor',
      effectiveTime: 'Next 90 minutes',
      icon: 'Zap',
    });
  }

  return alerts;
}
