import React from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Flower2, 
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
    <div className="w-full px-4 pt-3 pb-24 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
        <h1 className="text-xl font-black tracking-tight">
          Air Quality & Solar Cycle
        </h1>
        <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
          Atmospheric pollutants, allergens & celestial ephemeris • {location.name}
        </p>
      </div>

      {/* 1. AIR QUALITY INDEX (EPA AQI) */}
      <div 
        className={`p-4 rounded-[26px] mb-3.5 border shadow-xs transition-colors ${
          isDarkMode ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
            }`}>
              EPA Air Quality Index
            </span>
            <div className="flex items-baseline space-x-2.5 mt-1">
              <span className="text-4xl font-black tracking-tight font-mono-numbers">
                {airQuality.aqi}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                airQuality.aqi <= 50 
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                  : airQuality.aqi <= 100
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
              }`}>
                {airQuality.category}
              </span>
            </div>
            <p className={`text-xs mt-2 leading-relaxed font-medium ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              {airQuality.healthAdvice}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDarkMode ? 'bg-[#18261E] text-[#10B981]' : 'bg-[#EAF5EF] text-[#1B4332]'
          }`}>
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
          <div className="flex justify-between text-[10px] font-bold text-[#5D6861] dark:text-[#89998F] mt-1">
            <span>Good (0)</span>
            <span>Moderate (50)</span>
            <span>Unhealthy (150)</span>
            <span>Hazardous (300+)</span>
          </div>
        </div>

        {/* Pollutants Breakdown */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-center">
          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'}`}>
            <span className="text-[10px] font-bold text-[#5D6861] dark:text-[#89998F] block">PM2.5</span>
            <span className="text-xs font-black text-sky-500">{airQuality.pm25} µg</span>
          </div>
          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'}`}>
            <span className="text-[10px] font-bold text-[#5D6861] dark:text-[#89998F] block">PM10</span>
            <span className="text-xs font-black text-[#10B981]">{airQuality.pm10} µg</span>
          </div>
          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'}`}>
            <span className="text-[10px] font-bold text-[#5D6861] dark:text-[#89998F] block">Ozone</span>
            <span className="text-xs font-black text-amber-500">{airQuality.ozone} ppb</span>
          </div>
          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'}`}>
            <span className="text-[10px] font-bold text-[#5D6861] dark:text-[#89998F] block">NO₂</span>
            <span className="text-xs font-black text-purple-400">{airQuality.no2} ppb</span>
          </div>
        </div>
      </div>

      {/* 2. SOLAR EPHEMERIS & DAYLIGHT ARC */}
      <div 
        className={`p-4 rounded-[26px] mb-3.5 border shadow-xs transition-colors ${
          isDarkMode ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Sun size={16} className="text-[#FF5C00]" />
            <h3 className="text-xs font-black uppercase tracking-tight">
              Solar Daylight Ephemeris
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#FF5C00]">
            Daylight: {astronomy.dayLength}
          </span>
        </div>

        {/* Solar Arc Curve SVG */}
        <div className="relative w-full h-24 flex items-center justify-center">
          <svg viewBox="0 0 320 100" className="w-full h-full overflow-visible">
            {/* Horizon Line */}
            <line x1="20" y1="80" x2="300" y2="80" stroke={isDarkMode ? '#1E2821' : '#E8E6DF'} strokeWidth="1.5" strokeDasharray="4 4" />
            
            {/* Solar Path Arc */}
            <path
              d="M 30 80 Q 160 -5 290 80"
              fill="none"
              stroke={isDarkMode ? '#223328' : '#DCD7CE'}
              strokeWidth="2.5"
            />

            {/* Daytime Progress Arc */}
            <path
              d="M 30 80 Q 110 30 180 25"
              fill="none"
              stroke="#FF5C00"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Sun Marker */}
            <circle cx="180" cy="25" r="10" fill="#FF5C00" filter="drop-shadow(0 0 8px rgba(255, 92, 0, 0.7))" />
            <circle cx="180" cy="25" r="6" fill="#FEF08A" />

            {/* Sunrise / Sunset Markers */}
            <text x="25" y="96" fill={isDarkMode ? '#89998F' : '#5D6861'} fontSize="11" fontWeight="bold">
              {astronomy.sunrise}
            </text>
            <text x="250" y="96" fill={isDarkMode ? '#89998F' : '#5D6861'} fontSize="11" fontWeight="bold">
              {astronomy.sunset}
            </text>
          </svg>
        </div>

        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between text-xs">
          <div>
            <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>Golden Hour</span>
            <span className="font-bold text-[#FF5C00]">{astronomy.goldenHour}</span>
          </div>
          <div>
            <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>Solar Noon</span>
            <span className="font-bold">{astronomy.solarNoon}</span>
          </div>
          <div>
            <span className={`text-[10px] block font-bold ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>Current State</span>
            <span className="font-bold text-[#10B981]">
              {astronomy.isDaytime ? 'Daylight' : 'Night'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MOON PHASE & ILLUMINATION */}
      <div 
        className={`p-4 rounded-[26px] mb-3.5 border shadow-xs transition-colors ${
          isDarkMode ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Moon size={16} className="text-sky-300" />
            <h3 className="text-xs font-black uppercase tracking-tight">
              Celestial Moon Phase
            </h3>
          </div>
          <span className="text-[11px] font-bold text-sky-400">
            {astronomy.moonIllumination}% Illumination
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 border ${
            isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'
          }`}>
            {astronomy.moonPhase === 'Full Moon' ? '🌕' : astronomy.moonPhase === 'New Moon' ? '🌑' : '🌙'}
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-black">{astronomy.moonPhase}</h4>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              Moonrise at {astronomy.moonrise} • Sets at {astronomy.moonset}
            </p>

            <div className="mt-2 w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-[#10B981] rounded-full"
                style={{ width: `${astronomy.moonIllumination}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. POLLEN ALLERGEN RISK */}
      <div 
        className={`p-4 rounded-[26px] border shadow-xs transition-colors ${
          isDarkMode ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-2">
            <Flower2 size={16} className="text-rose-400" />
            <h3 className="text-xs font-black uppercase tracking-tight">
              Crop & Pollen Allergen Levels
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#10B981]">
            Low Agricultural Risk
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'}`}>
            <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>Tree Pollen</span>
            <span className="text-xs font-black text-[#10B981] mt-0.5 block">{airQuality.treePollen}</span>
          </div>

          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'}`}>
            <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>Grass Pollen</span>
            <span className="text-xs font-black text-[#10B981] mt-0.5 block">{airQuality.grassPollen}</span>
          </div>

          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-[#162019] border-[#1E2821]' : 'bg-[#F8F7F4] border-[#E8E6DF]'}`}>
            <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>Weed Pollen</span>
            <span className="text-xs font-black text-[#10B981] mt-0.5 block">{airQuality.weedPollen}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
