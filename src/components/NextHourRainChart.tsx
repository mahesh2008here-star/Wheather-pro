import React, { useState } from 'react';
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
  const [activeMinuteIdx, setActiveMinuteIdx] = useState<number | null>(null);

  const maxIntensity = Math.max(1.5, ...minuteItems.map(m => m.intensity));
  const hasPrecipitation = minuteItems.some(m => m.intensity > 0) || currentPrecipRate > 0;
  
  // Peak rain and minute identification
  const peakItem = [...minuteItems].sort((a, b) => b.intensity - a.intensity)[0] || { minute: 0, intensity: 0 };
  const inspectItem = activeMinuteIdx !== null ? minuteItems[activeMinuteIdx] : peakItem;

  return (
    <div className="w-full px-4 py-2 select-none">
      <div 
        className={`w-full p-4 rounded-[26px] border shadow-xs transition-colors ${
          isDarkMode 
            ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
            : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        {/* Header with Title and Peak Summary */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              hasPrecipitation 
                ? 'bg-sky-500/20 text-sky-400' 
                : 'bg-[#10B981]/15 text-[#10B981]'
            }`}>
              <CloudRain size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-tight uppercase">
                60-Minute Rain Outlook
              </h3>
              <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
                {hasPrecipitation
                  ? `Peak precipitation ~${peakItem.intensity.toFixed(1)} mm/h at +${peakItem.minute}m`
                  : 'Zero precipitation expected over the next hour'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              hasPrecipitation
                ? 'bg-sky-500/15 text-sky-500 border-sky-400/30'
                : 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25'
            }`}>
              {hasPrecipitation ? 'Precipitation Active' : 'Dry Field'}
            </span>
          </div>
        </div>

        {/* 60-Minute Bar Visualization */}
        <div className="pt-2 pb-1">
          <div className="h-20 w-full flex items-end justify-between gap-1 px-1 relative">
            {/* Intensity threshold guide lines */}
            <div className="absolute inset-x-0 top-0 border-b border-dashed border-black/5 dark:border-white/5 pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-black/5 dark:border-white/5 pointer-events-none" />

            {minuteItems.map((item, idx) => {
              const heightPercent = Math.max(8, Math.min(100, (item.intensity / maxIntensity) * 100));
              const isSelected = activeMinuteIdx === idx;
              const isPeak = item.intensity > 0 && item.intensity === peakItem.intensity;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMinuteIdx(isSelected ? null : idx)}
                  aria-label={`${item.minute} min: ${item.intensity} mm/h`}
                  className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-full rounded-t-md transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#10B981] shadow-sm'
                        : isPeak
                        ? 'bg-[#FF5C00]'
                        : item.intensity > 0
                        ? 'bg-sky-500/80 group-hover:bg-sky-400'
                        : isDarkMode
                        ? 'bg-[#1E2821]'
                        : 'bg-[#EAE8E3]'
                    }`}
                    style={{ height: `${item.intensity > 0 ? heightPercent : 10}%` }}
                  />
                </button>
              );
            })}
          </div>

          {/* Time axis labels */}
          <div className="flex justify-between text-[10px] font-bold text-[#5D6861] dark:text-[#89998F] mt-2 px-1">
            <span>Now</span>
            <span>+15m</span>
            <span>+30m</span>
            <span>+45m</span>
            <span>+60m</span>
          </div>
        </div>

        {/* Interactive inspection indicator */}
        {activeMinuteIdx !== null && (
          <div className={`mt-2.5 p-2 rounded-xl text-[11px] flex items-center justify-between font-semibold border ${
            isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'
          }`}>
            <span className="flex items-center space-x-1">
              <Droplets size={12} className="text-[#0284C7] dark:text-[#38BDF8]" />
              <span>+{inspectItem.minute} min offset:</span>
            </span>
            <span className="font-mono-numbers font-black">
              {inspectItem.intensity.toFixed(1)} mm/h rate
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
