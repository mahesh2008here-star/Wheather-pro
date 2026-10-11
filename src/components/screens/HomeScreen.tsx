import React from 'react';
import { RefreshCw, AlertTriangle, CloudOff, Loader2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import { FarmWeatherHero } from '../FarmWeatherHero';
import { WeatherAlertBanner } from '../WeatherAlertBanner';
import { SmartWeatherBriefing } from '../SmartWeatherBriefing';
import { NextHourRainChart } from '../NextHourRainChart';
import { MicroclimateAgriAdvisory } from '../MicroclimateAgriAdvisory';
import { ForecastSection } from '../ForecastSection';
import { WidgetDashboard } from '../widgets/WidgetDashboard';

export const HomeScreen: React.FC = () => {
  const { 
    metrics, 
    dailyForecast, 
    hourlyForecast, 
    alerts, 
    activeLocation, 
    isLoading,
    error,
    refreshWeather 
  } = useWeather();
  const { customAccentColor, accentSurface, accentBorder } = useTheme();

  return (
    <div className="w-full flex-col flex pb-36 sm:pb-40">
      {/* Loading Telemetry Indicator Banner */}
      {isLoading && (
        <div className="w-full px-4 pt-2 select-none animate-fadeIn">
          <div 
            className="p-2.5 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all"
            style={{
              backgroundColor: accentSurface || '#FFF0E4',
              borderColor: accentBorder || '#FFE1CB',
              color: customAccentColor || '#FF7900',
            }}
          >
            <div className="flex items-center space-x-2">
              <Loader2 size={15} className="animate-spin shrink-0" />
              <span>Syncing live weather telemetry for {activeLocation.name}...</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Updating</span>
          </div>
        </div>
      )}

      {/* Connection & Telemetry Error State */}
      {error && (
        <div className="w-full px-4 pt-2.5 select-none">
          <div className="p-4 rounded-[28px] border border-rose-200 bg-rose-50 text-rose-900 shadow-xs flex flex-col space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
                <CloudOff size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-rose-950">
                  Telemetry Sync Warning: {activeLocation.name}
                </h4>
                <p className="text-[11px] text-rose-700 font-medium mt-0.5 leading-relaxed">
                  {error}. Displaying latest recorded local telemetry while reconnecting.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={refreshWeather}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer snappy-touch shadow-xs"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Distinctive Current-Weather Hero Section with Quick Metrics */}
      <FarmWeatherHero
        sceneState={metrics.sceneState}
        temperature={metrics.temperature}
        conditionTitle={metrics.conditionTitle}
        isLive={true}
        tempMin={metrics.tempMinToday}
        tempMax={metrics.tempMaxToday}
        apparentTemperature={metrics.apparentTemperature}
        rainChance={metrics.rainChance}
        windSpeed={metrics.windSpeed}
        windDirectionCardinal={metrics.windDirectionCardinal}
        humidity={metrics.humidity}
        lastUpdated={metrics.lastUpdated}
        weatherCode={metrics.weatherCode}
        isDaytime={metrics.isDaytime}
        onRefresh={refreshWeather}
      />

      {/* 2. Severe Weather Warnings (if any) */}
      {alerts && alerts.length > 0 && (
        <WeatherAlertBanner alerts={alerts} />
      )}

      {/* 3. 24-Hour Horizon Timeline & 7-Day Comparison Forecasts */}
      <ForecastSection
        daily={dailyForecast}
        hourly={hourlyForecast}
        currentTemp={metrics.temperature}
      />

      {/* 4. Real API Rain Outlook / MinuteCast Precipitation Timeline */}
      <NextHourRainChart
        minuteItems={metrics.nextHourRain}
        currentPrecipRate={metrics.precipitationRate}
      />

      {/* 5. Complete Customizable Weather Widget Dashboard */}
      <WidgetDashboard metrics={metrics} />

      {/* 6. Agricultural Weather Insights (Spray Window, Frost Index, ET0) */}
      <MicroclimateAgriAdvisory metrics={metrics} />

      {/* 7. Field Voice Audio Briefing */}
      <SmartWeatherBriefing metrics={metrics} location={activeLocation} />
    </div>
  );
};
