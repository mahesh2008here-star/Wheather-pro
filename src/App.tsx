import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sun, 
  Radar, 
  Flower2, 
  LayoutGrid, 
  MapPin, 
  ChevronDown, 
  RefreshCw, 
  Moon, 
  ChevronLeft, 
  AlertTriangle,
  Compass
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
  WeatherAlert,
  WeatherSceneState 
} from './types/weather';

function MainWeatherApp() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Active Navigation Tab: 0 = Weather (Home), 1 = Radar, 2 = Air & Sun, 3 = Widgets, 4 = Locations & Settings
  const [activeTab, setActiveTab] = useState<number>(0);

  // Phone Simulator Frame Bezel vs Full Mobile View
  const [isSimulatorFrame, setIsSimulatorFrame] = useState<boolean>(true);

  // Manual Preview Override (null = automatic live sync from Open-Meteo)
  const [previewScene, setPreviewScene] = useState<WeatherSceneState | null>(null);

  // Saved Locations & Active Location
  const [savedLocations, setSavedLocations] = useState<LocationInfo[]>(DEFAULT_LOCATIONS);
  const [activeLocation, setActiveLocation] = useState<LocationInfo>(DEFAULT_LOCATIONS[0]);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState<boolean>(false);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Current Live Weather Metrics
  const [metrics, setMetrics] = useState<CurrentWeatherMetrics>({
    temperature: 22,
    apparentTemperature: 21,
    tempMinToday: 16,
    tempMaxToday: 24,
    humidity: 74,
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
    conditionDescription: 'Mild breeze with scattered high clouds',
    sceneState: 'clouds_rolling_in',
    isDaytime: true,
    lastUpdated: '10:50 AM',
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
      sunrise: '6:32 AM',
      sunset: '6:54 PM',
      solarNoon: '12:43 PM',
      dayLength: '12h 22m',
      goldenHour: '6:12 PM',
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
    { date: '2026-10-10', dayName: 'Today', weatherCode: 2, conditionDescription: 'Partly Cloudy', tempMin: 16, tempMax: 24, rainProbability: 20, precipitationSum: 0.0, uvIndexMax: 6, humidity: 74, windSpeedMax: 16, windDirectionCardinal: 'WSW', precipitationHours: 0 },
    { date: '2026-10-11', dayName: 'Sunday', weatherCode: 0, conditionDescription: 'Clear Sky', tempMin: 15, tempMax: 26, rainProbability: 5, precipitationSum: 0.0, uvIndexMax: 7, humidity: 62, windSpeedMax: 12, windDirectionCardinal: 'SW', precipitationHours: 0 },
    { date: '2026-10-12', dayName: 'Monday', weatherCode: 61, conditionDescription: 'Showers', tempMin: 14, tempMax: 20, rainProbability: 75, precipitationSum: 5.4, uvIndexMax: 4, humidity: 86, windSpeedMax: 24, windDirectionCardinal: 'WNW', precipitationHours: 4 },
    { date: '2026-10-13', dayName: 'Tuesday', weatherCode: 63, conditionDescription: 'Rain', tempMin: 13, tempMax: 18, rainProbability: 85, precipitationSum: 12.2, uvIndexMax: 3, humidity: 92, windSpeedMax: 30, windDirectionCardinal: 'NW', precipitationHours: 6 },
    { date: '2026-10-14', dayName: 'Wednesday', weatherCode: 2, conditionDescription: 'Partly Sunny', tempMin: 14, tempMax: 22, rainProbability: 25, precipitationSum: 0.2, uvIndexMax: 5, humidity: 70, windSpeedMax: 15, windDirectionCardinal: 'NNW', precipitationHours: 0 },
    { date: '2026-10-15', dayName: 'Thursday', weatherCode: 0, conditionDescription: 'Sunny', tempMin: 15, tempMax: 25, rainProbability: 5, precipitationSum: 0.0, uvIndexMax: 7, humidity: 58, windSpeedMax: 11, windDirectionCardinal: 'W', precipitationHours: 0 },
    { date: '2026-10-16', dayName: 'Friday', weatherCode: 2, conditionDescription: 'Mainly Clear', tempMin: 16, tempMax: 26, rainProbability: 10, precipitationSum: 0.0, uvIndexMax: 6, humidity: 65, windSpeedMax: 14, windDirectionCardinal: 'SW', precipitationHours: 0 },
  ]);

  // Hourly Forecast
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([
    { time: '10:00', hour: 'Now', temperature: 22, weatherCode: 2, rainProbability: 15, isCurrent: true },
    { time: '11:00', hour: '11 AM', temperature: 23, weatherCode: 1, rainProbability: 10 },
    { time: '12:00', hour: '12 PM', temperature: 24, weatherCode: 0, rainProbability: 5 },
    { time: '13:00', hour: '1 PM', temperature: 24, weatherCode: 0, rainProbability: 5 },
    { time: '14:00', hour: '2 PM', temperature: 23, weatherCode: 1, rainProbability: 10 },
    { time: '15:00', hour: '3 PM', temperature: 22, weatherCode: 2, rainProbability: 20 },
    { time: '16:00', hour: '4 PM', temperature: 21, weatherCode: 2, rainProbability: 25 },
    { time: '17:00', hour: '5 PM', temperature: 20, weatherCode: 3, rainProbability: 30 },
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

  // Initial load
  useEffect(() => {
    handleFetchWeather(activeLocation);
  }, [activeLocation, handleFetchWeather]);

  // Handle location selection
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
    setSavedLocations(prev => prev.filter(l => l.id !== id));
  };

  return (
    <PhoneSimulator
      isSimulatorFrame={isSimulatorFrame}
      onToggleSimulatorFrame={() => setIsSimulatorFrame(!isSimulatorFrame)}
    >
      {/* APP TOP NAVIGATION BAR */}
      <div className={`w-full px-4 pt-1.5 pb-2 flex items-center justify-between shrink-0 select-none z-20 transition-colors ${
        isDarkMode ? 'bg-[#000000] border-b border-white/10' : 'bg-[#F8F6F0] border-b border-stone-200/50'
      }`}>
        {/* Left Action: Quick return to Weather Home */}
        <button
          onClick={() => setActiveTab(0)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isDarkMode 
              ? 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-white/10' 
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/60 shadow-xs'
          }`}
          title="Weather Home"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Center: Location Selector & Active Alert Indicator */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab(4)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
              isDarkMode
                ? 'bg-[#0A0A0C] text-white hover:bg-zinc-900 border border-white/15'
                : 'bg-white text-stone-900 hover:bg-stone-50 border border-stone-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
            }`}
          >
            <MapPin size={13} className="text-sky-400 shrink-0" />
            <span className="truncate max-w-[130px]">{activeLocation.name}</span>
            <ChevronDown size={14} className="opacity-60 shrink-0" />
          </button>

          {alerts.length > 0 && (
            <span 
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse"
              title={`${alerts.length} Active Severe Weather Warning`}
            >
              <AlertTriangle size={11} />
              <span>{alerts.length}</span>
            </span>
          )}
        </div>

        {/* Right Action: OLED AMOLED Toggle & Live Sync Button */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleDarkMode}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isDarkMode 
                ? 'bg-zinc-900 text-amber-300 hover:bg-zinc-800 border border-white/10' 
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/60 shadow-xs'
            }`}
            title="Toggle OLED Pure Black / Light"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={() => handleFetchWeather(activeLocation)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isLoading ? 'animate-spin text-sky-400' : ''
            } ${
              isDarkMode 
                ? 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-white/10' 
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/60 shadow-xs'
            }`}
            title="Refresh Live Weather"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ACTIVE SCREEN CONTENT */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col">
        {/* TAB 0: HOME WEATHER (The iconic animated landscape auto-changing + consumer weather) */}
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
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setPreviewScene(null)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${
                    previewScene === null
                      ? 'bg-sky-500 text-white shadow-xs'
                      : isDarkMode
                      ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                      : 'bg-stone-200/60 text-stone-600 hover:text-stone-900'
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
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${
                      previewScene === item.id
                        ? 'bg-sky-500 text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                        : 'bg-stone-200/60 text-stone-600 hover:text-stone-900'
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

            {/* Comprehensive Consumer Weather Metrics Cards */}
            <ConditionsGrid metrics={metrics} />

            {/* Hourly 24h & 7-Day Expandable Daily Forecast */}
            <ForecastSection
              daily={dailyForecast}
              hourly={hourlyForecast}
              currentTemp={metrics.temperature}
            />
          </div>
        )}

        {/* TAB 1: LIVE RADAR & WEATHER MAPS */}
        {activeTab === 1 && (
          <LiveRadarScreen location={activeLocation} />
        )}

        {/* TAB 2: AIR QUALITY & SUN ASTRONOMY */}
        {activeTab === 2 && (
          <AirAndSunScreen
            airQuality={metrics.airQuality}
            astronomy={metrics.astronomy}
            location={activeLocation}
          />
        )}

        {/* TAB 3: COOL SCENE WIDGETS GALLERY */}
        {activeTab === 3 && (
          <WeatherWidgetsScreen
            metrics={metrics}
            hourly={hourlyForecast}
            location={activeLocation}
          />
        )}

        {/* TAB 4: LOCATIONS & PREFERENCES */}
        {activeTab === 4 && (
          <LocationsManagerScreen
            locations={savedLocations}
            activeLocation={activeLocation}
            onSelectLocation={handleSelectLocation}
            onAddLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            onRefreshData={() => handleFetchWeather(activeLocation)}
            lastUpdated={metrics.lastUpdated}
          />
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <nav 
        aria-label="Bottom Navigation"
        className={`w-full h-16 px-2 flex items-center justify-around border-t select-none shrink-0 z-30 transition-colors ${
          isDarkMode
            ? 'bg-[#000000] border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]'
            : 'bg-white border-stone-200/70 shadow-lg'
        }`}
      >
        {[
          { id: 0, label: 'Weather', icon: Sun },
          { id: 1, label: 'Radar', icon: Radar },
          { id: 2, label: 'Air & Sun', icon: Flower2 },
          { id: 3, label: 'Widgets', icon: LayoutGrid },
          { id: 4, label: 'Locations', icon: MapPin },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
                isActive
                  ? isDarkMode
                    ? 'text-sky-400 font-extrabold scale-105'
                    : 'text-stone-900 font-extrabold scale-105'
                  : isDarkMode
                    ? 'text-zinc-500 hover:text-zinc-300 font-medium'
                    : 'text-stone-400 hover:text-stone-700 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${
                isActive 
                  ? isDarkMode ? 'bg-sky-500/20' : 'bg-stone-100' 
                  : ''
              }`}>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
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
