import React, { useState } from 'react';
import { CloudRain, Droplets, Info, Sparkles } from 'lucide-react';
import { MinuteRainItem } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface NextHourRainChartProps {
  minuteItems: MinuteRainItem[];
  currentPrecipRate: number;
}

export const NextHourRainChart: React.FC<NextHourRainChartProps> = ({
  minuteItems,
  currentPrecipRate,
}) => {
  const { isDarkMode, customAccentColor } = useTheme();
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState<number | null>(null);

  const maxIntensity = Math.max(1.8, ...minuteItems.map(m => m.intensity));
  const hasRain = minuteItems.some(m => m.intensity > 0) || currentPrecipRate > 0;
  
  // Calculate peak rain minute & expected average
  const peakItem = [...minuteItems].sort((a, b) => b.intensity - a.intensity)[0];
  const totalApproxSum = (minuteItems.reduce((acc, curr) => acc + curr.intensity, 0) / minuteItems.length).toFixed(1);

  // Status message calculation
  let statusText = 'Dry conditions next 60 min';
  if (hasRain) {
    if (peakItem && peakItem.intensity > 3) {
      statusText = `Heavy rain peak (~${peakItem.intensity} mm/h) in ${peakItem.minute} min`;
    } else if (peakItem && peakItem.intensity > 0) {
      statusText = `Light to moderate showers (~${peakItem.intensity} mm/h)`;
    } else {
      statusText = 'Intermittent drizzle expected';
    }
  }

  const activeItem = selectedMinuteIndex !== null ? minuteItems[selectedMinuteIndex] : peakItem;

  return (
    <div className="w-full px-4 pt-2 pb-1 select-none">
      <div 
        className={`p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        {/* Header Title & Dynamic Status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${
              hasRain ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              <CloudRain size={16} />
            </div>
            <div>
              <span className={`text-xs font-black tracking-tight block ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Next-Hour MinuteCast™
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold block">
                Minute-by-minute rainfall forecast
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[11px] font-black block ${
              hasRain ? 'text-sky-400' : 'text-emerald-500'
            }`}>
              {statusText}
            </span>
            {hasRain && (
              <span className="text-[10px] font-bold text-zinc-400">
                Avg: {totalApproxSum} mm/h
              </span>
            )}
          </div>
        </div>

        {/* Selected Minute Inspection Banner */}
        {activeItem && hasRain && (
          <div className="my-1.5 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-between text-[11px] font-bold text-sky-300 animate-fadeIn">
            <span className="flex items-center space-x-1">
              <Sparkles size={12} className="text-sky-400 shrink-0" />
              <span>Min {activeItem.minute}: <strong className="text-white capitalize">{activeItem.label}</strong> ({activeItem.intensity} mm/h)</span>
            </span>
            <span className="text-[10px] text-zinc-400">Tap bars to inspect</span>
          </div>
        )}

        {/* Rain Intensity Bars for 60 Minutes (12 Intervals) */}
        <div className="h-16 w-full flex items-end justify-between gap-1.5 pt-2 pb-1 relative">
          {/* Horizontal Grid Intensity Threshold Lines */}
          <div className="absolute inset-x-0 top-3 border-b border-dashed border-white/10 pointer-events-none" />
          <div className="absolute inset-x-0 top-8 border-b border-dashed border-white/5 pointer-events-none" />

          {minuteItems.map((item, idx) => {
            const isSelected = selectedMinuteIndex === idx;
            const heightPercent = hasRain 
              ? Math.max(12, Math.min(100, (item.intensity / maxIntensity) * 100)) 
              : 8;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedMinuteIndex(idx)}
                className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer snappy-touch"
                title={`Minute ${item.minute}: ${item.intensity} mm/h (${item.label})`}
              >
                <div 
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    hasRain
                      ? isSelected
                        ? 'bg-amber-400 ring-2 ring-amber-300 shadow-md scale-105'
                        : item.intensity > 3.0
                          ? 'bg-gradient-to-t from-indigo-600 via-sky-500 to-sky-300'
                          : item.intensity > 1.2
                            ? 'bg-gradient-to-t from-sky-600 to-sky-400'
                            : 'bg-sky-500/70 hover:bg-sky-400'
                      : isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700' : 'bg-stone-200 hover:bg-stone-300'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Time Markers */}
        <div className="flex justify-between text-[10px] font-bold text-zinc-500 pt-1.5 border-t border-black/5 dark:border-white/10">
          <span>Now</span>
          <span>15m</span>
          <span>30m</span>
          <span>45m</span>
          <span>60m</span>
        </div>
      </div>
    </div>
  );
};
