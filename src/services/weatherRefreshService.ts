/**
 * Unified Shared Weather Refresh Service & Single Source of Truth
 * Manages reliable 15-minute periodic refreshes across UI, PWA, and Android Home-Screen Widgets.
 */

import { LocationInfo, CurrentWeatherMetrics, DailyForecastItem, HourlyForecastItem, WeatherAlert } from '../types/weather';
import { fetchLiveWeather, detectSevereWeatherAlerts } from './weatherApi';
import { STORAGE_KEYS } from '../config/env';

export const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
export const STALE_THRESHOLD_MS = 15 * 60 * 1000;  // 15 minutes
const STORAGE_CACHE_KEY = 'weatherapp_unified_cache_v2';

export type WeatherDataState = 'fresh' | 'stale' | 'loading' | 'error';

export interface UnifiedWeatherStore {
  location: LocationInfo;
  metrics: CurrentWeatherMetrics;
  dailyForecast: DailyForecastItem[];
  hourlyForecast: HourlyForecastItem[];
  alerts: WeatherAlert[];
  fetchTimestamp: number;          // Exact epoch when response was received
  observationTimestamp: string;    // Upstream model/observation time
  lastUpdatedLabel: string;        // "Updated 10:45 AM"
  provider: string;                // "Open-Meteo ECMWF/GFS"
  dataQuality: string;             // Data verification notes
  dataState: WeatherDataState;
  isStale: boolean;
  ageMinutes: number;
}

type StoreSubscriber = (store: UnifiedWeatherStore) => void;

class WeatherRefreshManager {
  private currentStore: UnifiedWeatherStore | null = null;
  private subscribers: Set<StoreSubscriber> = new Set();
  private isRefreshing = false;
  private timerId: any = null;
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load last valid cache from persistent storage
   */
  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.metrics && parsed.location) {
          const age = Date.now() - (parsed.fetchTimestamp || 0);
          this.currentStore = {
            ...parsed,
            isStale: age >= STALE_THRESHOLD_MS,
            ageMinutes: Math.round(age / 60000),
            dataState: age >= STALE_THRESHOLD_MS ? 'stale' : 'fresh',
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load weather store from storage:', e);
    }
  }

  /**
   * Save successful result to persistent storage
   */
  private saveToStorage(store: UnifiedWeatherStore) {
    try {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('Failed to persist weather store:', e);
    }
  }

  /**
   * Subscribe to store updates
   */
  public subscribe(fn: StoreSubscriber): () => void {
    this.subscribers.add(fn);
    if (this.currentStore) {
      fn(this.currentStore);
    }
    return () => this.subscribers.delete(fn);
  }

  private notify() {
    if (!this.currentStore) return;
    this.subscribers.forEach(fn => fn(this.currentStore!));
  }

  public getStore(): UnifiedWeatherStore | null {
    if (this.currentStore) {
      const age = Date.now() - this.currentStore.fetchTimestamp;
      this.currentStore.isStale = age >= STALE_THRESHOLD_MS;
      this.currentStore.ageMinutes = Math.round(age / 60000);
    }
    return this.currentStore;
  }

  /**
   * Start 15-minute background refresh scheduler and lifecycle listeners
   */
  public startScheduler(getCurrentLocation: () => LocationInfo) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Check every 30 seconds if 15 minutes have passed since last successful fetch
    this.timerId = setInterval(() => {
      const store = this.getStore();
      if (!store || store.isStale) {
        const loc = getCurrentLocation();
        this.refresh(loc, false);
      } else {
        this.notify(); // update relative age
      }
    }, 30000);

    // Foreground resume detection: immediately check on app focus or tab visibility
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          const store = this.getStore();
          if (!store || store.isStale) {
            const loc = getCurrentLocation();
            this.refresh(loc, false);
          }
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        const store = this.getStore();
        if (!store || store.isStale) {
          const loc = getCurrentLocation();
          this.refresh(loc, false);
        }
      });
    }
  }

  /**
   * Refresh weather for target location
   */
  public async refresh(location: LocationInfo, forceNetwork = false): Promise<UnifiedWeatherStore> {
    if (this.isRefreshing) {
      if (this.currentStore) return this.currentStore;
    }

    this.isRefreshing = true;

    // If we have an existing store, mark it loading while keeping valid data visible
    if (this.currentStore) {
      this.currentStore = {
        ...this.currentStore,
        dataState: 'loading',
      };
      this.notify();
    }

    try {
      const weatherData = await fetchLiveWeather(location.latitude, location.longitude, forceNetwork);
      const severeAlerts = detectSevereWeatherAlerts(weatherData.current);
      const now = Date.now();

      const lastUpdatedLabel = weatherData.current.lastUpdated 
        ? `Updated ${weatherData.current.lastUpdated}`
        : `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

      const newStore: UnifiedWeatherStore = {
        location,
        metrics: weatherData.current,
        dailyForecast: weatherData.daily,
        hourlyForecast: weatherData.hourly,
        alerts: severeAlerts,
        fetchTimestamp: now,
        observationTimestamp: weatherData.current.lastUpdated || 'Current',
        lastUpdatedLabel,
        provider: 'Open-Meteo ECMWF / GFS IFS',
        dataQuality: 'Verified schema • 16 atmospheric & soil parameters',
        dataState: 'fresh',
        isStale: false,
        ageMinutes: 0,
      };

      this.currentStore = newStore;
      this.saveToStorage(newStore);
      this.syncNativeAndroidWidgets(newStore);
      this.notify();

      return newStore;
    } catch (err: any) {
      console.warn('Weather refresh failed, preserving last successful data:', err);

      // Preserve last successful result if available; mark as stale
      if (this.currentStore) {
        const age = Date.now() - this.currentStore.fetchTimestamp;
        this.currentStore = {
          ...this.currentStore,
          dataState: 'stale',
          isStale: true,
          ageMinutes: Math.round(age / 60000),
          lastUpdatedLabel: `${this.currentStore.lastUpdatedLabel} (stale • offline)`,
        };
        this.notify();
        return this.currentStore;
      }

      throw err;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Explicitly updates all native Android home-screen widgets via AndroidWidgetBridge
   */
  public syncNativeAndroidWidgets(store: UnifiedWeatherStore) {
    if (typeof window === 'undefined' || !(window as any).AndroidWidgetBridge) {
      return;
    }

    try {
      const bridge = (window as any).AndroidWidgetBridge;
      const payload = {
        location: store.location.name,
        latitude: store.location.latitude,
        longitude: store.location.longitude,
        temp: store.metrics.temperature,
        apparentTemp: store.metrics.apparentTemperature,
        tempMin: store.metrics.tempMinToday,
        tempMax: store.metrics.tempMaxToday,
        condition: store.metrics.conditionTitle,
        humidity: store.metrics.humidity,
        windSpeed: store.metrics.windSpeed,
        windDirection: store.metrics.windDirectionCardinal,
        rainChance: store.metrics.rainChance,
        precipitation: store.metrics.precipitationAmount,
        soilTemp: store.metrics.soilTemperature,
        soilMoisture: store.metrics.soilMoisture,
        et0: store.metrics.evapotranspiration,
        uvIndex: store.metrics.uvIndex,
        uvLevel: store.metrics.uvLevel,
        aqi: store.metrics.airQuality?.aqi ?? 32,
        aqiCategory: store.metrics.airQuality?.category ?? 'Good',
        lastUpdated: store.metrics.lastUpdated,
        forecast: store.hourlyForecast.slice(0, 4).map(h => ({
          time: h.hour,
          temp: h.temperature,
          rainChance: h.rainProbability,
        })),
      };

      bridge.updateStructuredWidgetData?.(JSON.stringify(payload));
    } catch (bridgeErr) {
      console.debug('Android widget sync note:', bridgeErr);
    }
  }
}

export const weatherRefreshService = new WeatherRefreshManager();
