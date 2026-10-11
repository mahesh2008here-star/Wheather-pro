import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Smartphone, 
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
  Droplet,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../types/weather';
import { useWeather } from '../context/WeatherContext';
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

// 6 Material Design 3 Android Home-Screen Widgets
import { CompactWeatherWidget } from './android-widgets/CompactWeatherWidget';
import { ForecastMediumWidget } from './android-widgets/ForecastMediumWidget';
import { SevenDayForecastWidget } from './android-widgets/SevenDayForecastWidget';
import { FarmConditionsWidget } from './android-widgets/FarmConditionsWidget';
import { IrrigationOutlookWidget } from './android-widgets/IrrigationOutlookWidget';
import { AirQualityUvWidget } from './android-widgets/AirQualityUvWidget';

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
  hourly,
  location,
}) => {
  const { dailyForecast, setActiveTab } = useWeather();
  const [viewMode, setViewMode] = useState<'android_home' | 'dashboard_cards'>('android_home');
  const [activeAndroidWidget, setActiveAndroidWidget] = useState<string>('compact');
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);

  // In-app Card Customization State
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

  const handlePinWidget = (widgetId: string, widgetName: string) => {
    try { navigator.vibrate?.(15); } catch {}
    if (typeof window !== 'undefined' && (window as any).AndroidWidgetBridge) {
      const success = (window as any).AndroidWidgetBridge.requestPinWidget?.(widgetId);
      if (success) {
        setPinFeedback(`Pin request sent for ${widgetName}. Confirm on your launcher.`);
      } else {
        setPinFeedback(`Android widget ${widgetName} is ready in your launcher widget drawer.`);
      }
    } else {
      setPinFeedback(`To add "${widgetName}" on Android: Long-press your home screen → Tap Widgets → Select Farm Weather.`);
    }

    setTimeout(() => setPinFeedback(null), 5000);
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
    <div className="w-full px-4 pt-3 pb-36 sm:pb-40 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
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
                Material 3 Android home widgets &amp; in-app cards
              </p>
            </div>
          </div>

          {viewMode === 'dashboard_cards' && (
            <button
              onClick={resetToDefault}
              className="text-[10px] font-bold text-[#737873] hover:text-[#171717] flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white border border-[#E9E7E1] cursor-pointer snappy-touch"
              title="Reset to default arrangement"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* MODE SELECTOR TABS */}
      <div className="grid grid-cols-2 p-1 mb-4 rounded-2xl bg-[#EAE8E1]/70 border border-[#E9E7E1]">
        <button
          onClick={() => setViewMode('android_home')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            viewMode === 'android_home'
              ? 'bg-white text-[#FF7900] shadow-xs'
              : 'text-[#737873] hover:text-[#171717]'
          }`}
        >
          <Smartphone size={14} />
          <span>Android Home Widgets</span>
        </button>

        <button
          onClick={() => setViewMode('dashboard_cards')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            viewMode === 'dashboard_cards'
              ? 'bg-white text-[#FF7900] shadow-xs'
              : 'text-[#737873] hover:text-[#171717]'
          }`}
        >
          <Sliders size={14} />
          <span>Dashboard Cards ({enabledWidgets.length})</span>
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {pinFeedback && (
        <div className="mb-4 p-3 rounded-2xl bg-[#E5F2FF] border border-[#CDE3FC] text-[#1687C9] text-xs font-bold animate-tab-switch flex items-start space-x-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          <p className="leading-snug">{pinFeedback}</p>
        </div>
      )}

      {/* MODE 1: NATIVE ANDROID HOME WIDGETS SHOWCASE */}
      {viewMode === 'android_home' && (
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-white border border-[#E9E7E1] text-xs">
            <div className="flex items-center space-x-1.5 text-[#159B69] font-black mb-1">
              <Sparkles size={14} />
              <span>Material Design 3 Architecture</span>
            </div>
            <p className="text-[11px] text-[#737873] leading-relaxed">
              These 6 widgets are native Android AppWidgetProvider layouts. Select any widget to preview its live telemetry and request automatic home-screen pinning.
            </p>
          </div>

          {/* WIDGET A: COMPACT CURRENT WEATHER */}
          <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1687C9] block">
                  Widget A • 2×1 or 2×2 Cell
                </span>
                <h3 className="text-sm font-black text-[#171717]">Compact Current Weather</h3>
              </div>
              <button
                onClick={() => handlePinWidget('compact', 'Compact Weather')}
                className="px-3 py-1.5 rounded-xl bg-[#E5F2FF] text-[#1687C9] border border-[#CDE3FC] text-xs font-black cursor-pointer snappy-touch flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>Add to Home</span>
              </button>
            </div>

            <div className="flex justify-center py-1">
              <CompactWeatherWidget 
                metrics={metrics} 
                location={location} 
                onClick={() => setActiveTab(0)} 
              />
            </div>
            <p className="text-[10px] text-center text-[#737873] mt-2">
              Tap widget to jump into live weather hero
            </p>
          </div>

          {/* WIDGET B: CURRENT WEATHER & FORECAST */}
          <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F57C00] block">
                  Widget B • 4×1 or 4×2 Cell
                </span>
                <h3 className="text-sm font-black text-[#171717]">Current Weather &amp; Hourly Strip</h3>
              </div>
              <button
                onClick={() => handlePinWidget('forecast', 'Hourly Forecast')}
                className="px-3 py-1.5 rounded-xl bg-[#FFF0E1] text-[#F57C00] border border-[#FFE1CB] text-xs font-black cursor-pointer snappy-touch flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>Add to Home</span>
              </button>
            </div>

            <ForecastMediumWidget 
              metrics={metrics} 
              hourly={hourly} 
              location={location} 
              onClick={() => setActiveTab(0)} 
            />
            <p className="text-[10px] text-center text-[#737873] mt-2">
              Tap widget to view 24-hour horizon timeline
            </p>
          </div>

          {/* WIDGET C: SEVEN-DAY FORECAST */}
          <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1687C9] block">
                  Widget C • 4×2 or 4×3 Resizable
                </span>
                <h3 className="text-sm font-black text-[#171717]">Seven-Day Outlook (Proportional Bars)</h3>
              </div>
              <button
                onClick={() => handlePinWidget('sevenday', 'Seven-Day Outlook')}
                className="px-3 py-1.5 rounded-xl bg-[#E5F2FF] text-[#1687C9] border border-[#CDE3FC] text-xs font-black cursor-pointer snappy-touch flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>Add to Home</span>
              </button>
            </div>

            <SevenDayForecastWidget 
              daily={dailyForecast} 
              location={location} 
              onClick={() => setActiveTab(0)} 
            />
            <p className="text-[10px] text-center text-[#737873] mt-2">
              True proportional temperature range bars matching weekly limits
            </p>
          </div>

          {/* WIDGET D: FARM CONDITIONS */}
          <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#159B69] block">
                  Widget D • 3×2 or 4×2 Farm Cell
                </span>
                <h3 className="text-sm font-black text-[#171717]">Agricultural Field Conditions</h3>
              </div>
              <button
                onClick={() => handlePinWidget('farm', 'Farm Conditions')}
                className="px-3 py-1.5 rounded-xl bg-[#E4F5E9] text-[#159B69] border border-[#CDEED6] text-xs font-black cursor-pointer snappy-touch flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>Add to Home</span>
              </button>
            </div>

            <FarmConditionsWidget 
              metrics={metrics} 
              location={location} 
              onClick={() => setActiveTab(0)} 
            />
            <p className="text-[10px] text-center text-[#737873] mt-2">
              Topsoil telemetry (0-1cm), field wind gusts &amp; moisture
            </p>
          </div>

          {/* WIDGET E: RAIN AND IRRIGATION OUTLOOK */}
          <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1687C9] block">
                  Widget E • 4×2 Agricultural
                </span>
                <h3 className="text-sm font-black text-[#171717]">Rain &amp; Irrigation Outlook</h3>
              </div>
              <button
                onClick={() => handlePinWidget('irrigation', 'Irrigation Outlook')}
                className="px-3 py-1.5 rounded-xl bg-[#E5F2FF] text-[#1687C9] border border-[#CDE3FC] text-xs font-black cursor-pointer snappy-touch flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>Add to Home</span>
              </button>
            </div>

            <IrrigationOutlookWidget 
              metrics={metrics} 
              location={location} 
              onClick={() => setActiveTab(1)} 
            />
            <p className="text-[10px] text-center text-[#737873] mt-2">
              Tap to open live precipitation Doppler radar
            </p>
          </div>

          {/* WIDGET F: AIR QUALITY & UV */}
          <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#7563C9] block">
                  Widget F • 3×2 Environmental
                </span>
                <h3 className="text-sm font-black text-[#171717]">Air Quality &amp; Solar UV Index</h3>
              </div>
              <button
                onClick={() => handlePinWidget('air_uv', 'Air Quality & UV')}
                className="px-3 py-1.5 rounded-xl bg-[#EFECFF] text-[#7563C9] border border-[#DED7FC] text-xs font-black cursor-pointer snappy-touch flex items-center space-x-1"
              >
                <Plus size={13} />
                <span>Add to Home</span>
              </button>
            </div>

            <AirQualityUvWidget 
              metrics={metrics} 
              location={location} 
              onClick={() => setActiveTab(2)} 
            />
            <p className="text-[10px] text-center text-[#737873] mt-2">
              Tap to open complete Air Quality &amp; Solar Ephemeris screen
            </p>
          </div>
        </div>
      )}

      {/* MODE 2: DASHBOARD CARDS CUSTOMIZATION */}
      {viewMode === 'dashboard_cards' && (
        <>
          {/* INTERACTIVE PREVIEW */}
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 text-[#FF7900]">
              Active Card Preview
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
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-[#E9E7E1]"
                        style={{ backgroundColor: `${widget.accentColor}15`, color: widget.accentColor }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black truncate text-[#171717]">
                            {widget.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#F7F6F2] text-[#737873]">
                            {widget.category}
                          </span>
                        </div>
                        <p className="text-[10px] truncate text-[#737873] mt-0.5">
                          {widget.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWidget(widget.id);
                      }}
                      className={`ml-2 p-1.5 rounded-xl border transition-all cursor-pointer snappy-touch shrink-0 ${
                        isEnabled
                          ? 'bg-[#E5F5EC] border-[#CEEFDB] text-[#10B981]'
                          : 'bg-[#F7F6F2] border-[#E9E7E1] text-[#737873]'
                      }`}
                      title={isEnabled ? 'Enabled on Home Screen' : 'Disabled'}
                    >
                      {isEnabled ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
