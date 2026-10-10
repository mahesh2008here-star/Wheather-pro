import React, { useState } from 'react';
import { 
  Sprout, 
  Wind, 
  Droplet, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sun, 
  ChevronRight,
  Gauge,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CurrentWeatherMetrics } from '../types/weather';

interface MicroclimateAgriAdvisoryProps {
  metrics: CurrentWeatherMetrics;
}

export const MicroclimateAgriAdvisory: React.FC<MicroclimateAgriAdvisoryProps> = ({ metrics }) => {
  const { isDarkMode, customAccentColor, formatTemp, formatWind } = useTheme();
  const [activeCropType, setActiveCropType] = useState<'field' | 'orchard' | 'garden'>('field');
  const [showDetails, setShowDetails] = useState(false);

  // 1. Calculate Spraying Suitability Rating
  const isWindOk = metrics.windSpeed <= 16;
  const isHumidityOk = metrics.humidity >= 45 && metrics.humidity <= 78;
  const isRainOk = metrics.rainChance <= 25;
  const sprayScore = (isWindOk ? 40 : 10) + (isHumidityOk ? 35 : 15) + (isRainOk ? 25 : 0);

  const sprayStatus = sprayScore >= 80 
    ? { title: 'Optimal Spray Window', color: '#10B981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' }
    : sprayScore >= 50
    ? { title: 'Moderate Conditions', color: '#F59E0B', bg: 'bg-amber-500/15', border: 'border-amber-500/30' }
    : { title: 'Unfavorable Spraying', color: '#EF4444', bg: 'bg-rose-500/15', border: 'border-rose-500/30' };

  // 2. Calculate Frost / Heat Stress Hazard
  const frostRisk = metrics.temperature <= 4 
    ? { level: 'High Frost Hazard', msg: 'Protect vulnerable foliage & tender crops tonight.', icon: AlertTriangle, color: '#EF4444' }
    : metrics.temperature <= 8
    ? { level: 'Light Frost Watch', msg: 'Monitor low-lying field temperatures closely.', icon: Info, color: '#F59E0B' }
    : metrics.temperature >= 35
    ? { level: 'Severe Heat Stress', msg: 'High ET rate. Ensure emergency soil hydration.', icon: AlertTriangle, color: '#EF4444' }
    : { level: 'Safe Thermal Zone', msg: 'Soil & canopy temperature in optimal growth range.', icon: CheckCircle2, color: '#10B981' };

  // 3. Estimated Evapotranspiration (ET0) mm/day
  const estimatedET0 = (0.0023 * (metrics.temperature + 17.8) * Math.sqrt(Math.max(1, metrics.windSpeed)) * 1.8).toFixed(1);

  return (
    <div className={`p-4 rounded-3xl border shadow-xl transition-all duration-200 gpu-accelerate ${
      isDarkMode 
        ? 'bg-[#0F1422] border-white/12 text-white' 
        : 'bg-white border-slate-200/90 text-slate-900 shadow-md'
    }`}>
      {/* SECTION HEADER WITH SMART BADGE */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs"
            style={{ backgroundColor: `${customAccentColor}22`, color: customAccentColor }}
          >
            <Sprout size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight flex items-center space-x-1.5">
              <span>Agri Microclimate & Field Advisory</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-extrabold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                AI Smart
              </span>
            </h2>
            <p className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Real-time crop stress, spray window & evapotranspiration
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowDetails(!showDetails);
            try { navigator.vibrate?.(10); } catch {}
          }}
          className="text-xs font-black p-2 rounded-xl bg-white/5 hover:bg-white/10 text-teal-400 flex items-center space-x-1 cursor-pointer snappy-touch"
        >
          <span>{showDetails ? 'Hide' : 'Details'}</span>
          <ChevronRight size={14} className={`transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* CROP TYPE FILTER SWITCHER */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/20 border border-white/10 mb-3.5">
        {[
          { id: 'field', label: '🌾 Field Crops' },
          { id: 'orchard', label: '🍎 Orchard Trees' },
          { id: 'garden', label: '🥬 Home Garden' }
        ].map(type => (
          <button
            key={type.id}
            onClick={() => {
              setActiveCropType(type.id as any);
              try { navigator.vibrate?.(10); } catch {}
            }}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer snappy-touch ${
              activeCropType === type.id
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : isDarkMode ? 'text-zinc-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* PRIMARY INDICATORS GRID */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        {/* SPRAY SUITABILITY GAUGE CARD */}
        <div className={`p-3 rounded-2xl border ${sprayStatus.bg} ${sprayStatus.border} flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wide opacity-80 flex items-center space-x-1">
              <Gauge size={12} style={{ color: sprayStatus.color }} />
              <span>Spray Window</span>
            </span>
            <span className="text-xs font-black" style={{ color: sprayStatus.color }}>
              {sprayScore}/100
            </span>
          </div>

          <span className="text-xs font-black block mt-0.5" style={{ color: sprayStatus.color }}>
            {sprayStatus.title}
          </span>

          <p className="text-[10px] opacity-75 font-semibold mt-1">
            Wind: {formatWind(metrics.windSpeed)} • Humidity: {metrics.humidity}%
          </p>
        </div>

        {/* FROST & HEAT HAZARD MONITOR */}
        <div className="p-3 rounded-2xl border bg-white/5 border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wide opacity-80 flex items-center space-x-1">
              <Thermometer size={12} style={{ color: frostRisk.color }} />
              <span>Thermal Hazard</span>
            </span>
            <frostRisk.icon size={13} style={{ color: frostRisk.color }} />
          </div>

          <span className="text-xs font-black block mt-0.5" style={{ color: frostRisk.color }}>
            {frostRisk.level}
          </span>

          <p className="text-[10px] opacity-75 font-semibold mt-1 truncate">
            {frostRisk.msg}
          </p>
        </div>
      </div>

      {/* EXPANDABLE DEEP MICROCLIMATE METRICS */}
      {showDetails && (
        <div className="pt-3 border-t border-white/10 space-y-2.5 animate-card-slide-fade">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] font-bold opacity-70 block">Water Loss (ET0)</span>
              <span className="text-sm font-black text-teal-400 mt-0.5 block">{estimatedET0} mm/day</span>
              <span className="text-[9px] opacity-60">Evapotranspiration</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] font-bold opacity-70 block">Est. Soil Temp</span>
              <span className="text-sm font-black text-amber-400 mt-0.5 block">{formatTemp(metrics.temperature - 2)}</span>
              <span className="text-[9px] opacity-60">Top 5cm Depth</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] font-bold opacity-70 block">Fieldwork Index</span>
              <span className="text-sm font-black text-emerald-400 mt-0.5 block">9.2 / 10</span>
              <span className="text-[9px] opacity-60">High Tilling Ready</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs font-medium flex items-start space-x-2">
            <Sparkles size={16} className="text-teal-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-teal-300 font-extrabold block mb-0.5">
                {activeCropType === 'field' ? 'Field Crop Recommendation:' : activeCropType === 'orchard' ? 'Orchard Management:' : 'Garden Care:'}
              </strong>
              <span>
                {activeCropType === 'field' && 'Favorable moisture retention. Ideal morning window for nitrogen soil top-dressing and field weed management.'}
                {activeCropType === 'orchard' && 'Transpiration levels normal. No signs of canopy heat stress. Maintain drip irrigation at standard frequency.'}
                {activeCropType === 'garden' && 'Great weather for outdoor pruning, bed mulching, and transplanting seedlings in gentle afternoon light.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
