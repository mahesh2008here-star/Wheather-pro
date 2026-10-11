import React from 'react';
import { useWeather } from '../../context/WeatherContext';
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
    refreshWeather 
  } = useWeather();

  return (
    <div className="w-full flex-col flex pb-32">
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
