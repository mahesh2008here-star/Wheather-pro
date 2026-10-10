import React from 'react';
import { CloudRain, Droplets } from 'lucide-react';
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
  const { isDarkMode } = useTheme();

  const maxIntensity = Math.max(1.5, ...minuteItems.map(m => m.intensity));
  const hasRain = minuteItems.some(m => m.intensity > 0) || currentPrecipRate > 0;

  return (
    <div className="w-full px-4 pt-2 pb-1">
      <div 
        className={`p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              hasRain ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              <CloudRain size={14} />
            </div>
            <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Next-Hour Precipitation
            </span>
          </div>

          <span className={`text-[11px] font-semibold ${
            hasRain ? 'text-sky-500 font-bold' : isDarkMode ? 'text-zinc-500' : 'text-stone-500'
          }`}>
            {hasRain ? 'Showers expected' : 'Dry conditions next 60 min'}
          </span>
        </div>

        {/* Rain Intensity Bars for 60 Minutes */}
        <div className="h-16 w-full flex items-end justify-between gap-1 pt-2 pb-1">
          {minuteItems.map((item, idx) => {
            const heightPercent = hasRain ? Math.max(8, (item.intensity / maxIntensity) * 100) : 6;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div 
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    hasRain
                      ? item.intensity > 2
                        ? 'bg-gradient-to-t from-sky-600 to-sky-400'
                        : 'bg-sky-500/60 hover:bg-sky-400'
                      : isDarkMode ? 'bg-zinc-800' : 'bg-stone-200'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Time Markers */}
        <div className="flex justify-between text-[10px] font-bold text-zinc-500 pt-1 border-t border-black/5 dark:border-white/5">
          <span>Now</span>
          <span>15 min</span>
          <span>30 min</span>
          <span>45 min</span>
          <span>60 min</span>
        </div>
      </div>
    </div>
  );
};
