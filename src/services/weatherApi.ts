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
 * Fetch live weather metrics and forecasts from Open-Meteo
 */
export async function fetchLiveWeather(
  lat: number = DEFAULT_LOCATIONS[0].latitude, 
  lon: number = DEFAULT_LOCATIONS[0].longitude
): Promise<{
  current: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  const url = `${ENV.OPEN_METEO_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,relative_humidity_2m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`;

  try {
    const res = await fetch(url);
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

    const sunriseRaw = data.daily?.sunrise?.[0];
    const sunsetRaw = data.daily?.sunset?.[0];
    const sunriseTime = sunriseRaw ? new Date(sunriseRaw).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '6:24 AM';
    const sunsetTime = sunsetRaw ? new Date(sunsetRaw).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '6:58 PM';

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

    const airQuality: AirQualityData = {
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
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLive: true,
      airQuality,
      astronomy,
      nextHourRain,
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

    const currentHour = new Date().getHours();
    for (let i = 0; i < Math.min(24, hTimes.length); i++) {
      const d = new Date(hTimes[i]);
      const hr = d.getHours();
      hourlyItems.push({
        time: hTimes[i],
        hour: hr === currentHour ? 'Now' : `${hr % 12 || 12} ${hr >= 12 ? 'PM' : 'AM'}`,
        temperature: Math.round(hTemps[i] ?? temp),
        apparentTemp: Math.round(hApparent[i] ?? temp),
        weatherCode: hCodes[i] ?? 0,
        rainProbability: Math.round(hProbs[i] ?? 0),
        precipitationAmount: Number((hPrecip[i] ?? 0).toFixed(1)),
        windSpeed: Math.round(hWind[i] ?? windSpd),
        humidity: Math.round(hHum[i] ?? hum),
        uvIndex: Math.round(hUv[i] ?? 0),
        isCurrent: hr === currentHour,
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

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < Math.min(7, dTimes.length); i++) {
      const d = new Date(dTimes[i]);
      const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];
      const code = dCodes[i] ?? 0;
      const wInfo = mapWmoCode(code);
      const pSum = Number((dPrecipSum[i] ?? 0).toFixed(1));
      const pProb = Math.round(dProb[i] ?? 10);
      const windDirDeg = Math.round(dWindDir[i] ?? 0);

      dailyItems.push({
        date: dTimes[i],
        dayName,
        weatherCode: code,
        conditionDescription: wInfo.title,
        tempMin: Math.round(dMin[i] ?? temp - 6),
        tempMax: Math.round(dMax[i] ?? temp + 4),
        rainProbability: pProb,
        precipitationSum: pSum,
        uvIndexMax: Math.round(dUv[i] ?? 5),
        humidity: Math.min(96, Math.max(42, Math.round(hum + (pProb > 50 ? 12 : -8)))),
        windSpeedMax: Math.round(dWind[i] ?? windSpd),
        windDirectionCardinal: getCardinalDirection(windDirDeg),
        precipitationHours: pSum > 5 ? 5 : pProb > 40 ? 2 : 0,
      });
    }

    return {
      current: currentMetrics,
      hourly: hourlyItems,
      daily: dailyItems,
    };
  } catch (err) {
    console.error('fetchLiveWeather error:', err);
    throw err;
  }
}

/**
 * Reverse geocode latitude/longitude coordinates
 */
export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  try {
    const url = `${ENV.REVERSE_GEOCODE_API_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const region = data.principalSubdivision || data.locality || '';
      const country = data.countryName || '';
      return {
        id: `gps_loc_${Date.now()}`,
        name,
        region,
        country,
        latitude: lat,
        longitude: lon,
        isCurrent: true,
      };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }
  return {
    id: `gps_loc_${Date.now()}`,
    name: 'Current Location',
    region: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    country: 'GPS Detected',
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
