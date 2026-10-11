/**
 * Application Environment & Constant Configuration
 * Centralized configuration separating environmental variables, endpoint URLs, and default app settings.
 */

import { LocationInfo } from '../types/weather';

export const ENV = {
  OPEN_METEO_API_URL: import.meta.env.VITE_OPEN_METEO_API_URL || 'https://api.open-meteo.com/v1/forecast',
  GEOCODING_API_URL: import.meta.env.VITE_GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com/v1/search',
  REVERSE_GEOCODE_API_URL: import.meta.env.VITE_REVERSE_GEOCODE_API_URL || 'https://api.bigdatacloud.net/data/reverse-geocode-client',
  TTS_VOICE_API_URL: 'https://api.streamelements.com/kappa/v2/speech',
} as const;

export const STORAGE_KEYS = {
  SAVED_LOCATIONS: 'weatherapp_saved_locations',
  ACTIVE_LOCATION: 'weatherapp_active_location',
  THEME_PREFERENCES: 'weatherapp_theme_prefs',
} as const;

export const DEFAULT_LOCATIONS: LocationInfo[] = [
  { 
    id: 'loc_sf', 
    name: 'San Francisco', 
    region: 'California', 
    country: 'United States', 
    latitude: 37.77, 
    longitude: -122.42, 
    timezone: 'America/Los_Angeles', 
    isCurrent: true 
  },
  { 
    id: 'loc_tokyo', 
    name: 'Tokyo', 
    region: 'Kanto', 
    country: 'Japan', 
    latitude: 35.68, 
    longitude: 139.69, 
    timezone: 'Asia/Tokyo' 
  },
  { 
    id: 'loc_london', 
    name: 'London', 
    region: 'Greater London', 
    country: 'United Kingdom', 
    latitude: 51.51, 
    longitude: -0.13, 
    timezone: 'Europe/London' 
  },
  { 
    id: 'loc_paris', 
    name: 'Paris', 
    region: 'Île-de-France', 
    country: 'France', 
    latitude: 48.85, 
    longitude: 2.35, 
    timezone: 'Europe/Paris' 
  },
  { 
    id: 'loc_nyc', 
    name: 'New York', 
    region: 'New York', 
    country: 'United States', 
    latitude: 40.71, 
    longitude: -74.01, 
    timezone: 'America/New_York' 
  },
  { 
    id: 'loc_sydney', 
    name: 'Sydney', 
    region: 'New South Wales', 
    country: 'Australia', 
    latitude: -33.87, 
    longitude: 151.21, 
    timezone: 'Australia/Sydney' 
  },
];
