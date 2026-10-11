import React from 'react';
import { Wind, Compass } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface WindWidgetProps {
  windSpeed?: number;
  windGusts?: number;
  windDirectionCardinal?: string;
  windDirection?: number;
}

export const WindWidget: React.FC<WindWidgetProps> = ({ 
  windSpeed = 12, 
  windGusts = 16, 
  windDirectionCardinal = 'N',
  windDirection = 0 
}) => {
  const { formatWind } = useTheme();

  return (
    <div className="p-4 rounded-3xl bg-[#E5F5EC] border border-[#CEEFDB] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#10B981]">
          <Wind size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Surface Wind
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#10B981]">
          {windDirectionCardinal} ({windDirection}°)
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {formatWind(windSpeed)}
          </span>
        </div>
        <span className="text-xs font-bold text-[#10B981] block mt-0.5">
          Gusts up to {formatWind(windGusts)}
        </span>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        {windSpeed <= 15 ? 'Safe conditions for crop foliar spraying.' : 'Wind exceeds threshold for drift-sensitive spraying.'}
      </p>
    </div>
  );
};
