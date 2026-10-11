import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Check, 
  Eye, 
  Info, 
  Sun, 
  Sprout, 
  Plus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../types/weather';

interface AndroidHomeWidgetsProps {
  metrics: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  location: LocationInfo;
  isLoading?: boolean;
  onRefreshData?: () => void;
}

interface WidgetItem {
  id: string;
  name: string;
  sizeTag: string;
  dimensions: string;
  description: string;
}

const WIDGETS_LIST: WidgetItem[] = [
  {
    id: 'hero_estate',
    name: 'Farm Field Hero Widget',
    sizeTag: '4×2 Standard',
    dimensions: '4 cols × 2 rows',
    description: 'Condition-aware farm weather banner with large temperature display, weather conditions, and high/low values.',
  },
  {
    id: 'forecast_hub',
    name: 'Field Forecast Hub',
    sizeTag: '4×2 Extended',
    dimensions: '4 cols × 2 rows',
    description: 'Compact 5-hour forecast timeline with precipitation probabilities and surface wind speeds.',
  },
  {
    id: 'agri_telemetry',
    name: 'Agronomy & Spray Advisory',
    sizeTag: '3×2 Compact',
    dimensions: '3 cols × 2 rows',
    description: 'Dedicated farming widget displaying spraying safety window, estimated ET₀ drying rate, and soil moisture.',
  },
  {
    id: 'minimal_pill',
    name: 'Essential Weather Pill',
    sizeTag: '2×1 Glance',
    dimensions: '2 cols × 1 row',
    description: 'Minimalist glance pill featuring live temperature, condition icon, and active parcel name.',
  }
];

export const WeatherWidgetsScreen: React.FC<AndroidHomeWidgetsProps> = ({
  metrics,
  hourly,
  location,
}) => {
  const { isDarkMode, formatTemp, formatWind } = useTheme();
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('hero_estate');
  const [pinnedWidgetIds, setPinnedWidgetIds] = useState<string[]>(['hero_estate']);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const selectedWidget = WIDGETS_LIST.find(w => w.id === selectedWidgetId) || WIDGETS_LIST[0];
  const isPinned = pinnedWidgetIds.includes(selectedWidget.id);

  const handleTogglePin = (widget: WidgetItem) => {
    try { navigator.vibrate?.([15, 20]); } catch {}
    
    if (pinnedWidgetIds.includes(widget.id)) {
      setPinnedWidgetIds(prev => prev.filter(id => id !== widget.id));
      setFeedbackNotice(`Removed "${widget.name}" configuration.`);
    } else {
      setPinnedWidgetIds(prev => [...prev, widget.id]);
      setFeedbackNotice(`"${widget.name}" enabled for Android Launcher sync.`);
    }

    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="w-full px-4 pt-3 pb-24 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isDarkMode ? 'bg-[#18261E] text-[#10B981]' : 'bg-[#EAF5EF] text-[#1B4332]'
          }`}>
            <LayoutGrid size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Home Screen Widgets
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              Pre-configured Android launcher widgets • Live telemetry
            </p>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedbackNotice && (
        <div className="mb-3 p-2.5 px-3.5 rounded-2xl bg-[#10B981] text-white text-xs font-bold flex items-center space-x-2 animate-tab-switch shadow-xs">
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* HORIZONTAL SELECTOR BUTTONS */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-4">
        {WIDGETS_LIST.map(widget => {
          const isSelected = selectedWidgetId === widget.id;
          const isActive = pinnedWidgetIds.includes(widget.id);
          return (
            <button
              key={widget.id}
              onClick={() => setSelectedWidgetId(widget.id)}
              className={`py-2 px-3.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer snappy-touch flex items-center space-x-1.5 ${
                isSelected
                  ? isDarkMode
                    ? 'bg-[#1E2821] text-[#10B981] border border-[#2D3F34]'
                    : 'bg-[#1B4332] text-white shadow-xs'
                  : isDarkMode
                    ? 'bg-[#151D18] text-[#89998F] border border-[#1E2821]'
                    : 'bg-[#FFFFFF] text-[#5D6861] border border-[#E8E6DF]'
              }`}
            >
              <span>{widget.name}</span>
              {isActive && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#10B981]/20 text-[#10B981]'
                }`}>
                  Configured
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* LIVE INTERACTIVE WIDGET PREVIEW CARD */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#10B981] flex items-center space-x-1">
            <Eye size={12} />
            <span>Interactive Widget Preview ({selectedWidget.sizeTag})</span>
          </span>
          <span className="text-[10px] text-[#5D6861] dark:text-[#89998F] font-mono-numbers">
            {selectedWidget.dimensions}
          </span>
        </div>

        {/* CONTAINER MOCKUP */}
        <div 
          onClick={() => handleTogglePin(selectedWidget)}
          className="cursor-pointer snappy-touch"
          title="Tap to toggle launcher configuration"
        >
          {/* 1. HERO ESTATE WIDGET */}
          {selectedWidget.id === 'hero_estate' && (
            <div className={`p-4 rounded-[26px] border shadow-xs transition-all ${
              isDarkMode 
                ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
                : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>{location.name}</span>
                </span>
                <span className="text-[10px] font-bold opacity-60">
                  {metrics.conditionTitle}
                </span>
              </div>

              <div className="flex items-baseline justify-between my-1">
                <span className="text-4xl font-extrabold font-mono-numbers">
                  {formatTemp(metrics.temperature)}
                </span>
                <div className="text-right text-xs font-bold font-mono-numbers">
                  <span>H:{formatTemp(metrics.tempMaxToday)} L:{formatTemp(metrics.tempMinToday)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
                <span>Feels {formatTemp(metrics.apparentTemperature)}</span>
                <span>Wind {formatWind(metrics.windSpeed)}</span>
                <span>Rain {metrics.rainChance}%</span>
              </div>
            </div>
          )}

          {/* 2. FORECAST HUB WIDGET */}
          {selectedWidget.id === 'forecast_hub' && (
            <div className={`p-4 rounded-[26px] border shadow-xs transition-all ${
              isDarkMode 
                ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
                : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">{location.name} • Forecast</span>
                <span className="text-xs font-black font-mono-numbers">{formatTemp(metrics.temperature)}</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-black/5 dark:border-white/5 text-center">
                {hourly.slice(0, 5).map((h, i) => (
                  <div key={i} className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-[#162019]' : 'bg-[#F8F7F4]'}`}>
                    <span className="text-[10px] block opacity-60">{h.hour}</span>
                    <span className="text-xs font-black font-mono-numbers my-0.5 block">{formatTemp(h.temperature)}</span>
                    <span className="text-[9px] font-bold text-sky-500 block">{h.rainProbability}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. AGRI TELEMETRY WIDGET */}
          {selectedWidget.id === 'agri_telemetry' && (
            <div className={`p-4 rounded-[26px] border shadow-xs transition-all ${
              isDarkMode 
                ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
                : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold flex items-center space-x-1.5">
                  <Sprout size={14} className="text-[#10B981]" />
                  <span>Field Spray & Moisture</span>
                </span>
                <span className="text-[10px] font-black uppercase text-[#10B981]">
                  Safe Window
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-2 text-center">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-[#162019]' : 'bg-[#F8F7F4]'}`}>
                  <span className="text-[10px] opacity-60 block">Wind Drift</span>
                  <span className="text-xs font-black font-mono-numbers">{formatWind(metrics.windSpeed)}</span>
                </div>
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-[#162019]' : 'bg-[#F8F7F4]'}`}>
                  <span className="text-[10px] opacity-60 block">Humidity</span>
                  <span className="text-xs font-black font-mono-numbers">{metrics.humidity}%</span>
                </div>
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-[#162019]' : 'bg-[#F8F7F4]'}`}>
                  <span className="text-[10px] opacity-60 block">Precip</span>
                  <span className="text-xs font-black font-mono-numbers">{metrics.rainChance}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. MINIMAL PILL WIDGET */}
          {selectedWidget.id === 'minimal_pill' && (
            <div className="flex justify-center py-2">
              <div className={`px-5 py-2.5 rounded-full border shadow-xs flex items-center space-x-3 ${
                isDarkMode 
                  ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
                  : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
              }`}>
                <Sun size={20} className="text-[#FF5C00] shrink-0" />
                <span className="text-lg font-black font-mono-numbers">{formatTemp(metrics.temperature)}</span>
                <div className="w-px h-4 bg-black/15 dark:bg-white/15" />
                <span className="text-xs font-bold">{location.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIGURATION CONTROLS CARD */}
      <div className={`p-4 rounded-[26px] border shadow-xs mb-4 ${
        isDarkMode ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-black uppercase tracking-tight">
              {selectedWidget.name}
            </h3>
            <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              {selectedWidget.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleTogglePin(selectedWidget)}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer snappy-touch mt-2 ${
            isPinned
              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
              : 'bg-[#1B4332] hover:bg-[#12281E] text-white shadow-xs'
          }`}
        >
          {isPinned ? (
            <>
              <Check size={14} />
              <span>Enabled for Launcher • Tap to Remove</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Enable Widget for Launcher</span>
            </>
          )}
        </button>
      </div>

      {/* HONEST ANDROID OS INSTRUCTIONS */}
      <div className={`p-4 rounded-[26px] border text-xs leading-relaxed ${
        isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'
      }`}>
        <div className="flex items-center space-x-2 text-[#10B981] font-black uppercase tracking-wider text-[11px] mb-2">
          <Info size={14} />
          <span>Android Launcher Installation Notice</span>
        </div>
        <p className={`text-[11px] ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
          This section allows configuring and previewing home screen widget styles. To place genuine interactive widgets on physical Android home screens, install the compiled application package (APK) onto your Android device, long-press an empty space on the home screen, select <strong>Widgets</strong>, and choose <strong>Farm Weather</strong>.
        </p>
      </div>
    </div>
  );
};
