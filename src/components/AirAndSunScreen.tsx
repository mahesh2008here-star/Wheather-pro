import React from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Flower2, 
} from 'lucide-react';
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
  return (
    <div className="w-full px-4 pt-3 pb-32 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
        <h1 className="text-xl font-black tracking-tight text-[#171717]">
          Air Quality & Solar Cycle
        </h1>
        <p className="text-xs mt-0.5 font-medium text-[#737873]">
          Atmospheric pollutants, allergens & celestial ephemeris • {location.name}
        </p>
      </div>

      {/* 1. AIR QUALITY INDEX (EPA AQI) */}
      <div className="p-4 rounded-[28px] mb-3.5 border border-[#E9E7E1] bg-white shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-[#737873]">
              EPA Air Quality Index
            </span>
            <div className="flex items-baseline space-x-2.5 mt-1">
              <span className="text-4xl font-black tracking-tight font-mono-numbers text-[#171717]">
                {airQuality.aqi}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                airQuality.aqi <= 50 
                  ? 'bg-[#E5F5EC] text-[#10B981] border-[#CEEFDB]'
                  : airQuality.aqi <= 100
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                {airQuality.category}
              </span>
            </div>
            <p className="text-xs mt-2 leading-relaxed font-medium text-[#737873]">
              {airQuality.healthAdvice}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-[#E5F5EC] text-[#10B981] border border-[#CEEFDB]">
            <ShieldCheck size={22} />
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
          <div className="flex justify-between text-[10px] font-bold text-[#737873] mt-1">
            <span>Good (0)</span>
            <span>Moderate (50)</span>
            <span>Unhealthy (150)</span>
            <span>Hazardous (300+)</span>
          </div>
        </div>

        {/* Pollutants Breakdown */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#E9E7E1] text-center">
          <div className="p-2 rounded-xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <span className="text-[10px] font-bold text-[#737873] block">PM2.5</span>
            <span className="text-xs font-black text-[#0284C7]">{airQuality.pm25} µg</span>
          </div>
          <div className="p-2 rounded-xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <span className="text-[10px] font-bold text-[#737873] block">PM10</span>
            <span className="text-xs font-black text-[#10B981]">{airQuality.pm10} µg</span>
          </div>
          <div className="p-2 rounded-xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <span className="text-[10px] font-bold text-[#737873] block">Ozone</span>
            <span className="text-xs font-black text-amber-600">{airQuality.ozone} ppb</span>
          </div>
          <div className="p-2 rounded-xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <span className="text-[10px] font-bold text-[#737873] block">NO₂</span>
            <span className="text-xs font-black text-[#7C3AED]">{airQuality.no2} ppb</span>
          </div>
        </div>
      </div>

      {/* 2. SOLAR EPHEMERIS & DAYLIGHT ARC */}
      <div className="p-4 rounded-[28px] mb-3.5 border border-[#E9E7E1] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Sun size={16} className="text-[#FF7900]" />
            <h3 className="text-xs font-black uppercase tracking-tight text-[#171717]">
              Solar Daylight Ephemeris
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#FF7900]">
            Daylight: {astronomy.dayLength}
          </span>
        </div>

        {/* Solar Arc Curve SVG */}
        <div className="relative w-full h-24 flex items-center justify-center">
          <svg viewBox="0 0 320 100" className="w-full h-full overflow-visible">
            {/* Horizon Line */}
            <line x1="20" y1="80" x2="300" y2="80" stroke="#E9E7E1" strokeWidth="1.5" strokeDasharray="4 4" />
            
            {/* Solar Path Arc */}
            <path
              d="M 30 80 Q 160 -5 290 80"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="2.5"
            />

            {/* Daytime Progress Arc */}
            <path
              d="M 30 80 Q 110 30 180 25"
              fill="none"
              stroke="#FF7900"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Sun Marker */}
            <circle cx="180" cy="25" r="9" fill="#FF7900" filter="drop-shadow(0 0 6px rgba(255, 121, 0, 0.5))" />
            <circle cx="180" cy="25" r="5" fill="#FEF08A" />

            {/* Sunrise / Sunset Markers */}
            <text x="25" y="96" fill="#737873" fontSize="11" fontWeight="bold">
              {astronomy.sunrise}
            </text>
            <text x="250" y="96" fill="#737873" fontSize="11" fontWeight="bold">
              {astronomy.sunset}
            </text>
          </svg>
        </div>

        <div className="mt-3 pt-3 border-t border-[#E9E7E1] flex justify-between text-xs">
          <div>
            <span className="text-[10px] block font-bold text-[#737873]">Golden Hour</span>
            <span className="font-bold text-[#FF7900]">{astronomy.goldenHour}</span>
          </div>
          <div>
            <span className="text-[10px] block font-bold text-[#737873]">Solar Noon</span>
            <span className="font-bold text-[#171717]">{astronomy.solarNoon}</span>
          </div>
          <div>
            <span className="text-[10px] block font-bold text-[#737873]">Current State</span>
            <span className="font-bold text-[#10B981]">
              {astronomy.isDaytime ? 'Daylight' : 'Night'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MOON PHASE & ILLUMINATION */}
      <div className="p-4 rounded-[28px] mb-3.5 border border-[#E9E7E1] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Moon size={16} className="text-[#0284C7]" />
            <h3 className="text-xs font-black uppercase tracking-tight text-[#171717]">
              Celestial Moon Phase
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#0284C7]">
            {astronomy.moonIllumination}% Illumination
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 border border-[#E9E7E1] bg-[#F7F6F2]">
            {astronomy.moonPhase === 'Full Moon' ? '🌕' : astronomy.moonPhase === 'New Moon' ? '🌑' : '🌙'}
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-black text-[#171717]">{astronomy.moonPhase}</h4>
            <p className="text-xs mt-0.5 text-[#737873]">
              Moonrise at {astronomy.moonrise} • Sets at {astronomy.moonset}
            </p>

            <div className="mt-2 w-full h-1.5 rounded-full bg-[#E9E7E1] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-[#10B981] rounded-full"
                style={{ width: `${astronomy.moonIllumination}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. POLLEN ALLERGEN RISK */}
      <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Flower2 size={16} className="text-rose-500" />
            <h3 className="text-xs font-black uppercase tracking-tight text-[#171717]">
              Crop & Pollen Allergen Levels
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#10B981]">
            Low Agricultural Risk
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <span className="text-[10px] font-bold block text-[#737873]">Tree Pollen</span>
            <span className="text-xs font-black text-[#10B981] mt-0.5 block">{airQuality.treePollen}</span>
          </div>

          <div className="p-2.5 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <span className="text-[10px] font-bold block text-[#737873]">Grass Pollen</span>
            <span className="text-xs font-black text-[#10B981] mt-0.5 block">{airQuality.grassPollen}</span>
          </div>

          <div className="p-2.5 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2]">
            <span className="text-[10px] font-bold block text-[#737873]">Weed Pollen</span>
            <span className="text-xs font-black text-[#10B981] mt-0.5 block">{airQuality.weedPollen}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
