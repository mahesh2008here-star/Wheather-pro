import React from 'react';
import { Droplet } from 'lucide-react';

interface EvapotranspirationWidgetProps {
  evapotranspiration?: number;
}

export const EvapotranspirationWidget: React.FC<EvapotranspirationWidgetProps> = ({ 
  evapotranspiration = 3.4 
}) => {
  return (
    <div className="p-4 rounded-3xl bg-[#FFF0E4] border border-[#FFE1CB] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#FF7900]">
          <Droplet size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Evapotranspiration (ET₀)
          </span>
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {evapotranspiration}
          </span>
          <span className="text-xs font-bold text-[#FF7900]">mm/day</span>
        </div>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        Daily canopy water loss rate. Use for irrigation schedule planning.
      </p>
    </div>
  );
};
