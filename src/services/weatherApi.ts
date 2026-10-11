import { 
  CurrentWeatherMetrics, 
  DailyForecastItem, 
  HourlyForecastItem, 
  LocationInfo, 
  WeatherAlert, 
  WeatherSceneState,
  AirQualityData,
  AstronomyData,
  MinuteRainItem
} from '../types/weather';

export const DEFAULT_LOCATIONS: LocationInfo[] = [
  { id: 'loc_sf', name: 'San Francisco', region: 'California', country: 'United States', latitude: 37.77, longitude: -122.42, timezone: 'America/Los_Angeles', isCurrent: true },
  { id: 'loc_tokyo', name: 'Tokyo', region: 'Kanto', country: 'Japan', latitude: 35.68, longitude: 139.69, timezone: 'Asia/Tokyo' },
  { id: 'loc_london', name: 'London', region: 'Greater London', country: 'United Kingdom', latitude: 51.51, longitude: -0.13, timezone: 'Europe/London' },
  { id: 'loc_paris', name: 'Paris', region: 'Île-de-France', country: 'France', latitude: 48.85, longitude: 2.35, timezone: 'Europe/Paris' },
  { id: 'loc_nyc', name: 'New York', region: 'New York', country: 'United States', latitude: 40.71, longitude: -74.01, timezone: 'America/New_York' },
  { id: 'loc_sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', latitude: -33.87, longitude: 151.21, timezone: 'Australia/Sydney' },
];

// Map WMO weather codes to user-friendly titles and descriptions
export function mapWmoCode(code: number): { title: string; description: string; icon: string } {
  switch (code) {
    case 0:
      return { title: 'Clear Sky', description: 'Crystal clear conditions and excellent visibility', icon: 'Sun' };
    case 1:
      return { title: 'Mainly Clear', description: 'Sun with sparse, high-altitude passing clouds', icon: 'Sun' };
    case 2:
      return { title: 'Partly Cloudy', description: 'Scattered clouds with frequent sunny intervals', icon: 'CloudSun' };
    case 3:
      return { title: 'Overcast', description: 'Dense cloud canopy with low diffuse sunlight', icon: 'Cloud' };
    case 45:
    case 48:
      return { title: 'Fog & Mist', description: 'Reduced surface visibility and high moisture', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { title: 'Light Drizzle', description: 'Fine mist and intermittent soft droplets', icon: 'CloudDrizzle' };
    case 61:
    case 63:
    case 65:
      return { title: 'Rain Shower', description: 'Steady rainfall with active ground runoff', icon: 'CloudRain' };
    case 71:
    case 73:
    case 75:
      return { title: 'Snowfall', description: 'Gentle falling snow flurries', icon: 'Snowflake' };
    case 80:
    case 81:
    case 82:
      return { title: 'Heavy Showers', description: 'Intense rain downpours and low cloud base', icon: 'CloudRainWind' };
    case 95:
    case 96:
    case 99:
      return { title: 'Thunderstorm', description: 'Convective storm with lightning and heavy rain', icon: 'CloudLightning' };
    default:
      return { title: 'Partly Cloudy', description: 'Pleasant atmospheric conditions', icon: 'CloudSun' };
  }
}

// Convert degrees to cardinal compass direction
export function getCardinalDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

// Calculate dew point Magnus-Tetens formula
export function calculateDewPoint(temp: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  const dew = (b * alpha) / (a - alpha);
  return Math.round(dew);
}

// Calculate Moon Phase & Illumination
export function calculateMoonPhase(): { phase: AstronomyData['moonPhase']; illumination: number } {
  const now = new Date();
  // Known reference new moon: Jan 11, 2024
  const refNewMoon = new Date(2024, 0, 11, 11, 57);
  const diffDays = (now.getTime() - refNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.53058867;
  const phaseCycle = (diffDays % synodicMonth + synodicMonth) % synodicMonth;
  const phaseFraction = phaseCycle / synodicMonth;

  let phase: AstronomyData['moonPhase'] = 'Waxing Crescent';
  let illumination = Math.round((1 - Math.cos(2 * Math.PI * phaseFraction)) / 2 * 100);

  if (phaseFraction < 0.03 || phaseFraction > 0.97) phase = 'New Moon';
  else if (phaseFraction < 0.22) phase = 'Waxing Crescent';
  else if (phaseFraction < 0.28) phase = 'First Quarter';
  else if (phaseFraction < 0.47) phase = 'Waxing Gibbous';
  else if (phaseFraction < 0.53) phase = 'Full Moon';
  else if (phaseFraction < 0.72) phase = 'Waning Gibbous';
  else if (phaseFraction < 0.78) phase = 'Last Quarter';
  else phase = 'Waning Crescent';

  return { phase, illumination };
}

// Automatically determine scene state from live weather data and day/night cycle
export function determineSceneAutomatically(
  code: number, 
  windSpeed: number, 
  rainAmount: number, 
  isDaytime: boolean
): WeatherSceneState {
  // If storm
  if ([95, 96, 99].includes(code)) {
    return 'storm';
  }
  // If actively raining
  if (rainAmount > 0.4 || [61, 63, 65, 80, 81, 82].includes(code)) {
    return 'rain_shower';
  }
  // If high wind
  if (windSpeed > 24) {
    return 'wind_picking_up';
  }
  // Night scene
  if (!isDaytime) {
    if ([2, 3, 45, 48].includes(code)) {
      return 'night_cloudy';
    }
    return 'night_clear';
  }
  // Daytime cloudy vs sunny vs clearing up
  if ([2, 3, 45, 48].includes(code)) {
    return 'clouds_rolling_in';
  }
  if (code === 0 || code === 1) {
    return 'sunny';
  }
  return 'clearing_up';
}

// Generate next hour minute-by-minute rain curve (MinuteCast)
export function generateMinuteCast(
  currentPrecip: number, 
  rainProb: number,
  nextHourPrecip: number = 0,
  nextHourProb: number = 0
): MinuteRainItem[] {
  const items: MinuteRainItem[] = [];
  
  // Determine start, peak, and end intensities
  const p0 = currentPrecip > 0 ? currentPrecip : (rainProb > 25 ? (rainProb - 10) / 20 : 0);
  const p1 = nextHourPrecip > 0 ? nextHourPrecip : (nextHourProb > 25 ? (nextHourProb - 10) / 20 : 0);

  for (let i = 0; i <= 60; i += 5) {
    const t = i / 60; // 0 to 1
    
    // Smooth cosine interpolation between current hour precip and next hour precip
    const smoothBase = p0 + (p1 - p0) * (0.5 - 0.5 * Math.cos(t * Math.PI));
    
    // Add realistic micro-variations (wave modulation)
    const wave = Math.sin(t * Math.PI * 2) * 0.15 * (smoothBase > 0 ? smoothBase : 0.4);
    let intensity = Math.max(0, Number((smoothBase + (smoothBase > 0 ? wave : 0)).toFixed(1)));

    if (smoothBase === 0 && (rainProb > 30 || nextHourProb > 30)) {
      // If probability exists but precip is small, generate subtle light drizzle band
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

// Fetch live weather from Open-Meteo
export async function fetchLiveWeather(
  lat: number = DEFAULT_LOCATIONS[0].latitude, 
  lon: number = DEFAULT_LOCATIONS[0].longitude
): Promise<{
  current: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,relative_humidity_2m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo fetch failed (${res.status})`);
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

  // Pressure tendency calculation from previous hour if available
  const prevPressure = data.hourly?.surface_pressure?.[0] ?? pressure;
  const pDiff = pressure - prevPressure;
  const pressureTendency: 'rising' | 'falling' | 'steady' = pDiff > 0.8 ? 'rising' : pDiff < -0.8 ? 'falling' : 'steady';

  const wmo = mapWmoCode(wCode);
  const scene = determineSceneAutomatically(wCode, windSpd, precip, isDay);

  // Visibility from hourly data (convert m to km)
  const visibilityRaw = data.hourly?.visibility?.[0] ?? 10000;
  const visibilityKm = Math.round(visibilityRaw / 1000);

  // Daily min/max for today
  const tempMaxToday = Math.round(data.daily?.temperature_2m_max?.[0] ?? temp + 3);
  const tempMinToday = Math.round(data.daily?.temperature_2m_min?.[0] ?? temp - 5);

  // UV index
  const uvMax = Math.round(data.daily?.uv_index_max?.[0] ?? 5);
  let uvLevel = 'Moderate';
  if (uvMax <= 2) uvLevel = 'Low';
  else if (uvMax <= 5) uvLevel = 'Moderate';
  else if (uvMax <= 7) uvLevel = 'High';
  else if (uvMax <= 10) uvLevel = 'Very High';
  else uvLevel = 'Extreme';

  // Astronomy
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

  // Air Quality Estimation based on atmospheric telemetry
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

  // Next-Hour MinuteCast rain curve with actual hourly telemetry
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

  // Hourly items
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

  // Daily items
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
}

// Reverse geocode latitude/longitude coordinates to human-readable city/region
export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
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

// Search locations using Open-Meteo Geocoding API
export async function searchLocations(query: string): Promise<LocationInfo[]> {
  if (!query || query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
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
}

// Detect severe weather warnings from meteorologic thresholds
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
