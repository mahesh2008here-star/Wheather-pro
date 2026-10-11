import React from 'react';
import { 
  Sprout, 
  Droplet, 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CurrentWeatherMetrics } from '../types/weather';

interface MicroclimateAgriAdvisoryProps {
  metrics: CurrentWeatherMetrics;
}

export const MicroclimateAgriAdvisory: React.FC<MicroclimateAgriAdvisoryProps> = ({ metrics }) => {
  const { formatWind } = useTheme();

  // 1. Calculate Spraying Suitability Rating
  const isWindOk = metrics.windSpeed <= 16;
  const isHumidityOk = metrics.humidity >= 45 && metrics.humidity <= 78;
  const isRainOk = metrics.rainChance <= 25;
  const sprayScore = (isWindOk ? 40 : 10) + (isHumidityOk ? 35 : 15) + (isRainOk ? 25 : 0);

  const sprayStatus = sprayScore >= 80 
    ? { title: 'Optimal Spray Window', badge: 'Recommended', color: 'text-[#10B981]', bg: 'bg-[#E5F5EC] border-[#CEEFDB]' }
    : sprayScore >= 50
    ? { title: 'Marginal Spray Window', badge: 'Caution', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
    : { title: 'Restricted Spraying', badge: 'Avoid Spray', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };

  // 2. Calculate Frost / Heat Stress Hazard
  const thermalHazard = metrics.temperature <= 3 
    ? { title: 'Severe Frost Warning', desc: 'Active freeze hazard for open canopies and seedlings.', isAlert: true }
    : metrics.temperature <= 7
    ? { title: 'Light Frost Watch', desc: 'Ground frost possible in low-elevation hollows.', isAlert: true }
    : metrics.temperature >= 33
    ? { title: 'Heat Stress Risk', desc: 'Elevated evapotranspiration; irrigate sensitive crops.', isAlert: true }
    : { title: 'Optimal Growing Range', desc: 'Canopy and root temperatures in safe vegetative band.', isAlert: false };

  // 3. Estimated Evapotranspiration (ET0) mm/day
  const et0 = metrics.evapotranspiration ?? Number((0.0023 * (metrics.temperature + 17.8) * Math.sqrt(Math.max(1, metrics.windSpeed)) * 1.8).toFixed(1));

  return (
    <div className="w-full px-4 py-2 select-none">
      <div className="w-full p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#E5F5EC] text-[#10B981]">
              <Sprout size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-tight uppercase text-[#171717]">
                Field Agronomy Advisory
              </h3>
              <p className="text-[10px] font-semibold text-[#737873]">
                Spray safety, frost hazard & moisture management
              </p>
            </div>
          </div>
        </div>

        {/* Advisory Metric Panels */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Spray Window Assessment */}
          <div className="p-3 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737873]">
                Crop Spraying
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${sprayStatus.bg} ${sprayStatus.color}`}>
                {sprayStatus.badge}
              </span>
            </div>
            <span className="text-xs font-black block mt-0.5 text-[#171717]">
              {sprayStatus.title}
            </span>
            <p className="text-[10px] mt-1 leading-snug text-[#737873]">
              {isWindOk ? `Wind at ${formatWind(metrics.windSpeed)} is safe for spray drift.` : `Wind at ${formatWind(metrics.windSpeed)} exceeds drift limits.`}
            </p>
          </div>

          {/* Thermal & Frost Condition */}
          <div className="p-3 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737873]">
                Thermal Index
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                thermalHazard.isAlert ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#E5F5EC] text-[#10B981] border-[#CEEFDB]'
              }`}>
                {thermalHazard.isAlert ? 'Caution' : 'Optimal'}
              </span>
            </div>
            <span className="text-xs font-black block mt-0.5 text-[#171717]">
              {thermalHazard.title}
            </span>
            <p className="text-[10px] mt-1 leading-snug text-[#737873]">
              {thermalHazard.desc}
            </p>
          </div>
        </div>

        {/* Evapotranspiration Footnote */}
        <div className="mt-2.5 p-2.5 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2] flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2 text-[#171717]">
            <Droplet size={14} className="text-[#0284C7]" />
            <span className="font-semibold">
              Daily Evapotranspiration (ET₀):
            </span>
          </div>
          <span className="font-black font-mono-numbers text-[#10B981]">
            {et0} mm/day
          </span>
        </div>
      </div>
    </div>
  );
};
