import React from 'react';
import { 
  CloudSun, 
  CloudRain, 
  Sun, 
  MapPin, 
  Droplets,
  Thermometer
} from 'lucide-react';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../../types/weather';

interface ForecastMediumWidgetProps {
  metrics: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  location: LocationInfo;
  onClick?: () => void;
}

export const ForecastMediumWidget: React.FC<ForecastMediumWidgetProps> = ({
  metrics,
  hourly,
  location,
  onClick
}) => {
  const displayHours = (hourly && hourly.length >= 4) ? hourly.slice(0, 4) : [
    { time: 'Now', temperature: metrics.temperature, conditionTitle: metrics.conditionTitle, rainProbability: metrics.rainChance },
    { time: '+1h', temperature: metrics.temperature + 1, conditionTitle: 'Partly Cloudy', rainProbability: Math.max(0, metrics.rainChance - 5) },
    { time: '+2h', temperature: metrics.temperature, conditionTitle: 'Cloudy', rainProbability: Math.min(100, metrics.rainChance + 10) },
    { time: '+3h', temperature: metrics.temperature - 1, conditionTitle: 'Light Rain', rainProbability: Math.min(100, metrics.rainChance + 25) }
  ];

  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Current Weather and Forecast Widget for ${location.name}`}
      className="w-full p-4 rounded-[26px] bg-white border border-[#E6E5E1] shadow-sm hover:shadow-md transition-all cursor-pointer select-none text-[#171717]"
    >
      {/* Top Header: Current status & Location */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E5E1]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#FFF0E1] text-[#F57C00]">
            <Thermometer size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-[#171717]">{location.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#E5F2FF] text-[#1687C9]">
                Live
              </span>
            </div>
            <p className="text-[11px] text-[#737873] font-medium">
              {metrics.conditionTitle} • Feels {metrics.apparentTemperature}°
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono-numbers text-[#F57C00]">
            {metrics.temperature}°
          </span>
          <span className="block text-[10px] text-[#737873]">
            H:{metrics.tempMaxToday}° L:{metrics.tempMinToday}°
          </span>
        </div>
      </div>

      {/* 4-Period Horizontal Forecast Strip */}
      <div className="grid grid-cols-4 gap-2 pt-3">
        {displayHours.map((item, idx) => (
          <div 
            key={idx}
            className="flex flex-col items-center p-2 rounded-2xl bg-[#F7F6F2] border border-[#E6E5E1]/70"
          >
            <span className="text-[10px] font-bold text-[#737873]">
              {idx === 0 ? 'Now' : item.time.split(' ')[0] || item.time}
            </span>

            <div className="my-1 text-[#1687C9]">
              {item.rainProbability > 40 ? (
                <CloudRain size={16} />
              ) : (item.conditionTitle || '').toLowerCase().includes('sun') || (item.conditionTitle || '').toLowerCase().includes('clear') ? (
                <Sun size={16} className="text-[#F57C00]" />
              ) : (
                <CloudSun size={16} />
              )}
            </div>

            <span className="text-xs font-black font-mono-numbers text-[#171717]">
              {item.temperature}°
            </span>

            {/* Rain chance pill */}
            <div className="mt-1 flex items-center space-x-0.5 text-[9px] font-bold text-[#1687C9]">
              <Droplets size={8} />
              <span>{item.rainProbability}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
