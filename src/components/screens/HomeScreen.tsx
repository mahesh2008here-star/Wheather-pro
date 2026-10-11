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
  const { 
    metrics, 
    dailyForecast, 
    hourlyForecast, 
    alerts, 
    activeLocation, 
    refreshWeather 
  } = useWeather();

  return (
    <div className="w-full flex-col flex pb-24 sm:pb-28">
      {/* 1. Distinctive Current-Weather Hero Section with Atmospheric Condition Backdrop */}
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

      {/* 3. 24-Hour Timeline & 7-Day Comparison Forecasts */}
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

      {/* 5. Agricultural Weather Insights (Spray Window, Frost Index, ET0) */}
      <MicroclimateAgriAdvisory metrics={metrics} />

      {/* 6. Comprehensive Atmospheric Observations */}
      <ConditionsGrid metrics={metrics} />

      {/* 7. Field Voice Briefing Card */}
      <SmartWeatherBriefing metrics={metrics} location={activeLocation} />
    </div>
  );
};
