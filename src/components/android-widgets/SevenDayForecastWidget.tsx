import React from 'react';
import { 
  Calendar, 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  Cloud,
  Droplets
} from 'lucide-react';
import { DailyForecastItem, LocationInfo } from '../../types/weather';

interface SevenDayForecastWidgetProps {
  daily: DailyForecastItem[];
  location: LocationInfo;
  onClick?: () => void;
}

export const SevenDayForecastWidget: React.FC<SevenDayForecastWidgetProps> = ({
  daily,
  location,
  onClick
}) => {
  const forecastDays = (daily && daily.length > 0) ? daily.slice(0, 7) : [];

  // Calculate week-wide min and max for proportional temperature bars
  const weekMin = forecastDays.length > 0 ? Math.min(...forecastDays.map(d => d.tempMin)) : 10;
  const weekMax = forecastDays.length > 0 ? Math.max(...forecastDays.map(d => d.tempMax)) : 30;
  const tempSpan = Math.max(1, weekMax - weekMin);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={15} className="text-[#F57C00]" />;
    if (code <= 3) return <CloudSun size={15} className="text-[#1687C9]" />;
    if (code <= 67) return <CloudRain size={15} className="text-[#1687C9]" />;
    if (code <= 77) return <Snowflake size={15} className="text-[#1687C9]" />;
    if (code <= 99) return <CloudLightning size={15} className="text-[#F57C00]" />;
    return <Cloud size={15} className="text-[#737873]" />;
  };

  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`7-Day Agricultural Forecast for ${location.name}`}
      className="w-full p-4 rounded-[26px] bg-white border border-[#E6E5E1] shadow-sm hover:shadow-md transition-all cursor-pointer select-none text-[#171717]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#E6E5E1]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#FFF0E1] text-[#F57C00]">
            <Calendar size={15} strokeWidth={2.4} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#171717]">7-Day Forecast Outlook</h4>
            <p className="text-[10px] text-[#737873] font-medium">{location.name} • Consistent scale</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#1687C9] bg-[#E5F2FF] px-2 py-0.5 rounded-full">
          Weekly
        </span>
      </div>

      {/* 7 Daily Rows with Real Scale Bars */}
      <div className="space-y-1.5">
        {forecastDays.map((day, idx) => {
          const leftPercent = Math.max(0, Math.min(80, ((day.tempMin - weekMin) / tempSpan) * 100));
          const rightPercent = Math.max(leftPercent + 15, Math.min(100, ((day.tempMax - weekMin) / tempSpan) * 100));
          const barWidth = rightPercent - leftPercent;

          return (
            <div 
              key={idx}
              className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-[#F7F6F2] transition-colors"
            >
              {/* Day Name */}
              <span className="w-14 text-[11px] font-bold text-[#171717]">
                {idx === 0 ? 'Today' : day.dayName}
              </span>

              {/* Weather Icon & Rain % */}
              <div className="w-16 flex items-center space-x-1.5 shrink-0">
                {getWeatherIcon(day.weatherCode)}
                {day.rainProbability > 15 && (
                  <span className="text-[9px] font-black text-[#1687C9] flex items-center">
                    <Droplets size={8} className="mr-0.5" />
                    {day.rainProbability}%
                  </span>
                )}
              </div>

              {/* Low Temp */}
              <span className="w-7 text-[11px] font-mono-numbers font-bold text-[#737873] text-right">
                {day.tempMin}°
              </span>

              {/* Proportional Range Bar */}
              <div className="flex-1 mx-2.5 h-1.5 bg-[#E6E5E1] rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#1687C9] to-[#F57C00]"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${barWidth}%`
                  }}
                />
              </div>

              {/* High Temp */}
              <span className="w-7 text-[11px] font-mono-numbers font-black text-[#171717] text-left">
                {day.tempMax}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
