import React, { useState } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Check, 
  Copy, 
  Sun, 
  CloudSun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Compass, 
  Layers,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../types/weather';
import { FarmWeatherHero } from './FarmWeatherHero';

interface AndroidHomeWidgetsProps {
  metrics: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  location: LocationInfo;
  onSelectWidgetPreview?: (widgetKey: string) => void;
}

export const WeatherWidgetsScreen: React.FC<AndroidHomeWidgetsProps> = ({
  metrics,
  hourly,
  location,
}) => {
  const { isDarkMode, formatTemp, formatWind } = useTheme();
  const [selectedWidget, setSelectedWidget] = useState<'glance_medium' | 'glance_pill' | 'house_hero' | 'clock_weather'>('house_hero');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyNotice = (widgetName: string) => {
    setCopiedKey(widgetName);
    navigator.clipboard?.writeText?.(
      `// Android Material You Widget Configuration\n// Widget: ${widgetName}\n// Location: ${location.name}\n// Temp: ${formatTemp(metrics.temperature)}\n// Condition: ${metrics.conditionTitle}`
    );
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className={`w-full min-h-full px-4 pt-3 pb-24 transition-colors ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F4F6FA] text-slate-900'
    }`}>
      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Android Home Screen Widgets
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Material You adaptable widgets with live house & weather scenery
            </p>
          </div>
        </div>
      </div>

      {/* ANDROID WIDGET SELECTOR TABS */}
      <div className={`flex space-x-1 p-1 rounded-2xl mb-4 border ${
        isDarkMode ? 'bg-[#12141A] border-white/10' : 'bg-slate-200/70 border-slate-300/60'
      }`}>
        {[
          { id: 'house_hero' as const, label: 'House Scene (4×2)' },
          { id: 'glance_medium' as const, label: 'Material Forecast (4×2)' },
          { id: 'clock_weather' as const, label: 'At a Glance (3×1)' },
          { id: 'glance_pill' as const, label: 'Compact Pill (2×1)' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedWidget(item.id)}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all text-center ${
              selectedWidget === item.id
                ? isDarkMode
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                  : 'bg-white text-teal-700 border border-teal-600/20 shadow-xs font-bold'
                : isDarkMode
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* WIDGET PREVIEW CARD (ON HOMESCREEN MOCKUP) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
            Interactive Home Screen Preview
          </span>
          <span className="text-[10px] text-zinc-500">
            Android 14+ / 15 Material You
          </span>
        </div>

        {/* WIDGET 1: THE HOUSE SCENERY WIDGET */}
        {selectedWidget === 'house_hero' && (
          <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
            {/* Embedded Live House Scenery with real weather */}
            <div className="relative w-full h-[210px] overflow-hidden">
              <FarmWeatherHero
                sceneState={metrics.sceneState}
                temperature={metrics.temperature}
                conditionTitle={metrics.conditionTitle}
                isLive={true}
                tempMin={metrics.tempMinToday}
                tempMax={metrics.tempMaxToday}
                apparentTemperature={metrics.apparentTemperature}
              />
            </div>
            {/* Material You bottom glass footer */}
            <div className={`p-3 flex items-center justify-between backdrop-blur-md border-t ${
              isDarkMode 
                ? 'bg-black/85 border-white/10 text-white' 
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs font-bold">{location.name}</span>
                <span className="text-[11px] opacity-70">
                  • High {formatTemp(metrics.tempMaxToday)} / Low {formatTemp(metrics.tempMinToday)}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                Tap opens App
              </span>
            </div>
          </div>
        )}

        {/* WIDGET 2: MATERIAL FORECAST (4x2) */}
        {selectedWidget === 'glance_medium' && (
          <div className={`w-full p-4 rounded-3xl border shadow-xl transition-all ${
            isDarkMode 
              ? 'bg-[#151922] border-white/10 text-white' 
              : 'bg-[#EBF2F7] border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide">
                  {location.name}
                </p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-3xl font-black">{formatTemp(metrics.temperature)}</span>
                  <span className="text-sm font-semibold">{metrics.conditionTitle}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block">
                  H:{formatTemp(metrics.tempMaxToday)} L:{formatTemp(metrics.tempMinToday)}
                </span>
                <span className="text-[11px] opacity-70">
                  Feels {formatTemp(metrics.apparentTemperature)}
                </span>
              </div>
            </div>

            {/* Next 5 hours strip */}
            <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-black/10 dark:border-white/10">
              {hourly.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex flex-col items-center py-1">
                  <span className="text-[11px] opacity-75 mb-1">{item.hour}</span>
                  <span className="text-xs font-bold">{formatTemp(item.temperature)}</span>
                  {item.rainProbability > 0 && (
                    <span className="text-[9px] font-semibold text-teal-400 mt-0.5">
                      {item.rainProbability}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIDGET 3: AT A GLANCE (3x1) */}
        {selectedWidget === 'clock_weather' && (
          <div className={`w-full p-4 rounded-3xl border shadow-lg flex items-center justify-between ${
            isDarkMode 
              ? 'bg-[#151922] border-white/10 text-white' 
              : 'bg-[#EBF2F7] border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                <Sun size={26} />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black">{formatTemp(metrics.temperature)}</span>
                  <span className="text-xs font-bold text-teal-400">{location.name}</span>
                </div>
                <p className="text-[11px] opacity-70 font-medium">
                  {metrics.conditionTitle} • Humidity {metrics.humidity}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold block text-teal-400">
                Wind {formatWind(metrics.windSpeed)}
              </span>
              <span className="text-[10px] opacity-60">
                AQI {metrics.airQuality.aqi} ({metrics.airQuality.category})
              </span>
            </div>
          </div>
        )}

        {/* WIDGET 4: COMPACT PILL (2x1) */}
        {selectedWidget === 'glance_pill' && (
          <div className="flex justify-center">
            <div className={`px-5 py-3 rounded-full border shadow-lg flex items-center space-x-3.5 ${
              isDarkMode 
                ? 'bg-[#151922] border-white/10 text-white' 
                : 'bg-[#EBF2F7] border-slate-200 text-slate-800'
            }`}>
              <Sun size={20} className="text-amber-400 shrink-0" />
              <span className="text-lg font-black">{formatTemp(metrics.temperature)}</span>
              <div className="h-4 w-px bg-white/20" />
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight">{location.name}</span>
                <span className="text-[10px] opacity-70 leading-tight block">{metrics.conditionTitle}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HOW TO ADD ON ANDROID */}
      <div className={`p-4 rounded-3xl border mb-4 ${
        isDarkMode ? 'bg-[#10131A] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center space-x-1.5">
          <Smartphone size={14} />
          <span>How to Add to Android Home Screen</span>
        </h3>
        <ol className="space-y-2 text-xs opacity-85 leading-relaxed">
          <li className="flex items-start space-x-2">
            <span className="font-bold text-teal-400">1.</span>
            <span>Long-press any empty space on your Android phone's home screen.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-teal-400">2.</span>
            <span>Tap <strong>Widgets</strong> in the pop-up menu.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-teal-400">3.</span>
            <span>Find <strong>WeatherApp</strong> and drag your preferred widget to the screen.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-teal-400">4.</span>
            <span>Tapping the widget directly launches your live house scenery and saved weather location!</span>
          </li>
        </ol>
      </div>

      {/* COPY WIDGET CONFIGURATION BUTTON */}
      <button
        onClick={() => handleCopyNotice(selectedWidget)}
        className="w-full py-3 px-4 rounded-2xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
      >
        {copiedKey === selectedWidget ? (
          <>
            <Check size={16} />
            <span>Widget Configuration Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span>Copy Widget Code / Config</span>
          </>
        )}
      </button>
    </div>
  );
};
