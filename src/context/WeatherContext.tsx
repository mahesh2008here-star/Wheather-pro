import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { 
  CurrentWeatherMetrics, 
  DailyForecastItem, 
  HourlyForecastItem, 
  LocationInfo, 
  WeatherAlert, 
  WeatherSceneState 
} from '../types/weather';
import { 
  DEFAULT_LOCATIONS, 
} from '../services/weatherApi';
import { 
  detectUserLocation, 
  checkLocationPermission, 
  requestLocationPermission,
  LocationServiceError 
} from '../services/locationService';
import { 
  weatherRefreshService, 
  UnifiedWeatherStore, 
  WeatherDataState 
} from '../services/weatherRefreshService';
import { STORAGE_KEYS } from '../config/env';

interface WeatherContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  activeLocation: LocationInfo;
  savedLocations: LocationInfo[];
  metrics: CurrentWeatherMetrics;
  dailyForecast: DailyForecastItem[];
  hourlyForecast: HourlyForecastItem[];
  alerts: WeatherAlert[];
  isLoading: boolean;
  isLocating: boolean;
  locationStatus: string | null;
  locationError: string | null;
  isPermissionPermanentlyDenied: boolean;
  showFirstLaunchLocationModal: boolean;
  error: string | null;
  dataState: WeatherDataState;
  isStale: boolean;
  ageMinutes: number;
  lastUpdatedLabel: string;
  provider: string;
  dataQuality: string;
  previewScene: WeatherSceneState | null;
  setPreviewScene: (scene: WeatherSceneState | null) => void;
  selectLocation: (loc: LocationInfo) => void;
  addLocation: (loc: LocationInfo) => void;
  deleteLocation: (id: string) => void;
  refreshWeather: () => Promise<void>;
  detectGpsLocation: (isInitialAutoRefresh?: boolean) => Promise<void>;
  clearLocationStatus: () => void;
  clearLocationError: () => void;
  acceptFirstLaunchLocationPrompt: () => Promise<void>;
  dismissFirstLaunchLocationPrompt: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [previewScene, setPreviewScene] = useState<WeatherSceneState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isPermissionPermanentlyDenied, setIsPermissionPermanentlyDenied] = useState<boolean>(false);
  const [showFirstLaunchLocationModal, setShowFirstLaunchLocationModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data Quality & Freshness State (Single Source of Truth)
  const [dataState, setDataState] = useState<WeatherDataState>('fresh');
  const [isStale, setIsStale] = useState<boolean>(false);
  const [ageMinutes, setAgeMinutes] = useState<number>(0);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string>('Updated 12:00 PM');
  const [provider, setProvider] = useState<string>('Open-Meteo ECMWF / GFS IFS');
  const [dataQuality, setDataQuality] = useState<string>('Verified schema • 16 parameters');

  // Saved Locations State
  const [savedLocations, setSavedLocations] = useState<LocationInfo[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved locations:', e);
    }
    return DEFAULT_LOCATIONS;
  });

  // Active Location State
  const [activeLocation, setActiveLocation] = useState<LocationInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_LOCATION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && typeof parsed.latitude === 'number') return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse active location:', e);
    }
    return DEFAULT_LOCATIONS[0];
  });

  const activeLocationRef = useRef(activeLocation);
  activeLocationRef.current = activeLocation;

  // Save locations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(savedLocations));
    } catch (e) {
      console.warn('Failed to save locations:', e);
    }
  }, [savedLocations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LOCATION, JSON.stringify(activeLocation));
    } catch (e) {
      console.warn('Failed to save active location:', e);
    }
  }, [activeLocation]);

  // Current Live Weather Metrics
  const [metrics, setMetrics] = useState<CurrentWeatherMetrics>({
    temperature: 24,
    apparentTemperature: 23,
    tempMinToday: 18,
    tempMaxToday: 26,
    humidity: 68,
    dewPoint: 17,
    windSpeed: 14,
    windGusts: 20,
    windDirection: 245,
    windDirectionCardinal: 'WSW',
    pressure: 1016,
    pressureTendency: 'steady',
    visibility: 10,
    cloudCover: 25,
    uvIndex: 5,
    uvLevel: 'Moderate',
    rainChance: 12,
    precipitationAmount: 0.0,
    precipitationRate: 0.0,
    weatherCode: 1,
    conditionTitle: 'Mainly Clear',
    conditionDescription: 'Ideal dry field conditions for spraying and harvesting operations',
    sceneState: 'sunny',
    isDaytime: true,
    lastUpdated: '12:00 PM',
    isLive: false,
    soilTemperature: 20,
    soilMoisture: 45,
    evapotranspiration: 3.2,
    airQuality: {
      aqi: 32,
      category: 'Good',
      primaryPollutant: 'PM2.5',
      pm25: 7.8,
      pm10: 14.2,
      ozone: 42.1,
      no2: 8.5,
      healthAdvice: 'Ideal conditions for crop spraying and field operations.',
      treePollen: 'Low',
      grassPollen: 'Low',
      weedPollen: 'Low'
    },
    astronomy: {
      sunrise: '6:24 AM',
      sunset: '7:48 PM',
      solarNoon: '1:06 PM',
      dayLength: '13h 24m',
      goldenHour: '7:15 PM',
      isDaytime: true,
      moonPhase: 'Waxing Gibbous',
      moonIllumination: 78,
      moonrise: '5:40 PM',
      moonset: '6:12 AM'
    },
    nextHourRain: []
  });

  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  // Connect to weatherRefreshService Single Source of Truth
  useEffect(() => {
    const unsubscribe = weatherRefreshService.subscribe((store: UnifiedWeatherStore) => {
      setMetrics(store.metrics);
      setDailyForecast(store.dailyForecast);
      setHourlyForecast(store.hourlyForecast);
      setAlerts(store.alerts);
      setDataState(store.dataState);
      setIsStale(store.isStale);
      setAgeMinutes(store.ageMinutes);
      setLastUpdatedLabel(store.lastUpdatedLabel);
      setProvider(store.provider);
      setDataQuality(store.dataQuality);
    });

    // Start 15-minute background refresh scheduler
    weatherRefreshService.startScheduler(() => activeLocationRef.current);

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch weather for a given target location
  const handleFetchWeather = useCallback(async (loc: LocationInfo, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      await weatherRefreshService.refresh(loc, forceRefresh);
    } catch (err: any) {
      console.warn('Weather fetch error:', err);
      setError(err?.message || 'Unable to load real-time weather. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Dedicated GPS Detector Action
  const detectGpsLocation = useCallback(async (isInitialAutoRefresh = false) => {
    // Prevent duplicate simultaneous location requests
    if (isLocating) return;

    setIsLocating(true);
    setLocationError(null);
    setLocationStatus('Acquiring live GPS fix...');

    try {
      const result = await detectUserLocation();
      const loc = result.location;

      // Remember selection mode as GPS
      try {
        localStorage.setItem(STORAGE_KEYS.LOCATION_SELECTION_MODE, 'gps');
      } catch {}

      setActiveLocation(loc);
      setSavedLocations(prev => {
        // Keep GPS location at top, preserve other custom cities
        const withoutOldGps = prev.filter(l => !l.isCurrent && l.name !== loc.name);
        return [loc, ...withoutOldGps];
      });

      await handleFetchWeather(loc, true);

      const accuracyNote = result.isApproximate ? ` (approx. ±${Math.round(result.accuracyMeters / 1000)}km)` : '';
      setLocationStatus(`GPS Location: ${loc.name}${accuracyNote}`);
      setIsPermissionPermanentlyDenied(false);
    } catch (err: any) {
      console.warn('GPS location retrieval failed:', err);
      const isPermanent = err instanceof LocationServiceError ? err.isPermanentDenial : false;
      setIsPermissionPermanentlyDenied(isPermanent);

      const friendlyMessage = err?.message || 'Failed to detect GPS location. Please check device location settings.';
      setLocationError(friendlyMessage);
      setLocationStatus(null);
    } finally {
      setIsLocating(false);
      setTimeout(() => setLocationStatus(null), 4000);
    }
  }, [isLocating, handleFetchWeather]);

  // First-launch & Startup initialization
  useEffect(() => {
    let mounted = true;

    const initLocationAndWeather = async () => {
      const hasExplained = localStorage.getItem(STORAGE_KEYS.LOCATION_EXPLAINED);
      const selectionMode = localStorage.getItem(STORAGE_KEYS.LOCATION_SELECTION_MODE);
      const permStatus = await checkLocationPermission();

      if (!mounted) return;

      if (permStatus === 'granted') {
        // Permission was previously granted through Android / browser
        if (selectionMode === 'manual') {
          // User deliberately picked a manual city previously: preserve their manual city!
          handleFetchWeather(activeLocation);
        } else {
          // GPS mode: refresh current location on launch
          detectGpsLocation(true);
        }
      } else if (permStatus === 'denied') {
        setIsPermissionPermanentlyDenied(true);
        handleFetchWeather(activeLocation);
      } else {
        // Status is 'prompt'
        if (!hasExplained) {
          // First launch: show educational permission dialog explaining need for weather
          setShowFirstLaunchLocationModal(true);
          handleFetchWeather(activeLocation);
        } else {
          // User already saw prompt and chose not to grant or didn't trigger: load active location quietly
          handleFetchWeather(activeLocation);
        }
      }
    };

    initLocationAndWeather();

    return () => {
      mounted = false;
    };
  }, []);

  const acceptFirstLaunchLocationPrompt = async () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_EXPLAINED, 'true');
    } catch {}
    setShowFirstLaunchLocationModal(false);
    await requestLocationPermission();
    await detectGpsLocation();
  };

  const dismissFirstLaunchLocationPrompt = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_EXPLAINED, 'true');
    } catch {}
    setShowFirstLaunchLocationModal(false);
  };

  // User manually selects a city: preserve that selection
  const selectLocation = (loc: LocationInfo) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_SELECTION_MODE, 'manual');
    } catch {}
    const manualLoc = { ...loc, isCurrent: false };
    setActiveLocation(manualLoc);
    setLocationError(null);
    handleFetchWeather(manualLoc, true);
  };

  // User manually adds a city: preserve manual selection
  const addLocation = (loc: LocationInfo) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_SELECTION_MODE, 'manual');
    } catch {}
    const manualLoc = { ...loc, isCurrent: false };
    if (!savedLocations.some(l => l.name === manualLoc.name && l.country === manualLoc.country)) {
      setSavedLocations(prev => [manualLoc, ...prev]);
    }
    setActiveLocation(manualLoc);
    setLocationError(null);
    handleFetchWeather(manualLoc, true);
  };

  const deleteLocation = (id: string) => {
    setSavedLocations(prev => {
      const filtered = prev.filter(l => l.id !== id);
      if (activeLocation.id === id && filtered.length > 0) {
        setActiveLocation(filtered[0]);
        handleFetchWeather(filtered[0], true);
      }
      return filtered;
    });
  };

  return (
    <WeatherContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeLocation,
        savedLocations,
        metrics,
        dailyForecast,
        hourlyForecast,
        alerts,
        isLoading,
        isLocating,
        locationStatus,
        locationError,
        isPermissionPermanentlyDenied,
        showFirstLaunchLocationModal,
        error,
        dataState,
        isStale,
        ageMinutes,
        lastUpdatedLabel,
        provider,
        dataQuality,
        previewScene,
        setPreviewScene,
        selectLocation,
        addLocation,
        deleteLocation,
        refreshWeather: () => handleFetchWeather(activeLocation, true),
        detectGpsLocation,
        clearLocationStatus: () => setLocationStatus(null),
        clearLocationError: () => setLocationError(null),
        acceptFirstLaunchLocationPrompt,
        dismissFirstLaunchLocationPrompt,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
