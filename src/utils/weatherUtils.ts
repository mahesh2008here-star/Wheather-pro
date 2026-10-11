/**
 * Core Weather Calculation & Transformation Utilities
 * Pure functions for atmospheric mathematics, astronomical cycles, and WMO code translations.
 */

import { AstronomyData, WeatherSceneState } from '../types/weather';

/**
 * Map WMO (World Meteorological Organization) weather codes to descriptive title & icon
 */
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

/**
 * Convert degree azimuth angle to cardinal direction
 */
export function getCardinalDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate dew point using the Magnus-Tetens formula
 */
export function calculateDewPoint(tempCelsius: number, humidityPercent: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempCelsius) / (b + tempCelsius)) + Math.log(humidityPercent / 100);
  const dew = (b * alpha) / (a - alpha);
  return Math.round(dew);
}

/**
 * Calculate Moon Phase and illumination percentage
 */
export function calculateMoonPhase(): { phase: AstronomyData['moonPhase']; illumination: number } {
  const now = new Date();
  const refNewMoon = new Date(2024, 0, 11, 11, 57);
  const diffDays = (now.getTime() - refNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.53058867;
  const phaseCycle = (diffDays % synodicMonth + synodicMonth) % synodicMonth;
  const phaseFraction = phaseCycle / synodicMonth;

  let phase: AstronomyData['moonPhase'] = 'Waxing Crescent';
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * phaseFraction)) / 2 * 100);

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

/**
 * Determine animated visual scene state based on weather code, wind speed, precipitation and daylight
 */
export function determineSceneAutomatically(
  wCode: number, 
  windSpeed: number, 
  rainAmount: number, 
  isDaytime: boolean
): WeatherSceneState {
  if ([95, 96, 99].includes(wCode)) {
    return 'storm';
  }
  if (rainAmount > 0.4 || [61, 63, 65, 80, 81, 82].includes(wCode)) {
    return 'rain_shower';
  }
  if (windSpeed > 24) {
    return 'wind_picking_up';
  }
  if (!isDaytime) {
    if ([2, 3, 45, 48].includes(wCode)) {
      return 'night_cloudy';
    }
    return 'night_clear';
  }
  if ([2, 3, 45, 48].includes(wCode)) {
    return 'clouds_rolling_in';
  }
  if (wCode === 0 || wCode === 1) {
    return 'sunny';
  }
  return 'clearing_up';
}
