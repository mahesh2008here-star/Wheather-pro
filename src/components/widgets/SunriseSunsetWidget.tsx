import React from 'react';
import { Sun, Sunset, Sunrise } from 'lucide-react';
import { AstronomyData } from '../../types/weather';

interface SunriseSunsetWidgetProps {
  astronomy?: AstronomyData;
}

export const SunriseSunsetWidget: React.FC<SunriseSunsetWidgetProps> = ({ astronomy }) => {
  if (!astronomy) {
    return (
      <div className="p-4 rounded-3xl bg-white border border-[#E9E7E1] shadow-xs flex flex-col justify-between h-full">
        <span className="text-[11px] font-bold text-[#737873] uppercase tracking-wider">Sun Cycle</span>
        <p className="text-xs text-[#737873] mt-2">Data unavailable</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#E9E7E1] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-[#FF7900]">
          <Sun size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Sun & Solar Arc
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0E4] text-[#FF7900]">
          {astronomy.dayLength}
        </span>
      </div>

      {/* Horizon Solar Curve SVG */}
      <div className="my-2 py-1 flex items-center justify-center">
        <svg viewBox="0 0 160 50" className="w-full h-12 overflow-visible">
          {/* Horizon Line */}
          <line x1="10" y1="42" x2="150" y2="42" stroke="#E9E7E1" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Path Arc */}
          <path
            d="M 15 42 Q 80 5 145 42"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="2.5"
          />

          {/* Sun on arc */}
          <circle cx="80" cy="14" r="5" fill="#FF7900" />
          <circle cx="80" cy="14" r="9" fill="#FF7900" opacity="0.25" />
        </svg>
      </div>

      {/* Sunrise & Sunset Times */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E9E7E1] text-xs">
        <div className="flex items-center space-x-1.5">
          <Sunrise size={14} className="text-[#FF7900] shrink-0" />
          <div>
            <span className="text-[9px] font-bold text-[#737873] block uppercase">Sunrise</span>
            <span className="font-black text-[#171717]">{astronomy.sunrise}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 justify-end text-right">
          <div>
            <span className="text-[9px] font-bold text-[#737873] block uppercase">Sunset</span>
            <span className="font-black text-[#171717]">{astronomy.sunset}</span>
          </div>
          <Sunset size={14} className="text-[#FF7900] shrink-0" />
        </div>
      </div>
    </div>
  );
};
