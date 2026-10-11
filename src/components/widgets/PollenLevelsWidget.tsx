import React from 'react';
import { Flower2 } from 'lucide-react';
import { AirQualityData } from '../../types/weather';

interface PollenLevelsWidgetProps {
  airQuality?: AirQualityData;
}

export const PollenLevelsWidget: React.FC<PollenLevelsWidgetProps> = ({ airQuality }) => {
  const tree = airQuality?.treePollen || 'Low';
  const grass = airQuality?.grassPollen || 'Low';
  const weed = airQuality?.weedPollen || 'Low';

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#E9E7E1] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-rose-500">
          <Flower2 size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Pollen Index
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 my-1 text-center">
        <div className="p-2 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1]">
          <span className="text-[9px] font-bold text-[#737873] block uppercase">Tree</span>
          <span className="text-xs font-black text-[#10B981] mt-0.5 block">{tree}</span>
        </div>
        <div className="p-2 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1]">
          <span className="text-[9px] font-bold text-[#737873] block uppercase">Grass</span>
          <span className="text-xs font-black text-[#10B981] mt-0.5 block">{grass}</span>
        </div>
        <div className="p-2 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1]">
          <span className="text-[9px] font-bold text-[#737873] block uppercase">Weed</span>
          <span className="text-xs font-black text-[#10B981] mt-0.5 block">{weed}</span>
        </div>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        Low allergen load in active regional field air.
      </p>
    </div>
  );
};
