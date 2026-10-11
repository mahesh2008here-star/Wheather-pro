import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Check, 
  Plus, 
  RotateCcw, 
  Sliders, 
  Info,
  Sun,
  ShieldCheck,
  Eye,
  Droplets,
  Gauge,
  Flower2,
  Wind,
  CloudRain,
  Cloud,
  Sprout,
  Droplet
} from 'lucide-react';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../types/weather';
import { DEFAULT_ENABLED_WIDGETS } from './widgets/WidgetDashboard';

import { SunriseSunsetWidget } from './widgets/SunriseSunsetWidget';
import { UVIndexWidget } from './widgets/UVIndexWidget';
import { AirQualityWidget } from './widgets/AirQualityWidget';
import { VisibilityWidget } from './widgets/VisibilityWidget';
import { HumidityDewPointWidget } from './widgets/HumidityDewPointWidget';
import { AtmosphericPressureWidget } from './widgets/AtmosphericPressureWidget';
import { PollenLevelsWidget } from './widgets/PollenLevelsWidget';
import { WindWidget } from './widgets/WindWidget';
import { RainfallWidget } from './widgets/RainfallWidget';
import { CloudCoverWidget } from './widgets/CloudCoverWidget';
import { SoilTelemetryWidget } from './widgets/SoilTelemetryWidget';
import { EvapotranspirationWidget } from './widgets/EvapotranspirationWidget';

interface WeatherWidgetsScreenProps {
  metrics: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  location: LocationInfo;
  isLoading?: boolean;
  onRefreshData?: () => void;
}

interface WidgetMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  accentColor: string;
}

const ALL_WIDGETS: WidgetMeta[] = [
  { id: 'uv_index', name: 'UV Index', category: 'Solar', description: 'Real-time UV risk category & visual scale', icon: Sun, accentColor: '#7C3AED' },
  { id: 'air_quality', name: 'Air Quality (AQI)', category: 'Environment', description: 'EPA air quality index & pollutant measurements', icon: ShieldCheck, accentColor: '#10B981' },
  { id: 'wind', name: 'Surface Wind', category: 'Atmosphere', description: 'Wind speed, cardinal direction & gust thresholds', icon: Wind, accentColor: '#10B981' },
  { id: 'humidity_dew', name: 'Humidity & Dew Point', category: 'Moisture', description: 'Relative humidity & calculated dew point temperature', icon: Droplets, accentColor: '#10B981' },
  { id: 'rainfall', name: 'Precipitation', category: 'Rain', description: 'Rain probability & daily precipitation sum', icon: CloudRain, accentColor: '#0284C7' },
  { id: 'soil_telemetry', name: 'Soil Top Layer', category: 'Agronomy', description: 'Topsoil temperature & volumetric moisture content (0-1 cm)', icon: Sprout, accentColor: '#10B981' },
  { id: 'evapotranspiration', name: 'Evapotranspiration (ET₀)', category: 'Agronomy', description: 'Daily crop canopy evapotranspiration for irrigation planning', icon: Droplet, accentColor: '#FF7900' },
  { id: 'sunrise_sunset', name: 'Sunrise & Sunset Arc', category: 'Solar', description: 'Solar horizon ephemeris & total daylight duration', icon: Sun, accentColor: '#FF7900' },
  { id: 'pressure', name: 'Barometer Pressure', category: 'Atmosphere', description: 'Atmospheric pressure & rising/falling tendency', icon: Gauge, accentColor: '#7C3AED' },
  { id: 'visibility', name: 'Field Visibility', category: 'Atmosphere', description: 'Distance visibility in kilometers', icon: Eye, accentColor: '#0284C7' },
  { id: 'cloud_cover', name: 'Cloud Coverage', category: 'Atmosphere', description: 'Percentage cloud cover & sky conditions', icon: Cloud, accentColor: '#0284C7' },
  { id: 'pollen', name: 'Pollen Index', category: 'Environment', description: 'Tree, grass, and weed allergen indicators', icon: Flower2, accentColor: '#F43F5E' },
];

export const WeatherWidgetsScreen: React.FC<WeatherWidgetsScreenProps> = ({
  metrics,
  location,
}) => {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('uv_index');
  const [enabledWidgets, setEnabledWidgets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('farmweather_enabled_widgets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ENABLED_WIDGETS;
  });

  const toggleWidget = (id: string) => {
    setEnabledWidgets(prev => {
      const next = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      try {
        localStorage.setItem('farmweather_enabled_widgets', JSON.stringify(next));
      } catch {}
      return next;
    });
    try { navigator.vibrate?.(10); } catch {}
  };

  const resetToDefault = () => {
    setEnabledWidgets(DEFAULT_ENABLED_WIDGETS);
    try {
      localStorage.setItem('farmweather_enabled_widgets', JSON.stringify(DEFAULT_ENABLED_WIDGETS));
    } catch {}
  };

  const renderWidgetPreview = (id: string) => {
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

  return (
    <div className="w-full px-4 pt-3 pb-32 select-none">
      {/* HEADER */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#FFF0E4] text-[#FF7900] border border-[#E9E7E1]">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#171717]">
                Weather Widgets
              </h1>
              <p className="text-xs font-medium text-[#737873]">
                Customize your home screen cards • {enabledWidgets.length} active
              </p>
            </div>
          </div>

          <button
            onClick={resetToDefault}
            className="text-[10px] font-bold text-[#737873] hover:text-[#171717] flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white border border-[#E9E7E1] cursor-pointer snappy-touch"
            title="Reset to default arrangement"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE PREVIEW */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 text-[#FF7900]">
          Active Widget Preview
        </span>
        <div className="w-full max-w-sm mx-auto">
          {renderWidgetPreview(selectedWidgetId)}
        </div>
      </div>

      {/* WIDGET CUSTOMIZATION LIST */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#171717]">
            Available Telemetry Cards (Tap to preview or toggle)
          </span>
        </div>

        <div className="space-y-2">
          {ALL_WIDGETS.map(widget => {
            const isEnabled = enabledWidgets.includes(widget.id);
            const isSelected = selectedWidgetId === widget.id;
            const Icon = widget.icon;

            return (
              <div
                key={widget.id}
                onClick={() => setSelectedWidgetId(widget.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? 'bg-white border-[#FF7900] shadow-xs' 
                    : 'bg-white border-[#E9E7E1] hover:border-[#D5ECFF]'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#F7F6F2]">
                    <Icon size={16} className="text-[#171717]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-black text-[#171717] truncate">
                        {widget.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#F7F6F2] text-[#737873]">
                        {widget.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737873] truncate mt-0.5">
                      {widget.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWidget(widget.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1 shrink-0 ml-2 transition-all cursor-pointer ${
                    isEnabled
                      ? 'bg-[#FFF0E4] text-[#FF7900] border border-[#FFE1CB]'
                      : 'bg-[#F7F6F2] text-[#737873] border border-[#E9E7E1]'
                  }`}
                >
                  {isEnabled ? (
                    <>
                      <Check size={12} strokeWidth={3} />
                      <span>Shown</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* HONEST PLATFORM NOTE */}
      <div className="p-4 rounded-3xl bg-white border border-[#E9E7E1] text-xs leading-relaxed text-[#737873]">
        <div className="flex items-center space-x-2 text-[#FF7900] font-black uppercase tracking-wider text-[11px] mb-1.5">
          <Info size={14} />
          <span>Dashboard Card Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          The toggles above control which telemetry cards appear in the Farm Weather home screen dashboard. To place real Android widgets on physical device home screens, compile and install the Android app package (APK) using Capacitor.
        </p>
      </div>
    </div>
  );
};
