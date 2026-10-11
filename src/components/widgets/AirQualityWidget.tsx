import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AirQualityData } from '../../types/weather';

interface AirQualityWidgetProps {
  airQuality?: AirQualityData;
}

export const AirQualityWidget: React.FC<AirQualityWidgetProps> = ({ airQuality }) => {
  const aqi = airQuality?.aqi ?? 32;
  const category = airQuality?.category ?? 'Good';

  return (
    <div className="p-4 rounded-3xl bg-[#E5F5EC] border border-[#CEEFDB] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#10B981]">
          <ShieldCheck size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Air Quality (AQI)
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#10B981]">
          {category}
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {aqi}
          </span>
          <span className="text-xs font-bold text-[#10B981]">
            PM2.5: {airQuality?.pm25 ?? 8} µg/m³
          </span>
        </div>

        {/* Visual AQI scale bar */}
        <div className="w-full h-2 rounded-full bg-black/10 mt-2 overflow-hidden flex">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#10B981] via-amber-400 to-rose-500"
            style={{ width: `${Math.min(100, Math.max(10, (aqi / 200) * 100))}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        {airQuality?.healthAdvice || 'Air quality is satisfactory for all outdoor tasks.'}
      </p>
    </div>
  );
};
