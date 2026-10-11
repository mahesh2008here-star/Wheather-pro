import React from 'react';
import { Eye } from 'lucide-react';

interface VisibilityWidgetProps {
  visibilityKm?: number;
}

export const VisibilityWidget: React.FC<VisibilityWidgetProps> = ({ visibilityKm = 10 }) => {
  return (
    <div className="p-4 rounded-3xl bg-[#E8F4FF] border border-[#D5ECFF] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#0284C7]">
          <Eye size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Field Visibility
          </span>
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {visibilityKm}
          </span>
          <span className="text-sm font-bold text-[#0284C7]">km</span>
        </div>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        {visibilityKm >= 10 ? 'Clear horizon for equipment transit.' : 'Reduced visibility due to haze or precipitation.'}
      </p>
    </div>
  );
};
