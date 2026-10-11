import React, { useState, useEffect } from 'react';
import { Sliders, LayoutGrid } from 'lucide-react';
import { CurrentWeatherMetrics } from '../../types/weather';
import { useWeather } from '../../context/WeatherContext';

import { SunriseSunsetWidget } from './SunriseSunsetWidget';
import { UVIndexWidget } from './UVIndexWidget';
import { AirQualityWidget } from './AirQualityWidget';
import { VisibilityWidget } from './VisibilityWidget';
import { HumidityDewPointWidget } from './HumidityDewPointWidget';
import { AtmosphericPressureWidget } from './AtmosphericPressureWidget';
import { PollenLevelsWidget } from './PollenLevelsWidget';
import { WindWidget } from './WindWidget';
import { RainfallWidget } from './RainfallWidget';
import { CloudCoverWidget } from './CloudCoverWidget';
import { SoilTelemetryWidget } from './SoilTelemetryWidget';
import { EvapotranspirationWidget } from './EvapotranspirationWidget';

export const DEFAULT_ENABLED_WIDGETS = [
  'uv_index',
  'air_quality',
  'wind',
  'humidity_dew',
  'soil_telemetry',
  'evapotranspiration',
  'rainfall',
  'sunrise_sunset',
  'pressure',
  'visibility'
];

interface WidgetDashboardProps {
  metrics: CurrentWeatherMetrics;
  isCustomizing?: boolean;
}

export const WidgetDashboard: React.FC<WidgetDashboardProps> = ({ metrics }) => {
  const { setActiveTab } = useWeather();
  const [enabledWidgets, setEnabledWidgets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('farmweather_enabled_widgets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ENABLED_WIDGETS;
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('farmweather_enabled_widgets');
        if (saved) setEnabledWidgets(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'sunrise_sunset':
        return <SunriseSunsetWidget astronomy={metrics.astronomy} />;
      case 'uv_index':
        return <UVIndexWidget uvIndex={metrics.uvIndex} uvLevel={metrics.uvLevel} />;
      case 'air_quality':
        return <AirQualityWidget airQuality={metrics.airQuality} />;
      case 'visibility':
        return <VisibilityWidget visibilityKm={metrics.visibility} />;
      case 'humidity_dew':
        return <HumidityDewPointWidget humidity={metrics.humidity} dewPoint={metrics.dewPoint} />;
      case 'pressure':
        return <AtmosphericPressureWidget pressure={metrics.pressure} pressureTendency={metrics.pressureTendency} />;
      case 'pollen':
        return <PollenLevelsWidget airQuality={metrics.airQuality} />;
      case 'wind':
        return (
          <WindWidget 
            windSpeed={metrics.windSpeed} 
            windGusts={metrics.windGusts} 
            windDirectionCardinal={metrics.windDirectionCardinal} 
            windDirection={metrics.windDirection} 
          />
        );
      case 'rainfall':
        return (
          <RainfallWidget 
            precipitationAmount={metrics.precipitationAmount} 
            rainChance={metrics.rainChance} 
          />
        );
      case 'cloud_cover':
        return (
          <CloudCoverWidget 
            cloudCover={metrics.cloudCover} 
            conditionTitle={metrics.conditionTitle} 
          />
        );
      case 'soil_telemetry':
        return (
          <SoilTelemetryWidget 
            soilTemperature={metrics.soilTemperature} 
            soilMoisture={metrics.soilMoisture} 
          />
        );
      case 'evapotranspiration':
        return (
          <EvapotranspirationWidget 
            evapotranspiration={metrics.evapotranspiration} 
          />
        );
      default:
        return null;
    }
  };

  const displayedList = enabledWidgets.filter(id => Boolean(renderWidget(id)));

  return (
    <div className="w-full px-4 py-2 select-none">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <LayoutGrid size={15} className="text-[#FF7900]" />
          <h3 className="text-xs font-black tracking-tight uppercase text-[#171717]">
            Environmental Telemetry
          </h3>
        </div>
        <button
          onClick={() => setActiveTab(3)}
          className="text-[10px] font-bold text-[#FF7900] hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <Sliders size={11} />
          <span>Customize Widgets</span>
        </button>
      </div>

      {/* 2-Column Responsive Weather Widget Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {displayedList.map(widgetId => (
          <div key={widgetId} className="h-full">
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>
    </div>
  );
};
