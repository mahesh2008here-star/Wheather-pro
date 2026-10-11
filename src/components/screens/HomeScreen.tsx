import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useWeather } from '../../context/WeatherContext';
import { FarmWeatherHero } from '../FarmWeatherHero';
import { WeatherAlertBanner } from '../WeatherAlertBanner';
import { SmartWeatherBriefing } from '../SmartWeatherBriefing';
import { NextHourRainChart } from '../NextHourRainChart';
import { ConditionsGrid } from '../ConditionsGrid';
import { MicroclimateAgriAdvisory } from '../MicroclimateAgriAdvisory';
import { ForecastSection } from '../ForecastSection';

export const HomeScreen: React.FC = () => {
  const { isDarkMode, customAccentColor } = useTheme();
  const { 
    metrics, 
    dailyForecast, 
    hourlyForecast, 
    alerts, 
    activeLocation, 
    previewScene, 
    setPreviewScene, 
    refreshWeather 
  } = useWeather();

  const sceneButtons = [
    { id: 'sunny' as const, label: '☀️ Sunny' },
    { id: 'night_clear' as const, label: '🌙 OLED Night' },
    { id: 'clouds_rolling_in' as const, label: '☁️ Clouds' },
    { id: 'wind_picking_up' as const, label: '💨 Wind' },
    { id: 'rain_shower' as const, label: '🌧️ Rain' },
    { id: 'storm' as const, label: '⚡ Storm' },
    { id: 'clearing_up' as const, label: '🌈 Rainbow' },
  ];

  return (
    <div className="w-full flex-col flex pb-28 sm:pb-32">
      {/* Dynamic Animated Microclimate Landscape Hero */}
      <FarmWeatherHero
        sceneState={previewScene || metrics.sceneState}
        temperature={metrics.temperature}
        conditionTitle={metrics.conditionTitle}
        isLive={previewScene === null}
        tempMin={metrics.tempMinToday}
        tempMax={metrics.tempMaxToday}
        apparentTemperature={metrics.apparentTemperature}
        onRefresh={refreshWeather}
      />

      {/* Microclimate Scene Simulator Selector */}
      <div className="w-full px-4 pt-1.5 pb-0.5 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setPreviewScene(null)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
              previewScene === null
                ? 'text-slate-950 font-extrabold shadow-sm'
                : isDarkMode
                ? 'bg-[#141820] text-zinc-400 hover:text-white border border-white/10'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            style={{ backgroundColor: previewScene === null ? customAccentColor : undefined }}
          >
            ● Auto Live Sync
          </button>
          {sceneButtons.map(item => (
            <button
              key={item.id}
              onClick={() => setPreviewScene(item.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                previewScene === item.id
                  ? 'text-slate-950 font-bold shadow-sm'
                  : isDarkMode
                  ? 'bg-[#141820] text-zinc-400 hover:text-white border border-white/10'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              style={{ backgroundColor: previewScene === item.id ? customAccentColor : undefined }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Severe Weather Warnings */}
      <WeatherAlertBanner alerts={alerts} />

      {/* AI Weather Briefing */}
      <SmartWeatherBriefing metrics={metrics} location={activeLocation} />

      {/* Next-Hour Rain Intensity Chart */}
      <NextHourRainChart
        minuteItems={metrics.nextHourRain}
        currentPrecipRate={metrics.precipitationRate}
      />

      {/* Comprehensive Weather Metrics Grid */}
      <ConditionsGrid metrics={metrics} />

      {/* Microclimate Agriculture Field Advisory */}
      <MicroclimateAgriAdvisory metrics={metrics} />

      {/* 24h & 7-Day Expandable Forecast */}
      <ForecastSection
        daily={dailyForecast}
        hourly={hourlyForecast}
        currentTemp={metrics.temperature}
      />
    </div>
  );
};
