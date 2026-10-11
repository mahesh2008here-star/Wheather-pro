import React from 'react';
import { 
  Sun, 
  ShieldCheck, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../../types/weather';

interface AirQualityUvWidgetProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
  onClick?: () => void;
}

export const AirQualityUvWidget: React.FC<AirQualityUvWidgetProps> = ({
  metrics,
  location,
  onClick
}) => {
  const uv = metrics.uvIndex;
  const aqi = metrics.airQuality.aqi;

  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Air Quality and UV Widget for ${location.name}`}
      className="w-full p-4 rounded-[26px] bg-white border border-[#E6E5E1] shadow-sm hover:shadow-md transition-all cursor-pointer select-none text-[#171717]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E5E1]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#EFECFF] text-[#7563C9] shadow-2xs">
            <Activity size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#171717]">Air Quality &amp; UV Index</h4>
            <p className="text-[10px] text-[#737873] font-medium">{location.name} • Atmosphere &amp; Solar</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#7563C9] bg-[#EFECFF] px-2 py-0.5 rounded-full border border-[#DED7FC]">
          EPA Standard
        </span>
      </div>

      {/* Two Column Cards: UV & AQI */}
      <div className="grid grid-cols-2 gap-2.5 pt-3">
        {/* UV Index Card (Pale Lavender) */}
        <div className="p-3 rounded-2xl bg-[#EFECFF] border border-[#DED7FC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#7563C9]">
              <span className="text-[10px] font-bold uppercase tracking-wider">UV Exposure</span>
              <Sun size={14} />
            </div>

            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black font-mono-numbers text-[#171717]">{uv}</span>
              <span className="text-[10px] font-bold text-[#7563C9] px-1.5 py-0.2 rounded-md bg-white">
                {metrics.uvLevel}
              </span>
            </div>
          </div>

          {/* Visual Scale Indicator */}
          <div className="mt-2">
            <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#7563C9] rounded-full"
                style={{ width: `${Math.min(100, (uv / 11) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-[#737873] font-medium block mt-1">
              Peak solar irradiance: {uv > 7 ? 'High risk' : 'Safe/Moderate'}
            </span>
          </div>
        </div>

        {/* Air Quality AQI Card (Pale Mint) */}
        <div className="p-3 rounded-2xl bg-[#E4F5E9] border border-[#CDEED6] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#159B69]">
              <span className="text-[10px] font-bold uppercase tracking-wider">EPA AQI</span>
              <ShieldCheck size={14} />
            </div>

            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black font-mono-numbers text-[#171717]">{aqi}</span>
              <span className="text-[10px] font-bold text-[#159B69] px-1.5 py-0.2 rounded-md bg-white">
                {metrics.airQuality.category}
              </span>
            </div>
          </div>

          {/* Visual Scale Indicator */}
          <div className="mt-2">
            <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#159B69] rounded-full"
                style={{ width: `${Math.min(100, (aqi / 300) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-[#737873] font-medium block mt-1">
              {metrics.airQuality.pm25} µg/m³ PM2.5 • Clean air
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
