import React from 'react';
import { Sprout } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SoilTelemetryWidgetProps {
  soilTemperature?: number;
  soilMoisture?: number;
}

export const SoilTelemetryWidget: React.FC<SoilTelemetryWidgetProps> = ({ 
  soilTemperature = 18, 
  soilMoisture = 38 
}) => {
  const { formatTemp } = useTheme();

  return (
    <div className="p-4 rounded-3xl bg-[#E5F5EC] border border-[#CEEFDB] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#10B981]">
          <Sprout size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Soil Top Layer
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#10B981]">
          0-1 cm Depth
        </span>
      </div>

      <div className="my-2 grid grid-cols-2 gap-2">
        <div>
          <span className="text-[9px] font-bold text-[#737873] block uppercase">Temp</span>
          <span className="text-2xl font-black font-mono-numbers text-[#171717]">
            {formatTemp(soilTemperature)}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-[#737873] block uppercase">Moisture</span>
          <span className="text-2xl font-black font-mono-numbers text-[#10B981]">
            {soilMoisture}%
          </span>
        </div>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        Volumetric water content suitable for root uptake.
      </p>
    </div>
  );
};
