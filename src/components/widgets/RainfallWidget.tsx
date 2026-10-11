import React from 'react';
import { CloudRain } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface RainfallWidgetProps {
  precipitationAmount?: number;
  rainChance?: number;
}

export const RainfallWidget: React.FC<RainfallWidgetProps> = ({ 
  precipitationAmount = 0, 
  rainChance = 10 
}) => {
  const { formatPrecip } = useTheme();

  return (
    <div className="p-4 rounded-3xl bg-[#E8F4FF] border border-[#D5ECFF] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#0284C7]">
          <CloudRain size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Precipitation
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#0284C7]">
          {rainChance}% chance
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {formatPrecip(precipitationAmount)}
          </span>
          <span className="text-xs font-bold text-[#737873]">today</span>
        </div>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        {precipitationAmount > 0 ? 'Active rain accumulating on field soil.' : 'No measurable rainfall accumulated today.'}
      </p>
    </div>
  );
};
