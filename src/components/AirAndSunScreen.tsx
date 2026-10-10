import React from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Wind, 
  Flower2, 
  Activity, 
  Clock, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AirQualityData, AstronomyData, LocationInfo } from '../types/weather';

interface AirAndSunScreenProps {
  airQuality: AirQualityData;
  astronomy: AstronomyData;
  location: LocationInfo;
}

export const AirAndSunScreen: React.FC<AirAndSunScreenProps> = ({
  airQuality,
  astronomy,
  location,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`w-full min-h-full px-4 pt-3 pb-24 transition-colors ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F8F6F0] text-stone-900'
    }`}>
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-2xl font-black tracking-tight">
          Air Quality & Sun
        </h1>
        <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
          Atmospheric pollutants, allergens & celestial ephemeris • {location.name}
        </p>
      </div>

      {/* 1. AIR QUALITY INDEX (AQI) HERO CARD */}
      <div 
        className={`p-4 rounded-3xl mb-3.5 transition-all relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.9)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              EPA Air Quality Index
            </span>
            <div className="flex items-baseline space-x-2.5 mt-1">
              <span className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {airQuality.aqi}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {airQuality.category}
              </span>
            </div>
            <p className={`text-xs mt-2 leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-stone-600'}`}>
              {airQuality.healthAdvice}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* AQI Range Gradient Spectrum Bar */}
        <div className="mt-4">
          <div className="relative w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-500 via-rose-600 to-purple-800">
            <div 
              className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md -ml-1 transition-all"
              style={{ left: `${Math.min(95, Math.max(5, (airQuality.aqi / 200) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 mt-1">
            <span>Good (0)</span>
            <span>Mod (50)</span>
            <span>Unhealthy (150)</span>
            <span>Hazardous (300+)</span>
          </div>
        </div>

        {/* Individual Pollutants Breakdown */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-center">
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[10px] font-bold text-zinc-400 block">PM2.5</span>
            <span className="text-xs font-black text-sky-400">{airQuality.pm25} µg</span>
          </div>
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[10px] font-bold text-zinc-400 block">PM10</span>
            <span className="text-xs font-black text-teal-400">{airQuality.pm10} µg</span>
          </div>
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[10px] font-bold text-zinc-400 block">Ozone</span>
            <span className="text-xs font-black text-amber-400">{airQuality.ozone} ppb</span>
          </div>
          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="text-[10px] font-bold text-zinc-400 block">NO₂</span>
            <span className="text-xs font-black text-purple-400">{airQuality.no2} ppb</span>
          </div>
        </div>
      </div>

      {/* 2. POLLEN & ALLERGEN MONITOR */}
      <div 
        className={`p-4 rounded-3xl mb-3.5 transition-all ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.9)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Flower2 size={16} className="text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Pollen & Allergen Forecast
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-400">Low Allergy Risk</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-zinc-950 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-bold text-zinc-400 block">Tree Pollen</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">{airQuality.treePollen}</span>
            <div className="w-full h-1 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-400 w-1/4" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-zinc-950 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-bold text-zinc-400 block">Grass Pollen</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">{airQuality.grassPollen}</span>
            <div className="w-full h-1 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-400 w-1/5" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-zinc-950 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-bold text-zinc-400 block">Weed Pollen</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">{airQuality.weedPollen}</span>
            <div className="w-full h-1 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-400 w-1/6" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SOLAR EPHEMERIS & DAYLIGHT ARC */}
      <div 
        className={`p-4 rounded-3xl mb-3.5 transition-all ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.9)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sun size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Solar Daylight Ephemeris
            </h3>
          </div>
          <span className="text-[11px] font-bold text-amber-400">
            Daylight: {astronomy.dayLength}
          </span>
        </div>

        {/* Solar Arc Curve SVG */}
        <div className="relative w-full h-28 flex items-center justify-center">
          <svg viewBox="0 0 320 110" className="w-full h-full overflow-visible">
            {/* Horizon Line */}
            <line x1="20" y1="90" x2="300" y2="90" stroke={isDarkMode ? '#27272A' : '#E4E4E7'} strokeWidth="1.5" strokeDasharray="4 4" />
            
            {/* Solar Path Arc */}
            <path
              d="M 30 90 Q 160 -10 290 90"
              fill="none"
              stroke={isDarkMode ? '#3F3F46' : '#D4D4D8'}
              strokeWidth="2.5"
            />

            {/* Daytime Progress Glow Arc */}
            <path
              d="M 30 90 Q 110 35 180 30"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Sun Icon Position */}
            <circle cx="180" cy="30" r="12" fill="#F59E0B" filter="drop-shadow(0 0 10px rgba(245, 158, 11, 0.9))" />
            <circle cx="180" cy="30" r="8" fill="#FEF08A" />

            {/* Sunrise / Sunset Markers */}
            <text x="25" y="106" fill={isDarkMode ? '#A1A1AA' : '#71717A'} fontSize="11" fontWeight="bold">
              {astronomy.sunrise}
            </text>
            <text x="250" y="106" fill={isDarkMode ? '#A1A1AA' : '#71717A'} fontSize="11" fontWeight="bold">
              {astronomy.sunset}
            </text>
          </svg>
        </div>

        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between text-xs">
          <div>
            <span className="text-zinc-500 text-[11px] block">Golden Hour</span>
            <span className="font-bold text-amber-400">{astronomy.goldenHour}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[11px] block">Solar Noon</span>
            <span className="font-bold">{astronomy.solarNoon}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[11px] block">Current Cycle</span>
            <span className="font-bold text-emerald-400">{astronomy.isDaytime ? 'Daytime' : 'Nighttime'}</span>
          </div>
        </div>
      </div>

      {/* 4. MOON PHASE & ILLUMINATION */}
      <div 
        className={`p-4 rounded-3xl transition-all ${
          isDarkMode 
            ? 'bg-[#000000] border border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.9)]' 
            : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Moon size={16} className="text-sky-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Moon Phase & Illumination
            </h3>
          </div>
          <span className="text-[11px] font-bold text-sky-400">
            {astronomy.moonIllumination}% Illumination
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl shadow-lg shrink-0">
            {astronomy.moonPhase === 'Full Moon' ? '🌕' : astronomy.moonPhase === 'New Moon' ? '🌑' : '🌙'}
          </div>

          <div className="flex-1">
            <h4 className="text-base font-black">{astronomy.moonPhase}</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Moonrise at {astronomy.moonrise} • Sets at {astronomy.moonset}
            </p>

            <div className="mt-2 w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                style={{ width: `${astronomy.moonIllumination}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
