import React from 'react';
import { Gauge } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AtmosphericPressureWidgetProps {
  pressure?: number;
  pressureTendency?: 'rising' | 'falling' | 'steady';
}

export const AtmosphericPressureWidget: React.FC<AtmosphericPressureWidgetProps> = ({ 
  pressure = 1013, 
  pressureTendency = 'steady' 
}) => {
  const { formatPressure } = useTheme();

  return (
    <div className="p-4 rounded-3xl bg-[#EFECFF] border border-[#DDD7FF] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#7C3AED]">
          <Gauge size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Barometer
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#7C3AED] capitalize">
          {pressureTendency}
        </span>
      </div>

      <div className="my-2">
        <span className="text-3xl font-black font-mono-numbers text-[#171717] block">
          {formatPressure(pressure)}
        </span>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        {pressureTendency === 'falling' 
          ? 'Falling pressure suggests approaching weather front.' 
          : 'Stable pressure indicates continuing fair weather.'}
      </p>
    </div>
  );
};
