import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  CloudFog,
  MapPin,
  Clock
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../../types/weather';

interface CompactWeatherWidgetProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
  onClick?: () => void;
}

export const CompactWeatherWidget: React.FC<CompactWeatherWidgetProps> = ({
  metrics,
  location,
  onClick
}) => {
  const getWeatherIcon = (code: number, isDay: boolean) => {
    if (code === 0) return isDay ? <Sun size={32} className="text-[#F57C00]" /> : <Sun size={32} className="text-[#F57C00]" />;
    if (code <= 3) return <CloudSun size={32} className="text-[#1687C9]" />;
    if (code <= 48) return <CloudFog size={32} className="text-[#737873]" />;
    if (code <= 67) return <CloudRain size={32} className="text-[#1687C9]" />;
    if (code <= 77) return <Snowflake size={32} className="text-[#1687C9]" />;
    if (code <= 99) return <CloudLightning size={32} className="text-[#F57C00]" />;
    return <Cloud size={32} className="text-[#737873]" />;
  };

  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Compact Weather Widget for ${location.name}`}
      className="w-full max-w-[280px] p-4 rounded-[26px] bg-[#E5F2FF] border border-[#CDE3FC] shadow-sm hover:shadow-md transition-all cursor-pointer select-none text-[#171717] flex flex-col justify-between"
    >
      {/* Top Header: Location & Weather Icon */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <div className="flex items-center space-x-1 text-[#1687C9]">
            <MapPin size={12} className="shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider truncate">
              {location.name}
            </span>
          </div>
          <p className="text-xs font-bold text-[#737873] truncate mt-0.5">
            {metrics.conditionTitle}
          </p>
        </div>

        <div className="shrink-0 p-1 rounded-2xl bg-white/70 shadow-2xs">
          {getWeatherIcon(metrics.weatherCode, metrics.isDaytime)}
        </div>
      </div>

      {/* Main Temperature & High/Low */}
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-4xl font-black font-mono-numbers tracking-tight text-[#171717]">
          {metrics.temperature}°
        </span>

        <div className="text-right">
          <div className="text-xs font-bold font-mono-numbers text-[#171717]">
            <span className="text-[#F57C00]">H:{metrics.tempMaxToday}°</span>{' '}
            <span className="text-[#1687C9]">L:{metrics.tempMinToday}°</span>
          </div>
          <span className="text-[10px] text-[#737873] font-medium block">
            Feels {metrics.apparentTemperature}°
          </span>
        </div>
      </div>

      {/* Bottom Footer: Auto-sync timestamp */}
      <div className="mt-2.5 pt-2 border-t border-[#CDE3FC]/80 flex items-center justify-between text-[10px] text-[#737873]">
        <span className="font-bold flex items-center space-x-1">
          <Clock size={10} className="text-[#1687C9]" />
          <span>{metrics.lastUpdated || 'Updated'}</span>
        </span>
        <span className="font-bold text-[#1687C9]">● Live</span>
      </div>
    </div>
  );
};
