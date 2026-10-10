import React from 'react';
import { 
  Wind as WindIcon, 
  Droplets, 
  Gauge, 
  Eye, 
  SunMedium, 
  ShieldCheck, 
  Compass, 
  Cloud 
} from 'lucide-react';
import { CurrentWeatherMetrics } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface ConditionsGridProps {
  metrics: CurrentWeatherMetrics;
}

export const ConditionsGrid: React.FC<ConditionsGridProps> = ({ metrics }) => {
  const { isDarkMode, formatTemp, formatWind, formatPressure } = useTheme();

  // Animation trigger key when weather updates
  const refreshKey = `${metrics.lastUpdated}-${metrics.sceneState}-${metrics.temperature}`;

  return (
    <div className="w-full px-4 pt-2 pb-2">
      {/* 2-COLUMN GRID OF MODERN CONSUMER WEATHER CARDS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. WIND & GUSTS CARD */}
        <div 
          key={`wind-${refreshKey}`}
          style={{ animationDelay: '0.02s' }}
          className={`animate-card-slide-fade p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
              : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
              Wind
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <WindIcon size={16} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              {formatWind(metrics.windSpeed)}
            </span>
          </div>
          <p className={`text-[11px] mt-1 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
            Gusts to {formatWind(metrics.windGusts)}
          </p>

          <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
            <span className="flex items-center text-emerald-500 font-bold">
              <Compass size={12} className="mr-1" />
              {metrics.windDirectionCardinal} ({metrics.windDirection}°)
            </span>
            <span className={isDarkMode ? 'text-zinc-500' : 'text-stone-400'}>Surface</span>
          </div>
        </div>

        {/* 2. HUMIDITY & DEW POINT CARD */}
        <div 
          key={`hum-${refreshKey}`}
          style={{ animationDelay: '0.06s' }}
          className={`animate-card-slide-fade p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
              : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
              Humidity
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Droplets size={16} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              {metrics.humidity}%
            </span>
          </div>
          <p className={`text-[11px] mt-1 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
            Dew point {formatTemp(metrics.dewPoint)}
          </p>

          <div className="mt-2.5 w-full h-1.5 rounded-full bg-blue-100 dark:bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${metrics.humidity}%` }}
            />
          </div>
        </div>

        {/* 3. BAROMETER / PRESSURE CARD */}
        <div 
          key={`press-${refreshKey}`}
          style={{ animationDelay: '0.10s' }}
          className={`animate-card-slide-fade p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
              : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
              Pressure
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Gauge size={16} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              {formatPressure(metrics.pressure)}
            </span>
          </div>
          <p className={`text-[11px] mt-1 font-medium capitalize ${
            metrics.pressureTendency === 'rising' ? 'text-emerald-500' : metrics.pressureTendency === 'falling' ? 'text-amber-500' : isDarkMode ? 'text-zinc-400' : 'text-stone-500'
          }`}>
            Tendency: {metrics.pressureTendency}
          </p>

          <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
            <span className={isDarkMode ? 'text-zinc-400' : 'text-stone-600'}>MSL Baseline</span>
            <span className="font-semibold text-purple-400">1013 hPa std</span>
          </div>
        </div>

        {/* 4. VISIBILITY & CLOUDS CARD */}
        <div 
          key={`vis-${refreshKey}`}
          style={{ animationDelay: '0.14s' }}
          className={`animate-card-slide-fade p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
              : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
              Visibility
            </span>
            <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
              <Eye size={16} />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              {metrics.visibility} km
            </span>
          </div>
          <p className={`text-[11px] mt-1 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
            {metrics.visibility >= 10 ? 'Clear horizon' : 'Haze or mist'}
          </p>

          <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
            <span className="flex items-center text-sky-400 font-bold">
              <Cloud size={12} className="mr-1" />
              {metrics.cloudCover}% clouds
            </span>
            <span className={isDarkMode ? 'text-zinc-500' : 'text-stone-400'}>Ceiling high</span>
          </div>
        </div>
      </div>

      {/* 5. AIR QUALITY PILL CARD */}
      <div 
        key={`aqi-${refreshKey}`}
        style={{ animationDelay: '0.18s' }}
        className={`animate-card-slide-fade mt-2.5 p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold block ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Air Quality Index
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {metrics.airQuality.aqi} • {metrics.airQuality.category}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                {metrics.airQuality.healthAdvice}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-zinc-500 block">PM2.5</span>
            <span className={`text-xs font-black ${isDarkMode ? 'text-zinc-200' : 'text-stone-800'}`}>
              {metrics.airQuality.pm25} µg/m³
            </span>
          </div>
        </div>
      </div>

      {/* 6. UV INDEX CARD */}
      <div 
        key={`uv-${refreshKey}`}
        style={{ animationDelay: '0.22s' }}
        className={`animate-card-slide-fade mt-2.5 p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <SunMedium size={16} />
            </div>
            <div>
              <span className={`text-xs font-semibold block ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                UV index
              </span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {metrics.uvIndex}
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {metrics.uvLevel}
                </span>
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
            Peak exposure 11 AM - 3 PM
          </span>
        </div>

        {/* 5-Color Spectrum Bar */}
        <div className="mt-3">
          <div className="relative w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-600">
            <div 
              className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md border border-stone-400 -ml-1 transition-all duration-500"
              style={{ left: `${Math.min(95, Math.max(5, (metrics.uvIndex / 11) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 mt-1">
            <span>Low</span>
            <span>Mod</span>
            <span>High</span>
            <span>Extreme</span>
          </div>
        </div>
      </div>
    </div>
  );
};
