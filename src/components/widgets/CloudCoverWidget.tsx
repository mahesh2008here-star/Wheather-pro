import React from 'react';
import { Cloud } from 'lucide-react';

interface CloudCoverWidgetProps {
  cloudCover?: number;
  conditionTitle?: string;
}

export const CloudCoverWidget: React.FC<CloudCoverWidgetProps> = ({ 
  cloudCover = 25, 
  conditionTitle = 'Scattered Clouds' 
}) => {
  return (
    <div className="p-4 rounded-3xl bg-[#E8F4FF] border border-[#D5ECFF] shadow-xs flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-[#0284C7]">
          <Cloud size={15} strokeWidth={2.4} />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
            Cloud Cover
          </span>
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black font-mono-numbers text-[#171717]">
            {cloudCover}%
          </span>
        </div>
        <span className="text-xs font-bold text-[#0284C7] block mt-0.5">
          {conditionTitle}
        </span>
      </div>

      <p className="text-[10px] font-medium text-[#737873] leading-snug">
        Solar radiation directly impacts crop photosynthesis rate.
      </p>
    </div>
  );
};
