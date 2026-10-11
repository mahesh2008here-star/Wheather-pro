import React from 'react';
import { 
  Droplet, 
  CloudRain, 
  Wind, 
  ShieldAlert, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../../types/weather';

interface IrrigationOutlookWidgetProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
  onClick?: () => void;
}

export const IrrigationOutlookWidget: React.FC<IrrigationOutlookWidgetProps> = ({
  metrics,
  location,
  onClick
}) => {
  // Agricultural planning note calculation based on ET₀ and expected precipitation
  const isHighEt0 = (metrics.evapotranspiration || 0) > 4.5;
  const isRainImminent = metrics.rainChance > 50 || metrics.precipitationAmount > 3;

  let adviceBadge = 'Optimal Soil Moisture';
  let adviceColor = 'text-[#159B69] bg-[#E4F5E9] border-[#CDEED6]';
  let adviceNote = 'Weather conditions favorable for normal irrigation cycles.';

  if (isRainImminent) {
    adviceBadge = 'Hold Irrigation';
    adviceColor = 'text-[#1687C9] bg-white border-[#CDE3FC]';
    adviceNote = `Significant rain expected (${metrics.rainChance}% chance). Suspend overhead watering to conserve resources.`;
  } else if (isHighEt0) {
    adviceBadge = 'Elevated Water Loss';
    adviceColor = 'text-[#F57C00] bg-[#FFF0E1] border-[#FFE1CB]';
    adviceNote = `Daily ET₀ is high (${metrics.evapotranspiration} mm/d). Deep rooting crops may need replenishment.`;
  }

  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Rain & Irrigation Outlook Widget for ${location.name}`}
      className="w-full p-4 rounded-[26px] bg-[#E5F2FF] border border-[#CDE3FC] shadow-sm hover:shadow-md transition-all cursor-pointer select-none text-[#171717]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#CDE3FC]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-[#1687C9] shadow-2xs">
            <CloudRain size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#171717]">Rain &amp; Irrigation Outlook</h4>
            <p className="text-[10px] text-[#737873] font-medium">{location.name} • Evapotranspiration</p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${adviceColor}`}>
          {adviceBadge}
        </span>
      </div>

      {/* 3 Metric Badges */}
      <div className="grid grid-cols-3 gap-2 pt-3">
        {/* Rain Expectation */}
        <div className="p-2 rounded-xl bg-white/90 border border-[#CDE3FC] text-center">
          <span className="text-[9px] font-bold text-[#737873] block uppercase tracking-wider">
            Expected Rain
          </span>
          <span className="text-sm font-black font-mono-numbers text-[#1687C9] block mt-0.5">
            {metrics.precipitationAmount} mm
          </span>
          <span className="text-[9px] text-[#737873] font-semibold">
            {metrics.rainChance}% prob
          </span>
        </div>

        {/* Evapotranspiration ET₀ */}
        <div className="p-2 rounded-xl bg-white/90 border border-[#CDE3FC] text-center">
          <span className="text-[9px] font-bold text-[#737873] block uppercase tracking-wider">
            ET₀ Loss
          </span>
          <span className="text-sm font-black font-mono-numbers text-[#F57C00] block mt-0.5">
            {metrics.evapotranspiration || 3.2}
          </span>
          <span className="text-[9px] text-[#737873] font-semibold">
            mm / day
          </span>
        </div>

        {/* Surface Wind */}
        <div className="p-2 rounded-xl bg-white/90 border border-[#CDE3FC] text-center">
          <span className="text-[9px] font-bold text-[#737873] block uppercase tracking-wider">
            Field Wind
          </span>
          <span className="text-sm font-black font-mono-numbers text-[#171717] block mt-0.5">
            {metrics.windSpeed}
          </span>
          <span className="text-[9px] text-[#737873] font-semibold">
            km/h {metrics.windDirectionCardinal}
          </span>
        </div>
      </div>

      {/* Actionable Field Note */}
      <div className="mt-2.5 p-2 rounded-xl bg-[#E4F5E9] border border-[#CDEED6] flex items-start space-x-1.5 text-[#159B69]">
        <Info size={12} className="shrink-0 mt-0.5" />
        <p className="text-[10px] leading-tight font-medium text-[#171717]">
          <strong>Advisory:</strong> {adviceNote}
        </p>
      </div>
    </div>
  );
};
