import React, { useState } from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning,
  CalendarDays,
  ChevronDown,
  Droplets,
  CloudRainWind,
  Wind,
  SunMedium,
  Sparkles
} from 'lucide-react';
import { DailyForecastItem, HourlyForecastItem } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface ForecastSectionProps {
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
  currentTemp: number;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({
  daily,
  hourly,
  currentTemp,
}) => {
  const { isDarkMode, formatTemp, formatWind } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(prev => (prev === idx ? null : idx));
  };

  const renderWeatherIcon = (code: number, size = 18) => {
    if (code === 0 || code === 1) return <Sun size={size} className="text-amber-500 shrink-0" />;
    if (code === 2) return <CloudSun size={size} className="text-amber-500 shrink-0" />;
    if (code === 3) return <Cloud size={size} className="text-slate-400 shrink-0" />;
    if ([51, 53, 55].includes(code)) return <CloudDrizzle size={size} className="text-blue-400 shrink-0" />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={size} className="text-blue-500 shrink-0" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning size={size} className="text-purple-500 shrink-0" />;
    return <CloudSun size={size} className="text-amber-500 shrink-0" />;
  };

  // Find overall min and max for range normalization
  const overallMin = Math.min(...daily.map(d => d.tempMin), currentTemp - 5);
  const overallMax = Math.max(...daily.map(d => d.tempMax), currentTemp + 5);
  const totalRange = Math.max(1, overallMax - overallMin);

  return (
    <div className="w-full px-4 py-3">
      {/* HOURLY STRIP */}
      <div 
        className={`mb-3.5 p-3.5 rounded-2xl transition-all ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-zinc-200' : 'text-stone-700'}`}>
            Hourly outlook
          </span>
          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
            Next 24h
          </span>
        </div>

        <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
          {hourly.slice(0, 16).map((item, idx) => (
            <div 
              key={idx}
              className={`flex flex-col items-center min-w-[50px] p-2 rounded-xl transition-all ${
                item.isCurrent 
                  ? isDarkMode 
                    ? 'bg-sky-500/20 border border-sky-400/40' 
                    : 'bg-sky-50 border border-sky-200' 
                  : 'hover:bg-stone-50/50 dark:hover:bg-zinc-950'
              }`}
            >
              <span className={`text-[11px] font-semibold mb-1.5 ${
                item.isCurrent 
                  ? 'text-sky-400 font-bold' 
                  : isDarkMode ? 'text-zinc-400' : 'text-stone-500'
              }`}>
                {item.hour}
              </span>
              <div className="my-1">
                {renderWeatherIcon(item.weatherCode, 20)}
              </div>
              <span className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {formatTemp(item.temperature)}
              </span>
              {item.rainProbability > 0 ? (
                <span className="text-[10px] font-bold text-sky-400 mt-1">
                  {item.rainProbability}%
                </span>
              ) : (
                <span className="text-[10px] opacity-0 mt-1">0%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7-DAY FORECAST WITH EXPANDABLE DAILY ITEMS */}
      <div 
        className={`p-4 rounded-2xl transition-all ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-white/10">
          <div className="flex items-center space-x-2">
            <CalendarDays size={16} className={isDarkMode ? 'text-zinc-400' : 'text-stone-500'} />
            <h3 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              7-day forecast
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-stone-400 dark:text-zinc-400">
            Tap a day to expand
          </span>
        </div>

        <div className="space-y-1.5">
          {daily.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const minPos = ((item.tempMin - overallMin) / totalRange) * 100;
            const maxPos = ((item.tempMax - overallMin) / totalRange) * 100;
            const barWidth = Math.max(8, maxPos - minPos);
            const itemHumidity = item.humidity ?? (item.rainProbability > 50 ? 82 : 64);
            const itemWind = item.windSpeedMax ?? 16;
            const itemRainHours = item.precipitationHours ?? (item.precipitationSum > 5 ? 4 : item.rainProbability > 30 ? 2 : 0);

            return (
              <div 
                key={idx}
                className={`rounded-xl transition-all duration-200 ${
                  isExpanded
                    ? isDarkMode
                      ? 'bg-zinc-950 border border-sky-400/40 shadow-xs'
                      : 'bg-stone-50 ring-1 ring-emerald-600/20 shadow-xs'
                    : 'hover:bg-stone-50/50 dark:hover:bg-zinc-950'
                }`}
              >
                {/* INTERACTIVE TAP ROW */}
                <div 
                  onClick={() => toggleExpand(idx)}
                  className="flex items-center justify-between text-xs py-2 px-2 cursor-pointer select-none"
                >
                  {/* Day name & brief condition */}
                  <div className="w-24">
                    <span className={`font-semibold block ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>
                      {item.dayName}
                    </span>
                    {item.rainProbability > 10 ? (
                      <span className="text-[10px] font-medium text-blue-500">
                        💧 {item.rainProbability}%
                      </span>
                    ) : (
                      <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                        {item.conditionDescription}
                      </span>
                    )}
                  </div>

                  {/* Weather icon */}
                  <div className="w-7 flex justify-center">
                    {renderWeatherIcon(item.weatherCode, 18)}
                  </div>

                  {/* Min temp */}
                  <span className={`w-8 text-right font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                    {formatTemp(item.tempMin)}
                  </span>

                  {/* Temperature Range Bar */}
                  <div className="flex-1 mx-2.5 h-1.5 rounded-full bg-stone-100 dark:bg-slate-700 relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${Math.min(90, Math.max(0, minPos))}%`,
                        width: `${Math.min(100 - minPos, barWidth)}%`,
                      }}
                    />
                  </div>

                  {/* Max temp */}
                  <span className={`w-8 text-left font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    {formatTemp(item.tempMax)}
                  </span>

                  {/* Expand Chevron Icon */}
                  <div className="pl-1">
                    <ChevronDown 
                      size={14} 
                      className={`text-stone-400 dark:text-slate-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-emerald-500 dark:text-emerald-400' : ''
                      }`} 
                    />
                  </div>
                </div>

                {/* EXPANDABLE DETAIL DRAWER (Revealing Precipitation Breakdown & Humidity) */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-stone-200/50 dark:border-white/10 animate-card-slide-fade">
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {/* 1. PRECIPITATION BREAKDOWN CARD */}
                      <div className={`p-2.5 rounded-xl ${
                        isDarkMode ? 'bg-[#000000] border border-white/15' : 'bg-white border border-stone-200/60'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1">
                            <CloudRainWind size={12} className="mr-1" />
                            <span>Precipitation</span>
                          </span>
                          <span className="text-xs font-black text-sky-400">
                            {item.rainProbability}%
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-stone-500 dark:text-zinc-400 text-[11px]">Expected Volume:</span>
                          <span className="font-bold text-stone-900 dark:text-white">
                            {item.precipitationSum > 0 ? `${item.precipitationSum} mm` : '0.0 mm'}
                          </span>
                        </div>

                        {/* Rain Probability Meter */}
                        <div className="mt-1.5 w-full h-1.5 rounded-full bg-sky-100 dark:bg-zinc-800 overflow-hidden">
                          <div 
                            className="h-full bg-sky-500 rounded-full" 
                            style={{ width: `${item.rainProbability}%` }}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
                          <span>Duration:</span>
                          <span>{itemRainHours > 0 ? `~${itemRainHours} hrs duration` : 'No rain window'}</span>
                        </div>
                      </div>

                      {/* 2. HUMIDITY & COMFORT CARD */}
                      <div className={`p-2.5 rounded-xl ${
                        isDarkMode ? 'bg-[#000000] border border-white/15' : 'bg-white border border-stone-200/60'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1">
                            <Droplets size={12} className="mr-1" />
                            <span>Humidity Levels</span>
                          </span>
                          <span className="text-xs font-black text-teal-400">
                            {itemHumidity}%
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-stone-500 dark:text-zinc-400 text-[11px]">Relative Level:</span>
                          <span className="font-bold text-stone-900 dark:text-white">
                            {itemHumidity > 80 ? 'Humid' : itemHumidity > 60 ? 'Comfortable' : 'Crisp & Dry'}
                          </span>
                        </div>

                        {/* Humidity Level Meter */}
                        <div className="mt-1.5 w-full h-1.5 rounded-full bg-teal-100 dark:bg-zinc-800 overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: `${itemHumidity}%` }}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
                          <span>Comfort:</span>
                          <span className={itemHumidity > 80 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {itemHumidity > 80 ? 'Muggy feel' : 'Fresh breeze'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DAILY CONSUMER WEATHER SUMMARY STRIP */}
                    <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-800 dark:text-sky-300 text-[11px] font-medium border border-sky-400/20">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Sparkles size={12} className="shrink-0 text-sky-400" />
                        <span className="truncate">
                          {item.precipitationSum >= 5 
                            ? 'Wet conditions expected — rain jacket or umbrella recommended' 
                            : item.rainProbability > 40 
                              ? 'Passing showers possible — plan outdoor commutes accordingly' 
                              : 'Clear & pleasant weather — ideal for outdoor sports and walking'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold whitespace-nowrap ml-2 opacity-80">
                        💨 Max {formatWind(itemWind)} • UV {item.uvIndexMax}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
