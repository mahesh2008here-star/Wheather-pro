import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sun, 
  Radar, 
  Flower2, 
  Layers, 
  MapPin, 
  ChevronDown, 
  RefreshCw, 
  Moon, 
  AlertTriangle
} from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PhoneSimulator } from './components/PhoneSimulator';
import { FarmWeatherHero } from './components/FarmWeatherHero';
import { SmartWeatherBriefing } from './components/SmartWeatherBriefing';
import { NextHourRainChart } from './components/NextHourRainChart';
import { ConditionsGrid } from './components/ConditionsGrid';
import { ForecastSection } from './components/ForecastSection';
import { WeatherAlertBanner } from './components/WeatherAlertBanner';
import { LiveRadarScreen } from './components/LiveRadarScreen';
import { AirAndSunScreen } from './components/AirAndSunScreen';
import { WeatherWidgetsScreen } from './components/WeatherWidgetsScreen';
import { LocationsManagerScreen } from './components/LocationsManagerScreen';
import { RatingFeedbackSection } from './components/RatingFeedbackSection';
import { 
  DEFAULT_LOCATIONS, 
  fetchLiveWeather, 
  detectSevereWeatherAlerts 
} from './services/weatherApi';
import { 
  CurrentWeatherMetrics, 
  DailyForecastItem, 
  HourlyForecastItem, 
  LocationInfo, 
  WeatherSceneState 
} from './types/weather';

const STORAGE_SAVED_LOCATIONS_KEY = 'weatherapp_saved_locations';
const STORAGE_ACTIVE_LOCATION_KEY = 'weatherapp_active_location';

function MainWeatherApp() {
  const { isDarkMode, toggleDarkMode, customAccentColor, xRealityMode } = useTheme();

  // Active Navigation Tab: 0 = Weather (Home), 1 = Radar, 2 = Air & Sun, 3 = Widgets, 4 = Locations
  const [activeTab, setActiveTab] = useState<number>(0);

  // Manual Preview Override (null = automatic live sync from Open-Meteo)
  const [previewScene, setPreviewScene] = useState<WeatherSceneState | null>(null);

  // Saved Locations & Active Location (Persisted in localStorage across all app restarts & Android sessions)
  const [savedLocations, setSavedLocations] = useState<LocationInfo[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_LOCATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved locations:', e);
    }
    return DEFAULT_LOCATIONS;
  });

  const [activeLocation, setActiveLocation] = useState<LocationInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_LOCATION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && typeof parsed.latitude === 'number') return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse active location:', e);
    }
    return DEFAULT_LOCATIONS[0];
  });

  // Save locations and active location whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_LOCATIONS_KEY, JSON.stringify(savedLocations));
    } catch (e) {
      console.warn('Failed to save locations:', e);
    }
  }, [savedLocations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_LOCATION_KEY, JSON.stringify(activeLocation));
    } catch (e) {
      console.warn('Failed to save active location:', e);
    }
  }, [activeLocation]);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Severe Alerts (Derived from real weather conditions)
  const alerts = detectSevereWeatherAlerts(metrics);

  // Fetch live weather data automatically for active location
  const handleFetchWeather = useCallback(async (loc: LocationInfo) => {
    setIsLoading(true);
    setPreviewScene(null);
    try {
      const data = await fetchLiveWeather(loc.latitude, loc.longitude);
      setMetrics(data.current);
      if (data.daily.length > 0) setDailyForecast(data.daily);
      if (data.hourly.length > 0) setHourlyForecast(data.hourly);
    } catch (err) {
      console.warn('Weather fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: uses the remembered location from localStorage
  useEffect(() => {
    handleFetchWeather(activeLocation);
  }, [activeLocation, handleFetchWeather]);

  // Handle location selection: saves to state & localStorage
  const handleSelectLocation = (loc: LocationInfo) => {
    setActiveLocation(loc);
    handleFetchWeather(loc);
  };

  // Add location
  const handleAddLocation = (loc: LocationInfo) => {
    if (!savedLocations.some(l => l.name === loc.name && l.country === loc.country)) {
      setSavedLocations(prev => [loc, ...prev]);
    }
    setActiveLocation(loc);
  };

  // Delete location
  const handleDeleteLocation = (id: string) => {
    setSavedLocations(prev => {
      const filtered = prev.filter(l => l.id !== id);
      if (activeLocation.id === id && filtered.length > 0) {
        setActiveLocation(filtered[0]);
      }
      return filtered;
    });
  };

  return (
    <PhoneSimulator>
      {/* ANDROID TOP APP BAR */}
      <header className={`w-full px-4 pt-2 pb-2 flex items-center justify-between shrink-0 select-none z-20 transition-colors ${
        isDarkMode ? 'bg-[#000000] border-b border-white/10' : 'bg-[#F2F5FA] border-b border-slate-200'
      }`}>
        {/* Center/Left: Location Selector */}
        <button
          onClick={() => setActiveTab(4)}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
            isDarkMode
              ? 'bg-[#141820] text-white hover:bg-[#1C222E] border border-white/15 shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300/80 shadow-xs'
          }`}
        >
          <MapPin size={14} style={{ color: customAccentColor }} className="shrink-0" />
          <span className="truncate max-w-[150px] text-[13px]">{activeLocation.name}</span>
          <ChevronDown size={14} className="opacity-60 shrink-0" />
        </button>

        {/* Right Actions: Severe Alert Badge, Dark Mode & Refresh */}
        <div className="flex items-center space-x-1.5">
          {alerts.length > 0 && (
            <span 
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse"
              title={`${alerts.length} Active Severe Weather Warning`}
            >
              <AlertTriangle size={11} />
              <span>{alerts.length}</span>
            </span>
          )}

          <button
            onClick={toggleDarkMode}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              isDarkMode 
                ? 'bg-[#141820] text-amber-300 hover:bg-[#1C222E] border border-white/10' 
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
            }`}
            title="Toggle Dark / Light Theme"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            onClick={() => handleFetchWeather(activeLocation)}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              isLoading ? 'animate-spin text-teal-400' : ''
            } ${
              isDarkMode 
                ? 'bg-[#141820] text-slate-200 hover:bg-[#1C222E] border border-white/10' 
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
            }`}
            title="Refresh Live Weather"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* ACTIVE SCREEN CONTENT */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col pb-28">
        {/* TAB 0: HOME WEATHER (The iconic animated landscape house + live forecast) */}
        {activeTab === 0 && (
          <div className="w-full flex-col flex pb-4">
            {/* The Animated Microclimate Landscape Hero (Changes automatically based on weather) */}
            <FarmWeatherHero
              sceneState={previewScene || metrics.sceneState}
              temperature={metrics.temperature}
              conditionTitle={metrics.conditionTitle}
              isLive={previewScene === null}
              tempMin={metrics.tempMinToday}
              tempMax={metrics.tempMaxToday}
              apparentTemperature={metrics.apparentTemperature}
              onRefresh={() => handleFetchWeather(activeLocation)}
            />

            {/* Microclimate Scene Simulator Strip (Auto Live by default, interactive preview) */}
            <div className="w-full px-4 pt-1.5 pb-0.5 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setPreviewScene(null)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                    previewScene === null
                      ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                      : isDarkMode
                      ? 'bg-[#141820] text-zinc-400 hover:text-white border border-white/10'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  ● Auto Live Sync
                </button>
                {[
                  { id: 'sunny' as const, label: '☀️ Sunny' },
                  { id: 'night_clear' as const, label: '🌙 OLED Night' },
                  { id: 'clouds_rolling_in' as const, label: '☁️ Clouds' },
                  { id: 'wind_picking_up' as const, label: '💨 Wind' },
                  { id: 'rain_shower' as const, label: '🌧️ Rain' },
                  { id: 'storm' as const, label: '⚡ Storm' },
                  { id: 'clearing_up' as const, label: '🌈 Rainbow' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPreviewScene(item.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                      previewScene === item.id
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                        : isDarkMode
                        ? 'bg-[#141820] text-zinc-400 hover:text-white border border-white/10'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severe Weather Alerts Banner */}
            <WeatherAlertBanner alerts={alerts} />

            {/* AI Smart Weather Briefing */}
            <SmartWeatherBriefing
              metrics={metrics}
              location={activeLocation}
            />

            {/* Next-Hour Minute-by-Minute Rain Intensity Chart */}
            <NextHourRainChart
              minuteItems={metrics.nextHourRain}
              currentPrecipRate={metrics.precipitationRate}
            />

            {/* Comprehensive Android Weather Metrics Cards */}
            <ConditionsGrid metrics={metrics} />

            {/* Hourly 24h & 7-Day Expandable Daily Forecast */}
            <ForecastSection
              daily={dailyForecast}
              hourly={hourlyForecast}
              currentTemp={metrics.temperature}
            />

            {/* Community Rating & Feedback Section (Auto-dispatches to mmmmahe46@gmail.com) */}
            <RatingFeedbackSection location={activeLocation} />
          </div>
        )}

        {/* TAB 1: LIVE RADAR & WEATHER MAPS */}
        {activeTab === 1 && (
          <div className="w-full flex-col flex pb-4">
            <LiveRadarScreen location={activeLocation} />
          </div>
        )}

        {/* TAB 2: AIR QUALITY & SUN ASTRONOMY */}
        {activeTab === 2 && (
          <div className="w-full flex-col flex pb-4">
            <AirAndSunScreen
              airQuality={metrics.airQuality}
              astronomy={metrics.astronomy}
              location={activeLocation}
            />
          </div>
        )}

        {/* TAB 3: ADAPTABLE ANDROID HOME SCREEN WIDGETS */}
        {activeTab === 3 && (
          <div className="w-full flex-col flex pb-4">
            <WeatherWidgetsScreen
              metrics={metrics}
              hourly={hourlyForecast}
              location={activeLocation}
            />
          </div>
        )}

        {/* TAB 4: LOCATIONS & PREFERENCES */}
        {activeTab === 4 && (
          <div className="w-full flex-col flex pb-4">
            <LocationsManagerScreen
              locations={savedLocations}
              activeLocation={activeLocation}
              onSelectLocation={handleSelectLocation}
              onAddLocation={handleAddLocation}
              onDeleteLocation={handleDeleteLocation}
              onRefreshData={() => handleFetchWeather(activeLocation)}
              lastUpdated={metrics.lastUpdated}
            />
          </div>
        )}
      </div>

      {/* APPLE LIQUID GLASS FLOATING NAVIGATION DOCK (Remains fixed in place when scrolling) */}
      <nav 
        aria-label="Liquid Glass Dock"
        className={`absolute bottom-4 sm:bottom-5 inset-x-0 mx-auto w-[92%] max-w-[390px] h-16 px-2 flex items-center justify-around select-none z-40 rounded-full transition-all duration-300 shadow-2xl ${
          isDarkMode
            ? 'liquid-glass-dock text-white'
            : 'liquid-glass-dock-light text-slate-800'
        }`}
      >
        {[
          { id: 0, label: 'Weather', icon: Sun },
          { id: 1, label: 'Radar', icon: Radar },
          { id: 2, label: 'Air & Sun', icon: Flower2 },
          { id: 3, label: 'Widgets', icon: Layers },
          { id: 4, label: 'Cities', icon: MapPin },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                try { navigator.vibrate?.(12); } catch {}
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'font-black scale-105'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-white font-medium hover:scale-102'
                    : 'text-slate-500 hover:text-slate-900 font-medium hover:scale-102'
              }`}
              style={{
                color: isActive ? customAccentColor : undefined,
              }}
            >
              <div 
                className={`px-3.5 py-1 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'shadow-md border border-white/25 backdrop-blur-md' 
                    : ''
                }`}
                style={{
                  backgroundColor: isActive ? `${customAccentColor}28` : undefined,
                  borderColor: isActive ? `${customAccentColor}60` : undefined,
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </PhoneSimulator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainWeatherApp />
    </ThemeProvider>
  );
}
