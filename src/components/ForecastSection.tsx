import React, { useState } from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning,
  Calendar,
  Clock,
  Droplets,
  ChevronDown,
  ChevronUp
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
  const { isDarkMode, formatTemp } = useTheme();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

  const renderWeatherIcon = (code: number, size = 18) => {
    if (code === 0 || code === 1) return <Sun size={size} className="text-[#FF5C00] shrink-0" />;
    if (code === 2) return <CloudSun size={size} className="text-[#FF5C00] shrink-0" />;
    if (code === 3) return <Cloud size={size} className="text-[#89998F] shrink-0" />;
    if ([51, 53, 55].includes(code)) return <CloudDrizzle size={size} className="text-[#0284C7] shrink-0" />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={size} className="text-[#0284C7] shrink-0" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning size={size} className="text-[#FF5C00] shrink-0" />;
    return <CloudSun size={size} className="text-[#FF5C00] shrink-0" />;
  };

  // Find min/max across all days for normalized range bars
  const minTempAll = Math.min(...daily.map(d => d.tempMin), currentTemp - 2);
  const maxTempAll = Math.max(...daily.map(d => d.tempMax), currentTemp + 2);
  const totalSpan = Math.max(1, maxTempAll - minTempAll);

  return (
    <div className="w-full px-4 py-2 space-y-3.5 select-none">
      {/* 1. 24-HOUR HOURLY TIMELINE STRIP */}
      <div 
        className={`w-full p-4 rounded-[26px] border shadow-xs transition-colors ${
          isDarkMode 
            ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
            : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Clock size={15} className="text-[#FF5C00]" />
            <h3 className="text-xs font-black tracking-tight uppercase">
              24-Hour Horizon
            </h3>
          </div>
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
            Next 24 Hours
          </span>
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          {hourly.slice(0, 24).map((hourItem, idx) => {
            const isNow = idx === 0 || hourItem.isCurrent;
            return (
              <div 
                key={idx}
                className={`flex flex-col items-center py-2.5 px-2.5 rounded-2xl min-w-[58px] shrink-0 transition-all border ${
                  isNow 
                    ? isDarkMode 
                      ? 'bg-[#1A231D] border-[#FF5C00]/40 text-[#F3F6F4]' 
                      : 'bg-[#F8F7F4] border-[#FF5C00]/30 text-[#121814]'
                    : isDarkMode 
                      ? 'bg-[#151D18] border-transparent hover:border-[#1E2821]' 
                      : 'bg-[#FAFAF8] border-transparent hover:border-[#E8E6DF]'
                }`}
              >
                <div className="flex items-center space-x-1 mb-1">
                  {isNow && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />}
                  <span className={`text-[11px] ${
                    isNow ? 'font-black text-[#FF5C00]' : 'font-semibold text-[#5D6861] dark:text-[#89998F]'
                  }`}>
                    {isNow ? 'Now' : hourItem.hour}
                  </span>
                </div>

                <div className="my-1.5">
                  {renderWeatherIcon(hourItem.weatherCode, 18)}
                </div>

                <span className="text-xs font-black font-mono-numbers my-1">
                  {formatTemp(hourItem.temperature)}
                </span>

                {hourItem.rainProbability > 0 ? (
                  <span className={`text-[10px] font-bold flex items-center space-x-0.5 mt-0.5 ${
                    hourItem.rainProbability >= 30 ? 'text-[#FF5C00]' : 'text-[#0284C7]'
                  }`}>
                    <Droplets size={10} className="shrink-0" />
                    <span>{hourItem.rainProbability}%</span>
                  </span>
                ) : (
                  <span className="text-[10px] opacity-25 font-mono-numbers mt-0.5">
                    -
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 7-DAY FORECAST WITH PROPORTIONAL RANGE BARS */}
      <div 
        className={`w-full p-4 rounded-[26px] border shadow-xs transition-colors ${
          isDarkMode 
            ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
            : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Calendar size={15} className="text-[#10B981]" />
            <h3 className="text-xs font-black tracking-tight uppercase">
              7-Day Crop Forecast
            </h3>
          </div>
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
            Daily Outlook
          </span>
        </div>

        <div className="space-y-1 divide-y divide-black/5 dark:divide-white/5">
          {daily.map((dayItem, idx) => {
            const isToday = idx === 0;
            const isExpanded = selectedDayIdx === idx;
            
            const leftPercent = Math.max(0, Math.min(100, ((dayItem.tempMin - minTempAll) / totalSpan) * 100));
            const barWidthPercent = Math.max(12, Math.min(100 - leftPercent, ((dayItem.tempMax - dayItem.tempMin) / totalSpan) * 100));

            return (
              <div key={idx} className="pt-2 first:pt-0">
                <div 
                  onClick={() => setSelectedDayIdx(isExpanded ? null : idx)}
                  className={`py-2 px-2.5 rounded-2xl flex items-center justify-between cursor-pointer snappy-touch transition-colors ${
                    isExpanded 
                      ? isDarkMode ? 'bg-[#1A231D]' : 'bg-[#F2EFE8]' 
                      : isDarkMode ? 'hover:bg-[#162019]' : 'hover:bg-[#F8F7F4]'
                  }`}
                >
                  {/* Day Name */}
                  <div className="w-18 shrink-0 flex items-center space-x-1.5">
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00] shrink-0" />}
                    <span className={`text-xs block ${
                      isToday ? 'font-black text-[#121814] dark:text-[#F3F6F4]' : 'font-bold text-[#5D6861] dark:text-[#89998F]'
                    }`}>
                      {isToday ? 'Today' : dayItem.dayName}
                    </span>
                  </div>

                  {/* Icon & Rain Chance */}
                  <div className="flex items-center space-x-1.5 w-16 shrink-0 justify-start">
                    {renderWeatherIcon(dayItem.weatherCode, 16)}
                    {dayItem.rainProbability > 15 ? (
                      <span className={`text-[10px] font-bold flex items-center ${
                        dayItem.rainProbability >= 40 ? 'text-[#FF5C00]' : 'text-[#0284C7]'
                      }`}>
                        {dayItem.rainProbability}%
                      </span>
                    ) : null}
                  </div>

                  {/* Proportional Temperature Range Bar */}
                  <div className="flex-1 mx-3 flex items-center space-x-2">
                    <span className="text-xs font-mono-numbers font-medium w-7 text-right text-[#5D6861] dark:text-[#89998F]">
                      {formatTemp(dayItem.tempMin)}
                    </span>

                    <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 relative overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-[#FF5C00]"
                        style={{
                          marginLeft: `${leftPercent}%`,
                          width: `${barWidthPercent}%`
                        }}
                      />
                    </div>

                    <span className="text-xs font-mono-numbers font-black w-7 text-left">
                      {formatTemp(dayItem.tempMax)}
                    </span>
                  </div>

                  <div className="shrink-0 text-[#89998F] pl-1">
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </div>
                </div>

                {/* Day Detail Expansion */}
                {isExpanded && (
                  <div className={`p-3 mx-1 my-1.5 rounded-2xl text-xs space-y-2 animate-tab-switch border ${
                    isDarkMode ? 'bg-[#101612] border-[#1E2821]' : 'bg-[#FAFAF8] border-[#E8E6DF]'
                  }`}>
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="text-[#FF5C00] font-black">
                        {dayItem.conditionDescription}
                      </span>
                      <span>
                        Precipitation: <strong>{dayItem.precipitationSum} mm</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-black/5 dark:border-white/5 text-[10px]">
                      <div>
                        <span className="text-[#5D6861] dark:text-[#89998F] block font-bold">Max Wind</span>
                        <span className="font-black text-xs font-mono-numbers mt-0.5 block">
                          {dayItem.windSpeedMax} km/h
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5D6861] dark:text-[#89998F] block font-bold">UV Max</span>
                        <span className="font-black text-xs font-mono-numbers mt-0.5 block">
                          {dayItem.uvIndexMax} / 11
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5D6861] dark:text-[#89998F] block font-bold">Evapotransp.</span>
                        <span className="font-black text-xs mt-0.5 block text-[#10B981]">
                          {dayItem.evapotranspiration ?? 3.2} mm
                        </span>
                      </div>
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
