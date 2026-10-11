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
  const { formatTemp } = useTheme();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

  const renderWeatherIcon = (code: number, size = 18) => {
    if (code === 0 || code === 1) return <Sun size={size} className="text-[#FF7900] shrink-0" />;
    if (code === 2) return <CloudSun size={size} className="text-[#FF7900] shrink-0" />;
    if (code === 3) return <Cloud size={size} className="text-[#737873] shrink-0" />;
    if ([51, 53, 55].includes(code)) return <CloudDrizzle size={size} className="text-[#0284C7] shrink-0" />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={size} className="text-[#0284C7] shrink-0" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning size={size} className="text-[#FF7900] shrink-0" />;
    return <CloudSun size={size} className="text-[#FF7900] shrink-0" />;
  };

  // Find min/max across all days for normalized range bars
  const minTempAll = Math.min(...daily.map(d => d.tempMin), currentTemp - 2);
  const maxTempAll = Math.max(...daily.map(d => d.tempMax), currentTemp + 2);
  const totalSpan = Math.max(1, maxTempAll - minTempAll);

  return (
    <div className="w-full px-4 py-2 space-y-3.5 select-none">
      {/* 1. 24-HOUR HOURLY TIMELINE STRIP */}
      <div className="w-full p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs relative">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Clock size={15} className="text-[#FF7900]" />
            <h3 className="text-xs font-black tracking-tight uppercase text-[#171717]">
              24-Hour Horizon
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#737873] flex items-center space-x-1">
            <span>Scroll 24h</span>
            <span className="text-[#FF7900] font-black">→</span>
          </span>
        </div>

        <div className="relative w-full">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth pr-6">
            {hourly.slice(0, 24).map((hourItem, idx) => {
              const isNow = idx === 0 || hourItem.isCurrent;
              return (
                <div 
                  key={idx}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-2xl w-[68px] min-w-[68px] shrink-0 text-center transition-all border ${
                    isNow 
                      ? 'bg-[#FFF0E4] border-[#FFE1CB] text-[#FF7900]' 
                      : 'bg-[#F7F6F2] border-[#E9E7E1] text-[#171717]'
                  }`}
                >
                  <div className="flex items-center space-x-1 mb-1">
                    {isNow && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]" />}
                    <span className={`text-[11px] ${
                      isNow ? 'font-black text-[#FF7900]' : 'font-semibold text-[#737873]'
                    }`}>
                      {isNow ? 'Now' : hourItem.hour}
                    </span>
                  </div>

                  <div className="my-1.5">
                    {renderWeatherIcon(hourItem.weatherCode, 18)}
                  </div>

                  <span className="text-xs font-black font-mono-numbers my-1 text-[#171717]">
                    {formatTemp(hourItem.temperature)}
                  </span>

                  {hourItem.rainProbability > 0 ? (
                    <span className={`text-[10px] font-bold flex items-center justify-center space-x-0.5 mt-0.5 ${
                      hourItem.rainProbability >= 30 ? 'text-[#FF7900]' : 'text-[#0284C7]'
                    }`}>
                      <Droplets size={10} className="shrink-0" />
                      <span>{hourItem.rainProbability}%</span>
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-25 font-mono-numbers mt-0.5 text-[#737873]">
                      -
                    </span>
                  )}
                </div>
              );
            })}
            <div className="w-3 shrink-0" aria-hidden="true" />
          </div>

          {/* Right edge fade affordance clearly indicating more forecast hours are available */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent rounded-r-2xl" />
        </div>
      </div>

      {/* 2. 7-DAY FORECAST WITH PROPORTIONAL RANGE BARS */}
      <div className="w-full p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Calendar size={15} className="text-[#10B981]" />
            <h3 className="text-xs font-black tracking-tight uppercase text-[#171717]">
              7-Day Crop Outlook
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#737873]">
            Daily Range
          </span>
        </div>

        <div className="space-y-1 divide-y divide-[#E9E7E1]">
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
                      ? 'bg-[#F7F6F2]' 
                      : 'hover:bg-[#F7F6F2]'
                  }`}
                >
                  {/* Day Name */}
                  <div className="w-18 shrink-0 flex items-center space-x-1.5">
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] shrink-0" />}
                    <span className={`text-xs block ${
                      isToday ? 'font-black text-[#171717]' : 'font-bold text-[#737873]'
                    }`}>
                      {isToday ? 'Today' : dayItem.dayName}
                    </span>
                  </div>

                  {/* Icon & Rain Chance */}
                  <div className="flex items-center space-x-1.5 w-16 shrink-0 justify-start">
                    {renderWeatherIcon(dayItem.weatherCode, 16)}
                    {dayItem.rainProbability > 15 ? (
                      <span className={`text-[10px] font-bold flex items-center ${
                        dayItem.rainProbability >= 40 ? 'text-[#FF7900]' : 'text-[#0284C7]'
                      }`}>
                        {dayItem.rainProbability}%
                      </span>
                    ) : null}
                  </div>

                  {/* Proportional Temperature Range Bar */}
                  <div className="flex-1 mx-3 flex items-center space-x-2">
                    <span className="text-xs font-mono-numbers font-medium w-7 text-right text-[#737873]">
                      {formatTemp(dayItem.tempMin)}
                    </span>

                    <div className="flex-1 h-2 rounded-full bg-[#E9E7E1] relative overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-[#FF7900]"
                        style={{
                          marginLeft: `${leftPercent}%`,
                          width: `${barWidthPercent}%`
                        }}
                      />
                    </div>

                    <span className="text-xs font-mono-numbers font-black w-7 text-left text-[#171717]">
                      {formatTemp(dayItem.tempMax)}
                    </span>
                  </div>

                  <div className="shrink-0 text-[#737873] pl-1">
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </div>
                </div>

                {/* Day Detail Expansion */}
                {isExpanded && (
                  <div className="p-3 mx-1 my-1.5 rounded-2xl text-xs space-y-2 animate-tab-switch border border-[#E9E7E1] bg-[#F7F6F2]">
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="text-[#FF7900] font-black">
                        {dayItem.conditionDescription}
                      </span>
                      <span className="text-[#171717]">
                        Rain sum: <strong>{dayItem.precipitationSum} mm</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E9E7E1] text-[10px]">
                      <div>
                        <span className="text-[#737873] block font-bold">Max Wind</span>
                        <span className="font-black text-xs font-mono-numbers mt-0.5 block text-[#171717]">
                          {dayItem.windSpeedMax} km/h
                        </span>
                      </div>
                      <div>
                        <span className="text-[#737873] block font-bold">UV Max</span>
                        <span className="font-black text-xs font-mono-numbers mt-0.5 block text-[#171717]">
                          {dayItem.uvIndexMax} / 11
                        </span>
                      </div>
                      <div>
                        <span className="text-[#737873] block font-bold">Evapotransp.</span>
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
