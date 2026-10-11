import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Snowflake, 
  CloudFog, 
  Moon, 
  Droplets, 
  Wind, 
  ArrowUp, 
  ArrowDown,
  Clock,
  Sparkles
} from 'lucide-react';
import { WeatherSceneState } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface FarmWeatherHeroProps {
  sceneState: WeatherSceneState;
  temperature: number;
  conditionTitle: string;
  isLive: boolean;
  tempMin?: number;
  tempMax?: number;
  apparentTemperature?: number;
  onRefresh?: () => void;
  rainChance?: number;
  windSpeed?: number;
  windDirectionCardinal?: string;
  humidity?: number;
  lastUpdated?: string;
  weatherCode?: number;
  isDaytime?: boolean;
}

export const FarmWeatherHero: React.FC<FarmWeatherHeroProps> = ({
  temperature,
  conditionTitle,
  tempMin,
  tempMax,
  apparentTemperature,
  rainChance = 0,
  windSpeed = 0,
  windDirectionCardinal = 'N',
  humidity = 50,
  lastUpdated,
  weatherCode = 0,
  isDaytime = true
}) => {
  const { isDarkMode, formatTemp } = useTheme();

  // Dynamic condition classification for art styling
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isStorm = [95, 96, 99].includes(weatherCode);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isFog = [45, 48].includes(weatherCode);
  const isCloudy = [2, 3].includes(weatherCode);
  const isClear = weatherCode === 0 || weatherCode === 1;

  // Real-world farm summary statement
  const conditionSummary = React.useMemo(() => {
    if (rainChance > 40) {
      return `Elevated precipitation chance (${rainChance}%). Surface soil moisture is increasing; hold heavy machinery.`;
    }
    if (windSpeed >= 22) {
      return `Brisk surface winds (${windSpeed} km/h ${windDirectionCardinal}). High drift risk for tractor foliar spraying.`;
    }
    if (temperature >= 30) {
      return `Elevated thermal demand. High canopy evapotranspiration; morning irrigation recommended.`;
    }
    if (temperature <= 4) {
      return `Near-freezing temperatures. Check sensitive crop plantings for ground frost risk.`;
    }
    return `Stable microclimate conditions favorable for general field operations and cultivation.`;
  }, [rainChance, windSpeed, windDirectionCardinal, temperature]);

  return (
    <div className="w-full px-4 pt-3 pb-2 select-none">
      {/* Hero Master Card */}
      <div 
        className={`w-full rounded-[28px] overflow-hidden border shadow-sm transition-all relative ${
          isDarkMode 
            ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
            : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        {/* ATMOSPHERIC ARTWORK VIEWPORT */}
        <div className="relative w-full h-36 overflow-hidden select-none">
          {/* Dynamic Sky Gradient Layer */}
          <div 
            className="absolute inset-0 transition-colors duration-700"
            style={{
              background: isDarkMode
                ? isStorm
                  ? 'linear-gradient(180deg, #180F29 0%, #101B17 100%)'
                  : isRain
                  ? 'linear-gradient(180deg, #102126 0%, #0D1714 100%)'
                  : 'linear-gradient(180deg, #0D1C16 0%, #13241C 100%)'
                : isStorm
                ? 'linear-gradient(180deg, #3B4252 0%, #E5E9F0 100%)'
                : isRain
                ? 'linear-gradient(180deg, #B5CAD4 0%, #E8EFEA 100%)'
                : isDaytime
                ? 'linear-gradient(180deg, #FDE68A 0%, #E0F2FE 45%, #E9F4EE 100%)'
                : 'linear-gradient(180deg, #2D3748 0%, #CBD5E1 100%)'
            }}
          />

          {/* SVG Atmospheric Agricultural Landscape */}
          <svg 
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 400 144"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDarkMode ? '#1B2E24' : '#C1DAC9'} />
                <stop offset="100%" stopColor={isDarkMode ? '#13221A' : '#A7C9B1'} />
              </linearGradient>
              <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDarkMode ? '#223D30' : '#88B896'} />
                <stop offset="100%" stopColor={isDarkMode ? '#172C22' : '#6DA47E'} />
              </linearGradient>
              <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Celestial Body: Sun or Moon */}
            {isDaytime ? (
              <g transform="translate(320, 36)">
                <circle cx="0" cy="0" r="28" fill="url(#sunGlow)" opacity={isCloudy ? 0.35 : 0.85} />
                <circle cx="0" cy="0" r="16" fill="#FF5C00" />
                <circle cx="0" cy="0" r="14" fill="#FBBF24" />
              </g>
            ) : (
              <g transform="translate(320, 36)">
                <circle cx="0" cy="0" r="14" fill="#FDE68A" />
                <circle cx="5" cy="-3" r="13" fill={isDarkMode ? '#0D1C16' : '#2D3748'} />
                {/* Twinkling Field Stars */}
                <circle cx="-180" cy="-10" r="1.5" fill="#FFFFFF" opacity="0.8" />
                <circle cx="-130" cy="-22" r="1" fill="#FFFFFF" opacity="0.6" />
                <circle cx="-80" cy="-5" r="1.2" fill="#FFFFFF" opacity="0.75" />
                <circle cx="-230" cy="-15" r="1.5" fill="#FFFFFF" opacity="0.9" />
              </g>
            )}

            {/* Drifting Clouds for overcast/rain */}
            {(isCloudy || isRain || isStorm) && (
              <g opacity={isDarkMode ? 0.45 : 0.75}>
                <path d="M40 50 Q60 30 90 45 Q120 25 150 45 Q170 50 160 65 L30 65 Z" fill={isDarkMode ? '#33443C' : '#FFFFFF'} />
                <path d="M190 35 Q210 20 240 32 Q265 18 290 35 L180 48 Z" fill={isDarkMode ? '#283830' : '#E2E8F0'} />
              </g>
            )}

            {/* Gentle Rain Streaks */}
            {(isRain || isStorm) && (
              <g stroke={isDarkMode ? '#38BDF8' : '#0284C7'} strokeWidth="1.2" opacity="0.65" strokeLinecap="round">
                <line x1="50" y1="55" x2="40" y2="80" />
                <line x1="110" y1="45" x2="100" y2="70" />
                <line x1="170" y1="60" x2="160" y2="85" />
                <line x1="230" y1="50" x2="220" y2="75" />
                <line x1="290" y1="58" x2="280" y2="83" />
                <line x1="350" y1="48" x2="340" y2="73" />
              </g>
            )}

            {/* Lightning Flash Bolt for Storms */}
            {isStorm && (
              <path d="M140 25 L125 50 L135 52 L115 80" stroke="#FDE047" strokeWidth="2.5" fill="none" />
            )}

            {/* Rolling Agricultural Pasture Hills (Distant) */}
            <path 
              d="M-20 144 L-20 102 Q60 85 140 104 Q220 120 310 95 Q380 75 420 90 L420 144 Z" 
              fill="url(#hillBack)" 
            />

            {/* Wind Turbine Silhouette on Distant Hill */}
            <g transform="translate(140, 78)" stroke={isDarkMode ? '#476353' : '#689678'} strokeWidth="1.5">
              <line x1="0" y1="0" x2="0" y2="26" />
              <line x1="0" y1="0" x2="10" y2="-6" strokeWidth="1" />
              <line x1="0" y1="0" x2="-8" y2="-8" strokeWidth="1" />
              <line x1="0" y1="0" x2="-2" y2="12" strokeWidth="1" />
            </g>

            {/* Silhouetted Barn / Farm Silo */}
            <g transform="translate(65, 96)" fill={isDarkMode ? '#1D3025' : '#4E7E5E'}>
              <polygon points="0,18 10,8 20,18" />
              <rect x="2" y="18" width="16" height="14" />
              <rect x="22" y="12" width="6" height="20" rx="2" />
            </g>

            {/* Foreground Farm Pasture with Contour Furrows */}
            <path 
              d="M-20 144 L-20 118 Q80 100 190 120 Q290 138 420 114 L420 144 Z" 
              fill="url(#hillFront)" 
            />
            {/* Crop Field Row Lines */}
            <path 
              d="M-10 140 Q100 122 220 134 Q320 142 410 130" 
              stroke={isDarkMode ? '#2D4E3E' : '#9DC7AA'} 
              strokeWidth="1.2" 
              fill="none" 
            />
          </svg>

          {/* Floating Condition & Location Kicker Badge */}
          <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full backdrop-blur-md bg-black/25 text-white text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block shrink-0" />
            <span className="tracking-tight">{conditionTitle}</span>
          </div>

          {/* Timestamp Sync Pill */}
          {lastUpdated && (
            <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full backdrop-blur-md bg-black/25 text-white/90 text-[10px] font-semibold">
              <Clock size={10} />
              <span>{lastUpdated}</span>
            </div>
          )}
        </div>

        {/* HERO WEATHER NUMBERS & METRICS */}
        <div className="p-5">
          {/* Main Temperature & High/Low Split */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline">
              <span className="hero-temperature text-7xl sm:text-8xl font-black tracking-tighter">
                {temperature}
              </span>
              <span className="text-4xl font-black text-[#FF5C00] ml-1">
                °
              </span>
            </div>

            {/* High / Low Column */}
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center space-x-2.5 text-xs font-black font-mono-numbers">
                {tempMax !== undefined && (
                  <span className="flex items-center text-[#121814] dark:text-[#F3F6F4]">
                    <ArrowUp size={13} className="text-[#FF5C00] mr-0.5" />
                    <span>{formatTemp(tempMax)}</span>
                  </span>
                )}
                {tempMin !== undefined && (
                  <span className="flex items-center text-[#5D6861] dark:text-[#89998F]">
                    <ArrowDown size={13} className="mr-0.5" />
                    <span>{formatTemp(tempMin)}</span>
                  </span>
                )}
              </div>
              
              {apparentTemperature !== undefined && (
                <span className={`text-[11px] font-semibold mt-1 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
                  Feels like {formatTemp(apparentTemperature)}
                </span>
              )}
            </div>
          </div>

          {/* Editorial Agronomy Guidance Sentence */}
          <p className={`text-xs leading-relaxed my-3 font-medium ${
            isDarkMode ? 'text-[#A3B2A9]' : 'text-[#4A554E]'
          }`}>
            {conditionSummary}
          </p>

          {/* Clean 3-Metric Atmospheric Strip */}
          <div className={`pt-3.5 mt-2 border-t grid grid-cols-3 gap-3 ${
            isDarkMode ? 'border-[#1E2821]' : 'border-[#E8E6DF]'
          }`}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
              }`}>
                Rain Probability
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <Droplets size={13} className={rainChance > 30 ? 'text-[#FF5C00]' : 'text-[#0284C7]'} />
                <span className={`text-sm font-black font-mono-numbers ${rainChance > 30 ? 'text-[#FF5C00]' : ''}`}>
                  {rainChance}%
                </span>
              </div>
            </div>

            <div className={`border-l pl-3 ${isDarkMode ? 'border-[#1E2821]' : 'border-[#E8E6DF]'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
              }`}>
                Field Wind
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <Wind size={13} className="text-[#10B981]" />
                <span className="text-sm font-black font-mono-numbers">
                  {windSpeed} <span className="text-[10px] font-medium text-[#5D6861] dark:text-[#89998F]">{windDirectionCardinal}</span>
                </span>
              </div>
            </div>

            <div className={`border-l pl-3 ${isDarkMode ? 'border-[#1E2821]' : 'border-[#E8E6DF]'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
              }`}>
                Humidity
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-sm font-black font-mono-numbers">
                  {humidity}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
