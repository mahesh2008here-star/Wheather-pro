import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  fetchLiveWeather, 
  detectSevereWeatherAlerts, 
  reverseGeocode 
} from '../services/weatherApi';
import { detectUserLocation } from '../services/locationService';
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
  error: string | null;
  previewScene: WeatherSceneState | null;
  setPreviewScene: (scene: WeatherSceneState | null) => void;
  selectLocation: (loc: LocationInfo) => void;
  addLocation: (loc: LocationInfo) => void;
  deleteLocation: (id: string) => void;
  refreshWeather: () => Promise<void>;
  detectGpsLocation: () => void;
  clearLocationStatus: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [previewScene, setPreviewScene] = useState<WeatherSceneState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    cloudCover: 35,
    uvIndex: 6,
    uvLevel: 'High',
    rainChance: 20,
    precipitationAmount: 0.0,
    precipitationRate: 0.0,
    weatherCode: 2,
    conditionTitle: 'Partly Cloudy',
    conditionDescription: 'Gentle breeze with scattered sunny intervals',
    sceneState: 'clouds_rolling_in',
    isDaytime: true,
    lastUpdated: 'Just now',
    isLive: true,
    airQuality: {
      aqi: 32,
      category: 'Good',
      pm25: 9,
      pm10: 16,
      ozone: 36,
      no2: 12,
      healthAdvice: 'Air quality is satisfactory and poses little to no risk.',
      primaryPollutant: 'PM2.5',
      treePollen: 'Low',
      grassPollen: 'Low',
      weedPollen: 'Low',
    },
    astronomy: {
      sunrise: '6:18 AM',
      sunset: '6:42 PM',
      solarNoon: '12:30 PM',
      dayLength: '12h 24m',
      goldenHour: '6:02 PM',
      isDaytime: true,
      moonPhase: 'Waxing Crescent',
      moonIllumination: 28,
      moonrise: '8:45 PM',
      moonset: '7:12 AM',
    },
    nextHourRain: [
      { minute: 0, intensity: 0, label: 'No rain' },
      { minute: 15, intensity: 0, label: 'No rain' },
      { minute: 30, intensity: 0, label: 'No rain' },
      { minute: 45, intensity: 0, label: 'No rain' },
      { minute: 60, intensity: 0, label: 'No rain' },
    ],
  });

  // Daily Forecast
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([
    { date: '2026-10-10', dayName: 'Today', weatherCode: 2, conditionDescription: 'Partly Cloudy', tempMin: 18, tempMax: 26, rainProbability: 20, precipitationSum: 0.0, uvIndexMax: 6, humidity: 68, windSpeedMax: 16, windDirectionCardinal: 'WSW', precipitationHours: 0 },
    { date: '2026-10-11', dayName: 'Sunday', weatherCode: 0, conditionDescription: 'Clear Sky', tempMin: 17, tempMax: 27, rainProbability: 5, precipitationSum: 0.0, uvIndexMax: 7, humidity: 60, windSpeedMax: 12, windDirectionCardinal: 'SW', precipitationHours: 0 },
    { date: '2026-10-12', dayName: 'Monday', weatherCode: 61, conditionDescription: 'Showers', tempMin: 16, tempMax: 22, rainProbability: 75, precipitationSum: 5.4, uvIndexMax: 4, humidity: 85, windSpeedMax: 24, windDirectionCardinal: 'WNW', precipitationHours: 4 },
    { date: '2026-10-13', dayName: 'Tuesday', weatherCode: 63, conditionDescription: 'Rain', tempMin: 15, tempMax: 20, rainProbability: 85, precipitationSum: 12.2, uvIndexMax: 3, humidity: 90, windSpeedMax: 30, windDirectionCardinal: 'NW', precipitationHours: 6 },
    { date: '2026-10-14', dayName: 'Wednesday', weatherCode: 2, conditionDescription: 'Partly Sunny', tempMin: 16, tempMax: 24, rainProbability: 25, precipitationSum: 0.2, uvIndexMax: 5, humidity: 68, windSpeedMax: 15, windDirectionCardinal: 'NNW', precipitationHours: 0 },
    { date: '2026-10-15', dayName: 'Thursday', weatherCode: 0, conditionDescription: 'Sunny', tempMin: 17, tempMax: 28, rainProbability: 5, precipitationSum: 0.0, uvIndexMax: 7, humidity: 55, windSpeedMax: 11, windDirectionCardinal: 'W', precipitationHours: 0 },
    { date: '2026-10-16', dayName: 'Friday', weatherCode: 2, conditionDescription: 'Mainly Clear', tempMin: 18, tempMax: 28, rainProbability: 10, precipitationSum: 0.0, uvIndexMax: 6, humidity: 62, windSpeedMax: 14, windDirectionCardinal: 'SW', precipitationHours: 0 },
  ]);

  // Hourly Forecast
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([
    { time: '10:00', hour: 'Now', temperature: 24, weatherCode: 2, rainProbability: 15, isCurrent: true },
    { time: '11:00', hour: '11 AM', temperature: 25, weatherCode: 1, rainProbability: 10 },
    { time: '12:00', hour: '12 PM', temperature: 26, weatherCode: 0, rainProbability: 5 },
    { time: '13:00', hour: '1 PM', temperature: 26, weatherCode: 0, rainProbability: 5 },
    { time: '14:00', hour: '2 PM', temperature: 25, weatherCode: 1, rainProbability: 10 },
    { time: '15:00', hour: '3 PM', temperature: 24, weatherCode: 2, rainProbability: 20 },
    { time: '16:00', hour: '4 PM', temperature: 23, weatherCode: 2, rainProbability: 25 },
    { time: '17:00', hour: '5 PM', temperature: 22, weatherCode: 3, rainProbability: 30 },
  ]);

  // Calculate severe alerts
  const alerts = detectSevereWeatherAlerts(metrics);

  const activeLocationRef = React.useRef(activeLocation);
  activeLocationRef.current = activeLocation;

  // Fetch Weather Callback
  const handleFetchWeather = useCallback(async (loc?: LocationInfo, forceRefresh: boolean = false) => {
    const targetLoc = loc || activeLocationRef.current;
    setIsLoading(true);
    setError(null);
    setPreviewScene(null);
    try {
      const data = await fetchLiveWeather(targetLoc.latitude, targetLoc.longitude, forceRefresh);
      setMetrics(data.current);
      if (data.daily.length > 0) setDailyForecast(data.daily);
      if (data.hourly.length > 0) setHourlyForecast(data.hourly);

      // Sync to Native Android Home Screen Widgets via Capacitor bridge
      if (typeof window !== 'undefined' && (window as any).AndroidWidgetBridge) {
        try {
          const bridge = (window as any).AndroidWidgetBridge;
          // Legacy string call for backwards compatibility
          bridge.updateWidgetData?.(
            targetLoc.name,
            `${data.current.temperature}°`,
            data.current.conditionTitle,
            `H:${data.current.tempMaxToday}° L:${data.current.tempMinToday}° • Feels ${data.current.apparentTemperature}°`
          );

          // Structured payload for all Material 3 widgets
          bridge.updateStructuredWidgetData?.(
            JSON.stringify({
              location: targetLoc.name,
              temp: data.current.temperature,
              apparentTemp: data.current.apparentTemperature,
              tempMin: data.current.tempMinToday,
              tempMax: data.current.tempMaxToday,
              condition: data.current.conditionTitle,
              humidity: data.current.humidity,
              windSpeed: data.current.windSpeed,
              windDirection: data.current.windDirectionCardinal,
              rainChance: data.current.rainChance,
              precipitation: data.current.precipitationAmount,
              soilTemp: data.current.soilTemperature,
              soilMoisture: data.current.soilMoisture,
              et0: data.current.evapotranspiration,
              uvIndex: data.current.uvIndex,
              uvLevel: data.current.uvLevel,
              aqi: data.current.airQuality.aqi,
              aqiCategory: data.current.airQuality.category,
              lastUpdated: data.current.lastUpdated || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              forecast: data.hourly.slice(0, 4).map(h => ({
                time: h.time,
                temp: h.temperature,
                condition: h.conditionTitle || 'Clear',
                rainChance: h.rainProbability
              }))
            })
          );
        } catch (bridgeErr) {
          console.debug('Android widget sync note:', bridgeErr);
        }
      }
    } catch (err: any) {
      console.warn('Weather fetch fallback:', err);
      setError(err?.message || 'Failed to sync live weather telemetry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Universal GPS & IP Live Location Detector
  const detectGpsLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationStatus('Detecting location telemetry...');

    try {
      const loc = await detectUserLocation();
      setActiveLocation(loc);
      setSavedLocations(prev => {
        if (!prev.some(l => l.name === loc.name)) {
          return [loc, ...prev];
        }
        return prev;
      });
      await handleFetchWeather(loc);
      setLocationStatus(`Live Location Active: ${loc.name}`);
    } catch (err) {
      console.warn('Location detection note:', err);
      setLocationStatus('Location loaded');
    } finally {
      setIsLocating(false);
      setTimeout(() => setLocationStatus(null), 3500);
    }
  }, [handleFetchWeather]);

  // Initial Load
  useEffect(() => {
    const storedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_LOCATION);
    if (!storedActive) {
      detectGpsLocation();
    } else {
      handleFetchWeather(activeLocation);
    }
  }, []);

  const selectLocation = (loc: LocationInfo) => {
    setActiveLocation(loc);
    handleFetchWeather(loc, true);
  };

  const addLocation = (loc: LocationInfo) => {
    if (!savedLocations.some(l => l.name === loc.name && l.country === loc.country)) {
      setSavedLocations(prev => [loc, ...prev]);
    }
    setActiveLocation(loc);
    handleFetchWeather(loc, true);
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
        error,
        previewScene,
        setPreviewScene,
        selectLocation,
        addLocation,
        deleteLocation,
        refreshWeather: () => handleFetchWeather(activeLocation, true),
        detectGpsLocation,
        clearLocationStatus: () => setLocationStatus(null),
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
