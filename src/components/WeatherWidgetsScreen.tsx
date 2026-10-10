import React, { useState } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Copy, 
  Check, 
  Sun, 
  CloudRain, 
  Wind, 
  Layers, 
  ExternalLink,
  Compass,
  Palette,
  Eye,
  Sliders
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../types/weather';
import { FarmWeatherHero } from './FarmWeatherHero';

interface WeatherWidgetsScreenProps {
  metrics: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  location: LocationInfo;
}

export const WeatherWidgetsScreen: React.FC<WeatherWidgetsScreenProps> = ({
  metrics,
  hourly,
  location,
}) => {
  const { isDarkMode, formatTemp, formatWind } = useTheme();
  const [selectedWidgetType, setSelectedWidgetType] = useState<'medium' | 'small' | 'large' | 'lockscreen'>('medium');
  const [widgetTheme, setWidgetTheme] = useState<'oled' | 'glass' | 'neon'>('oled');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    setCopied(true);
    navigator.clipboard?.writeText?.(`// Weather Pro iOS WidgetKit & Android Glance
// Type: ${selectedWidgetType.toUpperCase()} | Theme: ${widgetTheme.toUpperCase()}
// Location: ${location.name} (${location.latitude}, ${location.longitude})
// Live Condition: ${metrics.conditionTitle} (${metrics.temperature}°C)
// Auto-Scene State: ${metrics.sceneState}
// OLED Pure Black Enabled: ${isDarkMode}`);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={`w-full min-h-full px-4 pt-3 pb-24 transition-colors ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F8F6F0] text-stone-900'
    }`}>
      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-amber-400" size={20} />
          <h1 className="text-2xl font-black tracking-tight">
            Microclimate Widgets
          </h1>
        </div>
        <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
          Interactive home screen & lock screen widgets with auto-weather scene
        </p>
      </div>

      {/* WIDGET SIZE PICKER */}
      <div className={`flex space-x-1.5 p-1 rounded-2xl mb-3 border ${
        isDarkMode ? 'bg-[#0A0A0C] border-white/10' : 'bg-black/5 border-black/5'
      }`}>
        {[
          { id: 'medium' as const, label: 'Medium 4x2' },
          { id: 'small' as const, label: 'Small 2x2' },
          { id: 'large' as const, label: 'Bento 4x4' },
          { id: 'lockscreen' as const, label: 'Lock Screen' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedWidgetType(item.id)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedWidgetType === item.id
                ? isDarkMode
                  ? 'bg-white text-black shadow-lg scale-[1.02]'
                  : 'bg-stone-900 text-white shadow-md scale-[1.02]'
                : isDarkMode
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* WIDGET THEME SELECTOR */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-bold text-zinc-500 flex items-center space-x-1">
          <Palette size={12} />
          <span>Style Preset</span>
        </span>
        <div className="flex space-x-1">
          {[
            { id: 'oled' as const, label: 'OLED Black' },
            { id: 'glass' as const, label: 'Frosted Glass' },
            { id: 'neon' as const, label: 'Neon Cyber' },
          ].map(theme => (
            <button
              key={theme.id}
              onClick={() => setWidgetTheme(theme.id)}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                widgetTheme === theme.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : isDarkMode
                  ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                  : 'bg-stone-200/70 text-stone-700'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* WIDGET PREVIEW SHOWCASE */}
      <div className="w-full flex flex-col items-center justify-center py-2">
        {/* 1. MEDIUM 4x2 WIDGET */}
        {selectedWidgetType === 'medium' && (
          <div 
            className={`w-full max-w-[360px] h-[175px] rounded-[32px] p-3.5 shadow-2xl overflow-hidden relative border transition-all ${
              widgetTheme === 'neon'
                ? 'bg-[#000000] border-sky-400/50 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
                : widgetTheme === 'glass'
                ? 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl'
                : isDarkMode 
                ? 'bg-[#000000] border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.95)]' 
                : 'bg-white border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            }`}
          >
            <div className="flex h-full w-full">
              {/* Left Column: Mini Animated Weather Microclimate Scene */}
              <div className="w-[145px] h-full rounded-2xl overflow-hidden relative shadow-inner shrink-0 border border-black/10 dark:border-white/15">
                <div className="scale-75 origin-top-left -ml-6 -mt-4 w-[240px] pointer-events-none">
                  <FarmWeatherHero
                    sceneState={metrics.sceneState}
                    temperature={metrics.temperature}
                    conditionTitle={metrics.conditionTitle}
                    isLive={false}
                  />
                </div>
              </div>

              {/* Right Column: Live Data & Hourly Forecast */}
              <div className="flex-1 pl-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-extrabold truncate max-w-[100px] ${isDarkMode ? 'text-zinc-200' : 'text-stone-800'}`}>
                      {location.name}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      AQI {metrics.airQuality.aqi}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {formatTemp(metrics.temperature)}
                    </span>
                    <span className="text-[11px] font-bold text-sky-400 truncate max-w-[90px]">
                      {metrics.conditionTitle}
                    </span>
                  </div>
                </div>

                {/* Mini Hourly Strip */}
                <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/10 text-center">
                  {hourly.slice(0, 4).map((h, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[9px] font-semibold text-zinc-500">{h.hour}</span>
                      <span className={`text-[10px] font-bold my-0.5 ${isDarkMode ? 'text-zinc-200' : 'text-stone-800'}`}>
                        {formatTemp(h.temperature)}
                      </span>
                      <span className="text-[8px] font-bold text-sky-400">{h.rainProbability}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SMALL 2x2 SQUARE WIDGET */}
        {selectedWidgetType === 'small' && (
          <div 
            className={`w-[175px] h-[175px] rounded-[32px] p-4 shadow-2xl overflow-hidden relative border transition-all flex flex-col justify-between ${
              widgetTheme === 'neon'
                ? 'bg-[#000000] border-sky-400/50 shadow-[0_0_25px_rgba(56,189,248,0.3)]'
                : widgetTheme === 'glass'
                ? 'bg-white/10 backdrop-blur-xl border-white/20'
                : isDarkMode 
                ? 'bg-[#000000] border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.95)]' 
                : 'bg-white border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            }`}
          >
            {/* Background Mini Scene */}
            <div className="absolute inset-0 opacity-40 pointer-events-none scale-60 origin-top-left -ml-8 -mt-6 w-[320px]">
              <FarmWeatherHero
                sceneState={metrics.sceneState}
                temperature={metrics.temperature}
                conditionTitle={metrics.conditionTitle}
                isLive={false}
              />
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className={`text-xs font-black truncate block ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {location.name}
                </span>
                <span className="text-[10px] font-bold text-sky-400">{metrics.conditionTitle}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="relative z-10">
              <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {formatTemp(metrics.temperature)}
              </span>
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 mt-1">
                <span>H:{formatTemp(metrics.tempMaxToday)}</span>
                <span>L:{formatTemp(metrics.tempMinToday)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. LARGE 4x4 BENTO PRO WIDGET */}
        {selectedWidgetType === 'large' && (
          <div 
            className={`w-full max-w-[360px] rounded-[36px] p-4 shadow-2xl overflow-hidden relative border transition-all ${
              widgetTheme === 'neon'
                ? 'bg-[#000000] border-sky-400/50 shadow-[0_0_35px_rgba(56,189,248,0.25)]'
                : widgetTheme === 'glass'
                ? 'bg-white/10 backdrop-blur-xl border-white/20'
                : isDarkMode 
                ? 'bg-[#000000] border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.95)]' 
                : 'bg-white border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            }`}
          >
            {/* Top Scene Banner */}
            <div className="w-full h-32 rounded-2xl overflow-hidden relative border border-black/10 dark:border-white/15 mb-3">
              <div className="scale-75 origin-top-left -ml-8 -mt-6 w-[440px] pointer-events-none">
                <FarmWeatherHero
                  sceneState={metrics.sceneState}
                  temperature={metrics.temperature}
                  conditionTitle={metrics.conditionTitle}
                  isLive={false}
                  apparentTemperature={metrics.apparentTemperature}
                />
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-black/5 dark:border-white/10">
              <div className="p-2 rounded-xl bg-black/5 dark:bg-zinc-950 border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold block">Wind</span>
                <span className="text-xs font-black">{formatWind(metrics.windSpeed)}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/5 dark:bg-zinc-950 border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold block">Humidity</span>
                <span className="text-xs font-black">{metrics.humidity}%</span>
              </div>
              <div className="p-2 rounded-xl bg-black/5 dark:bg-zinc-950 border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold block">UV Index</span>
                <span className="text-xs font-black text-amber-400">{metrics.uvIndex} Mod</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. LOCK SCREEN WIDGET */}
        {selectedWidgetType === 'lockscreen' && (
          <div className="w-full max-w-[340px] p-5 rounded-[36px] bg-[#000000] border border-white/15 shadow-2xl flex flex-col items-center space-y-4">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              OLED Lock Screen Glance
            </span>

            {/* Lockscreen Complications Row */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-2 border-white/20 p-1 flex flex-col items-center justify-center text-center">
                <span className="text-sm">☀️</span>
                <span className="text-sm font-black text-white mt-0.5">{formatTemp(metrics.temperature)}</span>
              </div>

              {/* Inline Lockscreen Complication */}
              <div className="px-3.5 py-2 rounded-2xl border border-white/20 text-xs font-bold text-white flex items-center space-x-2 bg-white/5">
                <span>📍 {location.name}</span>
                <span>•</span>
                <span className="text-sky-300">{formatTemp(metrics.temperature)} {metrics.conditionTitle}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WIDGET CODE & INTEGRATION FOOTER */}
      <div className={`mt-5 p-4 rounded-3xl border transition-all ${
        isDarkMode ? 'bg-[#0A0A0C] border-white/10' : 'bg-black/5 border-black/5'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold">Install to Home Screen</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied Specs!' : 'Copy Widget Specs'}</span>
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Supports iOS 18/19 WidgetKit (SwiftUI) and Android 15/16 Glance. The animated weather microclimate renders automatically using real-time local telemetry.
        </p>
      </div>
    </div>
  );
};

