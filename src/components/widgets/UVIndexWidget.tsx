import React from 'react';
import { SunMedium } from 'lucide-react';

interface UVIndexWidgetProps {
  uvIndex?: number;
  uvLevel?: string;
}

export const UVIndexWidget: React.FC<UVIndexWidgetProps> = ({ uvIndex = 0, uvLevel = 'Moderate' }) => {
  return (
    <div className="p-4 rounded-3xl bg-[#EFECFF] border border-[#DDD7FF] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#7C3AED]">
          <SunMedium size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            UV Index
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#7C3AED]">
          {uvLevel}
        </span>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {uvIndex}
          </span>
          <span className="text-xs font-bold text-[#737873]">/ 11 Max</span>
        </div>

        {/* Visual UV scale bar */}
        <div className="w-full h-2 rounded-full bg-black/10 mt-2 overflow-hidden flex">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-[#7C3AED]"
            style={{ width: `${Math.min(100, Math.max(8, (uvIndex / 11) * 100))}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        {uvIndex >= 6 ? 'Sun protection advised between 11 AM - 3 PM.' : 'Low danger for field workers today.'}
      </p>
    </div>
  );
};
