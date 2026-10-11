export type WeatherSceneState = 
  | 'sunny' 
  | 'night_clear'
  | 'clouds_rolling_in' 
  | 'night_cloudy'
  | 'wind_picking_up' 
  | 'rain_shower' 
  | 'storm'
  | 'clearing_up';

export interface LocationInfo {
  id: string;
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isCurrent?: boolean;
}

export interface AirQualityData {
  aqi: number; // 0-500 scale
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  healthAdvice: string;
  primaryPollutant: string;
  treePollen: 'Low' | 'Moderate' | 'High' | 'Very High';
  grassPollen: 'Low' | 'Moderate' | 'High';
  weedPollen: 'Low' | 'Moderate' | 'High';
}

export interface AstronomyData {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: string;
  goldenHour: string;
  isDaytime: boolean;
  moonPhase: 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';
  moonIllumination: number; // 0-100%
  moonrise: string;
  moonset: string;
}

export interface MinuteRainItem {
  minute: number; // 0-60
  intensity: number; // 0-10 mm/h
  label: string;
}

export interface CurrentWeatherMetrics {
  temperature: number;
  apparentTemperature: number;
  tempMinToday: number;
  tempMaxToday: number;
  humidity: number;
  dewPoint: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  windDirectionCardinal: string;
  pressure: number; // hPa
  pressureTendency: 'rising' | 'falling' | 'steady';
  visibility: number; // km
  cloudCover: number; // %
  uvIndex: number;
  uvLevel: string;
  rainChance: number; // %
  precipitationAmount: number; // mm
  precipitationRate: number; // mm/h
  weatherCode: number;
  conditionTitle: string;
  conditionDescription: string;
  sceneState: WeatherSceneState;
  isDaytime: boolean;
  lastUpdated: string;
  isLive: boolean;
  airQuality: AirQualityData;
  astronomy: AstronomyData;
  nextHourRain: MinuteRainItem[];
  soilTemperature?: number;
  soilMoisture?: number;
  evapotranspiration?: number;
}

export interface HourlyForecastItem {
  time: string;
  hour: string;
  temperature: number;
  apparentTemp?: number;
  weatherCode: number;
  rainProbability: number;
  precipitationAmount?: number;
  windSpeed?: number;
  humidity?: number;
  uvIndex?: number;
  isCurrent?: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  weatherCode: number;
  conditionDescription: string;
  tempMin: number;
  tempMax: number;
  rainProbability: number;
  precipitationSum: number;
  uvIndexMax: number;
  humidity: number;
  windSpeedMax: number;
  windDirectionCardinal?: string;
  precipitationHours: number;
  evapotranspiration?: number;
}

export type WeatherAlertSeverity = 'warning' | 'advisory' | 'watch';
export type WeatherAlertType = 'frost' | 'wind' | 'rain' | 'heat' | 'storm';

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  severity: WeatherAlertSeverity;
  title: string;
  message: string;
  recommendation: string;
  actionText: string;
  actionType: string;
  affectedArea: string;
  effectiveTime: string;
  icon: string;
}
