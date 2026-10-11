import React from 'react';
import { Droplets } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HumidityDewPointWidgetProps {
  humidity?: number;
  dewPoint?: number;
}

export const HumidityDewPointWidget: React.FC<HumidityDewPointWidgetProps> = ({ 
  humidity = 50, 
  dewPoint = 12 
}) => {
  const { formatTemp } = useTheme();

  return (
    <div className="p-4 rounded-3xl bg-[#E5F5EC] border border-[#CEEFDB] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#10B981]">
          <Droplets size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Humidity & Dew
          </span>
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {humidity}%
          </span>
        </div>
        <span className="text-xs font-bold text-[#10B981] block mt-0.5">
          Dew point: {formatTemp(dewPoint)}
        </span>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        {humidity > 70 ? 'High moisture; watch for fungal foliage risks.' : 'Comfortable ambient moisture for crops.'}
      </p>
    </div>
  );
};
