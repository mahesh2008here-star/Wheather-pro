import React, { useMemo, useState } from 'react';
import { WeatherSceneState } from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Maximize2, LayoutGrid, Eye, Wind, Moon, Sun } from 'lucide-react';

interface FarmWeatherHeroProps {
  sceneState: WeatherSceneState;
  temperature: number;
  conditionTitle: string;
  isLive: boolean;
  tempMin?: number;
  tempMax?: number;
  apparentTemperature?: number;
  onRefresh?: () => void;
}

export const FarmWeatherHero: React.FC<FarmWeatherHeroProps> = ({
  sceneState,
  temperature,
  conditionTitle,
  isLive,
  tempMin,
  tempMax,
  apparentTemperature,
}) => {
  const { isDarkMode, formatTemp } = useTheme();

  // Widget presentation styles: 'hero' (full landscape) | 'compact' (floating widget) | 'capsule' (minimalist)
  const [widgetMode, setWidgetMode] = useState<'hero' | 'compact' | 'capsule'>('hero');
  // Interactive micro-delights
  const [isTurbineBoosted, setIsTurbineBoosted] = useState<boolean>(false);
  const [isLoftWindowLit, setIsLoftWindowLit] = useState<boolean>(true);
  const [showSceneInfo, setShowSceneInfo] = useState<boolean>(false);

  // Trigger turbine boost on tap
  const handleTurbineClick = () => {
    setIsTurbineBoosted(true);
    setTimeout(() => setIsTurbineBoosted(false), 2600);
  };

  // Color palettes tailored for Daytime & True OLED AMOLED Black (#000000)
  const skyConfig = useMemo(() => {
    if (isDarkMode || sceneState === 'night_clear' || sceneState === 'night_cloudy') {
      return {
        gradientStart: '#000000',
        gradientMid: '#000000',
        gradientEnd: '#000000',
        hill1: '#04070B',
        hill2: '#080E14',
        field: '#0C0A08',
        sunColor: '#FEF08A',
        isNight: true,
      };
    }

    switch (sceneState) {
      case 'sunny':
        return {
          gradientStart: '#68B7E8',
          gradientMid: '#99D3F3',
          gradientEnd: '#E2F0F7',
          hill1: '#5FB545',
          hill2: '#7ECB55',
          field: '#7B6046',
          sunColor: '#F59E0B',
          isNight: false,
        };
      case 'clouds_rolling_in':
        return {
          gradientStart: '#728F9E',
          gradientMid: '#9BB3BF',
          gradientEnd: '#CFDCE3',
          hill1: '#548F45',
          hill2: '#6EAA55',
          field: '#6E5742',
          sunColor: '#FDE047',
          isNight: false,
        };
      case 'wind_picking_up':
        return {
          gradientStart: '#546A78',
          gradientMid: '#748794',
          gradientEnd: '#B5C0C7',
          hill1: '#4A7A3E',
          hill2: '#5F9048',
          field: '#5F4B38',
          sunColor: '#FEF08A',
          isNight: false,
        };
      case 'rain_shower':
      case 'storm':
        return {
          gradientStart: '#3A4E5C',
          gradientMid: '#566B78',
          gradientEnd: '#8B9CA6',
          hill1: '#37622E',
          hill2: '#477336',
          field: '#4A3B2B',
          sunColor: '#CBD5E1',
          isNight: false,
        };
      case 'clearing_up':
      default:
        return {
          gradientStart: '#6EBDE8',
          gradientMid: '#9CD5F3',
          gradientEnd: '#DFEFF6',
          hill1: '#5BB043',
          hill2: '#7BC654',
          field: '#785F45',
          sunColor: '#F59E0B',
          isNight: false,
        };
    }
  }, [sceneState, isDarkMode]);

  // Dynamic turbine spin speed
  const turbineSpeed = isTurbineBoosted
    ? '0.35s'
    : sceneState === 'wind_picking_up'
    ? '0.7s'
    : sceneState === 'rain_shower'
    ? '1.5s'
    : '3.6s';

  // Raindrop simulation
  const raindrops = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: (i * 11) % 390,
      y: (i * 22) % 250,
      delay: `${(i * 0.06) % 1.2}s`,
      duration: `${0.45 + ((i % 5) * 0.05)}s`,
    }));
  }, []);

  const isNight = skyConfig.isNight;

  // Minimal Capsule View
  if (widgetMode === 'capsule') {
    return (
      <div className="w-full px-4 pt-2 pb-1">
        <div className={`p-3.5 rounded-3xl transition-all flex items-center justify-between border ${
          isDarkMode 
            ? 'bg-[#000000] border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.9)]' 
            : 'bg-white border-stone-200/80 shadow-md'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black ${
              isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-100 text-amber-600'
            }`}>
              {isNight ? <Moon size={22} /> : <Sun size={22} />}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {formatTemp(temperature)}
                </span>
                <span className="text-xs font-bold text-sky-400">
                  {conditionTitle}
                </span>
              </div>
              <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                H:{tempMax !== undefined ? formatTemp(tempMax) : '--'} L:{tempMin !== undefined ? formatTemp(tempMin) : '--'} • Auto Scene
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setWidgetMode('hero')}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                isDarkMode ? 'bg-zinc-900 text-zinc-300 hover:text-white' : 'bg-stone-100 text-stone-700'
              }`}
              title="Expand to Full Hero"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden select-none transition-all ${
      widgetMode === 'compact' ? 'px-3 pt-2' : ''
    }`}>
      {/* Background container */}
      <div 
        className={`relative w-full transition-all duration-700 ease-in-out overflow-hidden ${
          widgetMode === 'compact' 
            ? 'h-[250px] rounded-3xl border border-white/15 shadow-2xl' 
            : 'h-[320px]'
        }`}
        style={{
          background: isDarkMode 
            ? '#000000' 
            : `linear-gradient(180deg, ${skyConfig.gradientStart} 0%, ${skyConfig.gradientMid} 45%, ${skyConfig.gradientEnd} 100%)`,
        }}
      >
        {/* Sky SVG illustration */}
        <svg 
          viewBox="0 0 400 320" 
          className="absolute inset-0 w-full h-full" 
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Sun Glow */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.95" />
              <stop offset="30%" stopColor={skyConfig.sunColor} stopOpacity="0.8" />
              <stop offset="65%" stopColor={skyConfig.sunColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={skyConfig.sunColor} stopOpacity="0" />
            </radialGradient>

            {/* Moon Glow for OLED Black */}
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#0EA5E9" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>

            {/* Rainbow gradient */}
            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.75" />
              <stop offset="18%" stopColor="#F97316" stopOpacity="0.75" />
              <stop offset="36%" stopColor="#EAB308" stopOpacity="0.75" />
              <stop offset="54%" stopColor="#22C55E" stopOpacity="0.75" />
              <stop offset="72%" stopColor="#06B6D4" stopOpacity="0.75" />
              <stop offset="90%" stopColor="#6366F1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.75" />
            </linearGradient>

            {/* Barn Wall Pattern */}
            <pattern id="barnWoodLight" width="6" height="40" patternUnits="userSpaceOnUse">
              <rect width="6" height="40" fill="#BD2D2D" />
              <line x1="5.5" y1="0" x2="5.5" y2="40" stroke="#9E2222" strokeWidth="1" />
            </pattern>

            {/* OLED Barn Texture */}
            <pattern id="barnWoodOLED" width="6" height="40" patternUnits="userSpaceOnUse">
              <rect width="6" height="40" fill="#2D0B0B" />
              <line x1="5.5" y1="0" x2="5.5" y2="40" stroke="#1A0505" strokeWidth="1" />
            </pattern>

            {/* Furrow Row Gradient */}
            <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skyConfig.field} />
              <stop offset="100%" stopColor={isNight ? '#000000' : '#4E3A26'} />
            </linearGradient>
          </defs>

          {/* CELESTIAL BODIES */}
          {!isNight ? (
            /* Day Sun */
            <g className="transition-all duration-700 animate-float-drift" opacity={sceneState === 'rain_shower' ? 0.25 : 1}>
              <circle cx="310" cy="80" r="55" fill="url(#sunGlow)" className="animate-breathing-glow" />
              <circle cx="310" cy="80" r="26" fill={skyConfig.sunColor} />
              <circle cx="310" cy="80" r="21" fill="#FEF08A" opacity="0.85" />
            </g>
          ) : (
            /* OLED True Pitch Black Night Sky (Moon & Stars) */
            <g>
              {/* Twinkling OLED Diamond Stars */}
              <circle cx="45" cy="40" r="1.6" fill="#FFF" opacity="0.9" className="animate-pulse" />
              <circle cx="110" cy="65" r="1.2" fill="#38BDF8" opacity="0.7" />
              <circle cx="170" cy="30" r="1.8" fill="#FFF" opacity="0.95" className="animate-pulse" />
              <circle cx="230" cy="45" r="1.2" fill="#FFF" opacity="0.7" />
              <circle cx="280" cy="25" r="1.5" fill="#38BDF8" opacity="0.8" />
              <circle cx="350" cy="50" r="1.3" fill="#FFF" opacity="0.65" />
              <circle cx="90" cy="95" r="1.2" fill="#FFF" opacity="0.5" />
              <circle cx="215" cy="85" r="1.6" fill="#FFF" opacity="0.85" className="animate-pulse" />
              <circle cx="365" cy="110" r="1.4" fill="#38BDF8" opacity="0.75" />

              {/* Luminous Crescent Moon with soft blue aura */}
              <g className="animate-float-drift cursor-pointer" onClick={() => setShowSceneInfo(prev => !prev)}>
                <circle cx="320" cy="75" r="44" fill="url(#moonGlow)" />
                <path
                  d="M 312 60 A 20 20 0 0 0 328 92 A 18 18 0 1 1 312 60 Z"
                  fill="#FEF08A"
                  filter="drop-shadow(0 0 10px rgba(254, 240, 138, 0.8))"
                />
              </g>
            </g>
          )}

          {/* RAINBOW (When clearing up) */}
          {sceneState === 'clearing_up' && (
            <g className="transition-opacity duration-1000 ease-out">
              <path
                d="M 170 210 A 140 140 0 0 1 395 185"
                fill="none"
                stroke="url(#rainbowGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.85"
                filter="blur(1px)"
              />
              <path
                d="M 172 210 A 136 136 0 0 1 393 185"
                fill="none"
                stroke="url(#rainbowGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>
          )}

          {/* CLOUDS (Automatically rendered based on weather) */}
          {(sceneState === 'clouds_rolling_in' || sceneState === 'night_cloudy' || sceneState === 'rain_shower' || sceneState === 'storm') && (
            <g className="transition-all duration-700 ease-in-out">
              {/* Back Cloud */}
              <path
                d="M 180 75 Q 195 55 220 60 Q 240 45 265 60 Q 285 55 295 75 Q 305 90 290 100 L 185 100 Q 170 90 180 75 Z"
                fill={isNight ? '#0B0F14' : sceneState === 'rain_shower' ? '#64748B' : '#E2E8F0'}
                opacity={sceneState === 'rain_shower' ? 0.9 : 0.75}
              />
              {/* Foreground Cloud */}
              <path
                d="M 230 90 Q 248 65 275 70 Q 300 50 330 67 Q 355 63 370 85 Q 385 103 365 115 L 235 115 Q 215 105 230 90 Z"
                fill={isNight ? '#121820' : sceneState === 'rain_shower' ? '#475569' : '#FFFFFF'}
                opacity={sceneState === 'rain_shower' ? 0.95 : 0.9}
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))"
              />
              {/* Left drifting cloud */}
              <path
                d="M 40 100 Q 52 85 70 87 Q 85 77 105 87 Q 120 85 128 100 Q 138 113 120 119 L 45 119 Q 30 113 40 100 Z"
                fill={isNight ? '#0E141B' : '#FFFFFF'}
                opacity={0.75}
              />
            </g>
          )}

          {/* WIND GUST STREAKS (Active in wind state or when tapped) */}
          {(sceneState === 'wind_picking_up' || isTurbineBoosted) && (
            <g stroke={isNight ? '#38BDF8' : '#FFFFFF'} strokeWidth="2" strokeLinecap="round" opacity="0.7" className="animate-pulse">
              <path d="M 60 85 Q 140 80 190 90" fill="none" strokeDasharray="30 10" />
              <path d="M 120 110 Q 210 105 270 115" fill="none" strokeDasharray="40 12" />
              <path d="M 80 140 Q 160 135 230 145" fill="none" strokeDasharray="25 8" />
            </g>
          )}

          {/* RAIN DROPS (Active in rain/storm state) */}
          {(sceneState === 'rain_shower' || sceneState === 'storm') && (
            <g>
              {raindrops.map(drop => (
                <line
                  key={drop.id}
                  x1={drop.x}
                  y1={drop.y}
                  x2={drop.x - 7}
                  y2={drop.y + 16}
                  stroke={isNight ? '#38BDF8' : '#94A3B8'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              ))}
            </g>
          )}

          {/* LIGHTNING FLASH (In Storm state) */}
          {sceneState === 'storm' && (
            <g className="animate-lightning">
              <polygon
                points="280,50 268,105 288,105 264,155 298,95 280,95"
                fill="#FEF08A"
                filter="drop-shadow(0 0 16px rgba(254, 240, 138, 1))"
              />
            </g>
          )}

          {/* ROLLING HILLS (Background) */}
          <path
            d="M -20 215 Q 80 160 210 190 Q 320 215 420 175 L 420 320 L -20 320 Z"
            fill={skyConfig.hill1}
            stroke={isNight ? '#38BDF8' : 'none'}
            strokeWidth={isNight ? '0.75' : '0'}
            strokeOpacity={isNight ? '0.2' : '0'}
            opacity="0.95"
          />

          {/* Near hill */}
          <path
            d="M -10 235 Q 110 200 240 220 Q 340 235 420 215 L 420 320 L -10 320 Z"
            fill={skyConfig.hill2}
            stroke={isNight ? '#38BDF8' : 'none'}
            strokeWidth={isNight ? '0.75' : '0'}
            strokeOpacity={isNight ? '0.25' : '0'}
          />

          {/* WIND TURBINE (Interactive tap boosts speed) */}
          <g transform="translate(65, 170)" className="cursor-pointer group" onClick={handleTurbineClick}>
            <polygon points="8,0 12,0 14,45 6,45" fill={isNight ? '#1E293B' : '#E2E8F0'} />
            <circle cx="10" cy="0" r="3.5" fill={isNight ? '#475569' : '#FFFFFF'} />
            <g style={{ transformOrigin: '10px 0px', animation: `spin ${turbineSpeed} linear infinite` }}>
              <line x1="10" y1="0" x2="10" y2="-24" stroke={isNight ? '#CBD5E1' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="10" y1="0" x2="31" y2="12" stroke={isNight ? '#CBD5E1' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="10" y1="0" x2="-11" y2="12" stroke={isNight ? '#CBD5E1' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>

          {/* RED BARN & SILO */}
          <g transform="translate(250, 145)">
            {/* Silo */}
            <g transform="translate(82, 10)">
              <path d="M 0 15 A 12 12 0 0 1 24 15 Z" fill={isNight ? '#0F172A' : '#CBD5E1'} />
              <rect x="0" y="15" width="24" height="42" fill={isNight ? '#080E18' : '#E2E8F0'} />
              <line x1="0" y1="25" x2="24" y2="25" stroke={isNight ? '#1E293B' : '#CBD5E1'} strokeWidth="1" />
              <line x1="0" y1="38" x2="24" y2="38" stroke={isNight ? '#1E293B' : '#CBD5E1'} strokeWidth="1" />
              <line x1="0" y1="50" x2="24" y2="50" stroke={isNight ? '#1E293B' : '#CBD5E1'} strokeWidth="1" />
            </g>

            {/* Barn */}
            <polygon
              points="10,25 46,2 82,25 82,65 10,65"
              fill={isNight ? 'url(#barnWoodOLED)' : 'url(#barnWoodLight)'}
              stroke={isNight ? '#1A0505' : '#8B1818'}
              strokeWidth="1.5"
            />
            {/* Roof Eaves */}
            <polyline
              points="6,26 46,1 86,26"
              fill="none"
              stroke={isNight ? '#38BDF8' : '#FFFFFF'}
              strokeWidth={isNight ? '2.5' : '4'}
              strokeOpacity={isNight ? '0.4' : '1'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon points="7,25 46,2 85,25 82,27 46,5 10,27" fill={isNight ? '#05080E' : '#450A0A'} />

            {/* Vane */}
            <line x1="46" y1="1" x2="46" y2="-8" stroke={isNight ? '#475569' : '#334155'} strokeWidth="1.5" />
            <polygon points="43,-8 49,-8 46,-12" fill={isNight ? '#38BDF8' : '#F59E0B'} />

            {/* Illuminated Loft Window (Interactive toggle on tap) */}
            <rect
              x="38"
              y="16"
              width="16"
              height="16"
              rx="2"
              fill={isNight ? (isLoftWindowLit ? '#F59E0B' : '#1A1208') : '#FFFFFF'}
              stroke={isNight ? '#D97706' : '#7F1D1D'}
              strokeWidth="1.5"
              filter={isNight && isLoftWindowLit ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.95))' : undefined}
              className="cursor-pointer"
              onClick={() => setIsLoftWindowLit(prev => !prev)}
            />
            <line x1="46" y1="16" x2="46" y2="32" stroke={isNight ? '#78350F' : '#7F1D1D'} strokeWidth="1" />
            <line x1="38" y1="24" x2="54" y2="24" stroke={isNight ? '#78350F' : '#7F1D1D'} strokeWidth="1" />

            {/* Doors */}
            <rect
              x="28"
              y="38"
              width="36"
              height="27"
              fill={isNight ? '#150505' : '#781515'}
              stroke={isNight ? '#334155' : '#FFFFFF'}
              strokeWidth="1.5"
            />
            <line x1="46" y1="38" x2="46" y2="65" stroke={isNight ? '#334155' : '#FFFFFF'} strokeWidth="1.5" />
          </g>

          {/* FOREGROUND PERSPECTIVE FIELD */}
          <polygon
            points="140,225 250,225 420,320 110,320"
            fill="url(#soilGrad)"
          />

          {/* Perspective Rows */}
          {[
            { x1: 155, x2: 140 },
            { x1: 175, x2: 195 },
            { x1: 195, x2: 250 },
            { x1: 215, x2: 305 },
            { x1: 235, x2: 365 },
          ].map((row, idx) => (
            <g key={idx}>
              <line
                x1={row.x1}
                y1="225"
                x2={row.x2}
                y2="320"
                stroke={isNight ? '#000000' : '#3D2D1E'}
                strokeWidth="2.5"
                strokeDasharray="4 6"
              />
              <circle cx={(row.x1 + row.x2) * 0.45} cy="250" r="2" fill={isNight ? '#22C55E' : '#4ADE80'} />
              <circle cx={(row.x1 + row.x2) * 0.5} cy="275" r="3" fill={isNight ? '#16A34A' : '#22C55E'} />
              <circle cx={(row.x1 + row.x2) * 0.55} cy="305" r="4.2" fill={isNight ? '#15803D' : '#16A34A'} />
            </g>
          ))}

          {/* GRAZING PASTURE & COWS */}
          <g transform="translate(30, 225)">
            <line x1="0" y1="12" x2="110" y2="12" stroke={isNight ? '#1E1B18' : '#A07040'} strokeWidth="2" />
            <line x1="0" y1="20" x2="110" y2="20" stroke={isNight ? '#1E1B18' : '#A07040'} strokeWidth="2" />
            <line x1="15" y1="6" x2="15" y2="26" stroke={isNight ? '#1E1B18' : '#8A5D33'} strokeWidth="3" />
            <line x1="55" y1="6" x2="55" y2="26" stroke={isNight ? '#1E1B18' : '#8A5D33'} strokeWidth="3" />
            <line x1="95" y1="6" x2="95" y2="26" stroke={isNight ? '#1E1B18' : '#8A5D33'} strokeWidth="3" />

            {/* Cow 1 */}
            <g transform="translate(18, 14)">
              <line x1="4" y1="14" x2="4" y2="22" stroke="#000000" strokeWidth="2.2" />
              <line x1="9" y1="14" x2="9" y2="22" stroke="#000000" strokeWidth="2.2" />
              <line x1="20" y1="14" x2="20" y2="22" stroke="#000000" strokeWidth="2.2" />
              <line x1="25" y1="14" x2="25" y2="22" stroke="#000000" strokeWidth="2.2" />
              <ellipse cx="15" cy="12" rx="14" ry="9" fill={isNight ? '#E2E8F0' : '#FFFFFF'} stroke="#000000" strokeWidth="1" />
              <path d="M 8 7 Q 12 5 13 11 Q 9 14 7 11 Z" fill="#000000" />
              <path d="M 18 8 Q 23 7 24 13 Q 19 16 17 12 Z" fill="#000000" />
              <ellipse cx="2" cy="16" rx="5" ry="4" fill={isNight ? '#E2E8F0' : '#FFFFFF'} stroke="#000000" strokeWidth="1" />
              <ellipse cx="0" cy="18" rx="2.5" ry="2" fill="#F472B6" />
              <circle cx="2" cy="15" r="1" fill="#000000" />
            </g>
          </g>
        </svg>

        {/* OVERLAID WEATHER HERO TEXT */}
        <div className="absolute top-4 left-6 z-10 pointer-events-none">
          <div className="flex items-baseline space-x-2">
            <span 
              className={`text-5xl font-black tracking-tight ${
                isNight ? 'text-white' : 'text-stone-900'
              }`}
              style={{ textShadow: isNight ? '0 2px 20px rgba(0,0,0,1)' : '0 1px 4px rgba(255,255,255,0.85)' }}
            >
              {formatTemp(temperature)}
            </span>
            {tempMax !== undefined && tempMin !== undefined && (
              <span className={`text-xs font-bold ${isNight ? 'text-zinc-300' : 'text-stone-600'}`}>
                H:{formatTemp(tempMax)} L:{formatTemp(tempMin)}
              </span>
            )}
          </div>

          <p 
            className={`text-lg font-extrabold mt-0.5 tracking-tight ${
              isNight ? 'text-sky-300' : 'text-stone-800'
            }`}
          >
            {conditionTitle}
          </p>

          {apparentTemperature !== undefined && (
            <p className={`text-xs font-semibold mt-0.5 ${isNight ? 'text-zinc-400' : 'text-stone-600'}`}>
              Feels like {formatTemp(apparentTemperature)}
            </p>
          )}
        </div>

        {/* TOP RIGHT CONTROLS: Auto Weather Badge & Widget View Mode Toggle */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-1.5">
          {/* Automatic Weather Status Badge */}
          <button
            onClick={() => setShowSceneInfo(prev => !prev)}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-md ${
              isNight 
                ? 'bg-black/70 text-sky-300 border border-sky-400/30 hover:border-sky-400/60' 
                : 'bg-white/80 text-emerald-800 border border-emerald-500/20 shadow-xs'
            }`}
            title="Weather Scene automatically updates based on live telemetry"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            Auto Scene
          </button>

          {/* Quick Widget Mode Switcher */}
          <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-0.5 border border-white/15">
            <button
              onClick={() => setWidgetMode(widgetMode === 'hero' ? 'compact' : widgetMode === 'compact' ? 'capsule' : 'hero')}
              className="p-1 rounded-full text-white/80 hover:text-white transition-all"
              title={`Switch Widget Layout (Current: ${widgetMode})`}
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>

        {/* EXPLANATORY POPUP ON TAP: How Auto Weather Scene is mapped */}
        {showSceneInfo && (
          <div 
            onClick={() => setShowSceneInfo(false)}
            className="absolute inset-x-4 bottom-4 p-3 rounded-2xl bg-black/90 backdrop-blur-lg border border-white/20 text-white z-20 shadow-2xl animate-card-slide-fade text-xs select-text cursor-pointer"
          >
            <div className="flex items-center justify-between font-bold text-sky-400 mb-1">
              <span className="flex items-center space-x-1">
                <Sparkles size={13} />
                <span>Auto-Scene Telemetry Sync</span>
              </span>
              <span className="text-[10px] text-zinc-400">Tap to dismiss</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Scene State: <strong className="text-white capitalize">{sceneState.replace(/_/g, ' ')}</strong>. Automatically computed from live WMO weather codes, wind gusts, daylight elevation, and cloud canopy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
