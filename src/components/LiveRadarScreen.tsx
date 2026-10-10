import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Plus, 
  Minus, 
  Wind, 
  Thermometer, 
  CloudRain, 
  Cloud 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LocationInfo } from '../types/weather';

interface LiveRadarScreenProps {
  location: LocationInfo;
}

export const LiveRadarScreen: React.FC<LiveRadarScreenProps> = ({ location }) => {
  const { isDarkMode } = useTheme();
  const [activeLayer, setActiveLayer] = useState<'radar' | 'temp' | 'wind' | 'satellite'>('radar');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [frameIndex, setFrameIndex] = useState<number>(3);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Time loop animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % 6);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const timeFrames = ['-90m', '-60m', '-30m', 'Live Now', '+30m', '+60m'];

  return (
    <div className={`w-full min-h-full pb-24 transition-colors ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#F8F6F0] text-stone-900'
    }`}>
      {/* HEADER */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center space-x-2">
              <Radar className="text-sky-500 animate-spin" size={24} style={{ animationDuration: '6s' }} />
              <span>Weather Radar</span>
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
              High-resolution Doppler & satellite telemetry • {location.name}
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ● Live Stream
          </span>
        </div>

        {/* LAYER SELECTOR PILLS */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
          {[
            { id: 'radar' as const, label: 'Precipitation', icon: CloudRain, color: 'text-sky-400' },
            { id: 'wind' as const, label: 'Wind Streams', icon: Wind, color: 'text-emerald-400' },
            { id: 'temp' as const, label: 'Temperature', icon: Thermometer, color: 'text-amber-400' },
            { id: 'satellite' as const, label: 'Clouds & IR', icon: Cloud, color: 'text-zinc-300' },
          ].map(tab => {
            const isActive = activeLayer === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLayer(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? isDarkMode
                      ? 'bg-white text-black shadow-lg scale-[1.02]'
                      : 'bg-stone-900 text-white shadow-md scale-[1.02]'
                    : isDarkMode
                      ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                      : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-current' : tab.color} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE RADAR CANVAS / MAP */}
      <div className="px-4 py-2">
        <div 
          className={`relative w-full h-[380px] rounded-3xl overflow-hidden border transition-all ${
            isDarkMode ? 'bg-[#000000] border-white/15 shadow-2xl' : 'bg-[#EAE4DC] border-stone-300 shadow-md'
          }`}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Radar Topography & Geographical Grid Lines */}
          <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 400 380">
            <defs>
              {/* Radar sweep beam gradient */}
              <radialGradient id="radarSweepGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#0284C7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>

              {/* Rain storm cells gradient */}
              <radialGradient id="stormCell1" cx="40%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#10B981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="stormCell2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Geographical Distance Rings (25km, 50km, 75km) */}
            <circle cx="200" cy="190" r="60" fill="none" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="200" cy="190" r="120" fill="none" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="200" cy="190" r="170" fill="none" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="1" />

            {/* Crosshairs */}
            <line x1="200" y1="20" x2="200" y2="360" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="1" />
            <line x1="30" y1="190" x2="370" y2="190" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth="1" />

            {/* DYNAMIC ACTIVE RADAR LAYER */}
            {activeLayer === 'radar' && (
              <g className="transition-all duration-700">
                {/* Simulated Doppler Precipitation Cells moving over time frames */}
                <ellipse 
                  cx={160 + frameIndex * 14} 
                  cy={150 - frameIndex * 6} 
                  rx={65 + (frameIndex % 3) * 5} 
                  ry={45} 
                  fill="url(#stormCell1)" 
                  transform={`rotate(-20 ${160 + frameIndex * 14} ${150 - frameIndex * 6})`}
                  filter="blur(4px)"
                />
                <ellipse 
                  cx={260 + frameIndex * 10} 
                  cy={220 - frameIndex * 8} 
                  rx={85} 
                  ry={55} 
                  fill="url(#stormCell2)" 
                  transform={`rotate(15 ${260 + frameIndex * 10} ${220 - frameIndex * 8})`}
                  filter="blur(5px)"
                />
              </g>
            )}

            {/* TEMPERATURE HEATMAP LAYER */}
            {activeLayer === 'temp' && (
              <g className="transition-all duration-700">
                <circle cx="150" cy="140" r="110" fill="#EF4444" opacity="0.35" filter="blur(20px)" />
                <circle cx="270" cy="230" r="130" fill="#F59E0B" opacity="0.3" filter="blur(25px)" />
                <circle cx="90" cy="280" r="90" fill="#38BDF8" opacity="0.3" filter="blur(20px)" />
                <text x="140" y="140" fill="#FFF" fontSize="13" fontWeight="bold">28°C</text>
                <text x="260" y="230" fill="#FFF" fontSize="13" fontWeight="bold">24°C</text>
                <text x="90" y="270" fill="#FFF" fontSize="13" fontWeight="bold">19°C</text>
              </g>
            )}

            {/* WIND STREAMLINES LAYER */}
            {activeLayer === 'wind' && (
              <g stroke="#34D399" strokeWidth="2" strokeLinecap="round" opacity="0.8">
                {[
                  { d: "M 60,80 Q 140,70 240,90 T 360,110" },
                  { d: "M 40,140 Q 160,130 260,160 T 370,180" },
                  { d: "M 70,200 Q 180,190 280,230 T 380,240" },
                  { d: "M 50,270 Q 150,260 250,290 T 360,310" },
                ].map((stream, idx) => (
                  <path 
                    key={idx} 
                    d={stream.d} 
                    fill="none" 
                    strokeDasharray="16 8" 
                    className="animate-pulse"
                  />
                ))}
              </g>
            )}

            {/* SATELLITE & INFRARED CLOUD LAYER */}
            {activeLayer === 'satellite' && (
              <g fill="#FFFFFF" opacity="0.45" filter="blur(10px)">
                <ellipse cx="180" cy="120" rx="120" ry="60" />
                <ellipse cx="260" cy="200" rx="90" ry="70" />
              </g>
            )}

            {/* RADAR SWEEP LINE */}
            <line 
              x1="200" 
              y1="190" 
              x2="380" 
              y2="190" 
              stroke="#38BDF8" 
              strokeWidth="2" 
              className="animate-radar-sweep origin-[200px_190px]" 
              opacity="0.8"
            />

            {/* Pinpoint Location Marker */}
            <circle cx="200" cy="190" r="5" fill="#38BDF8" filter="drop-shadow(0 0 6px #38BDF8)" />
            <circle cx="200" cy="190" r="14" fill="none" stroke="#38BDF8" strokeWidth="1.5" className="animate-ping" />
          </svg>

          {/* Floating Map Zoom Controls */}
          <div className="absolute right-3 top-3 flex flex-col space-y-1.5 z-20">
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                isDarkMode ? 'bg-zinc-900/90 text-white border border-white/10' : 'bg-white text-stone-900 border border-stone-200'
              }`}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.15))}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                isDarkMode ? 'bg-zinc-900/90 text-white border border-white/10' : 'bg-white text-stone-900 border border-stone-200'
              }`}
            >
              <Minus size={16} />
            </button>
          </div>

          {/* Location Pin Badge */}
          <div className="absolute left-3 top-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold flex items-center space-x-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>{location.name}</span>
          </div>

          {/* Reflectivity Scale Legend at bottom */}
          <div className="absolute left-3 right-3 bottom-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-[10px] text-white">
            <span className="font-bold">Light (15 dBZ)</span>
            <div className="flex-1 mx-3 h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500 overflow-hidden" />
            <span className="font-bold text-rose-400">Severe (65 dBZ)</span>
          </div>
        </div>
      </div>

      {/* TIME SCRUBBER & ANIMATION CONTROLLER */}
      <div className="px-4 mt-2">
        <div 
          className={`p-3.5 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
            isDarkMode ? 'bg-[#0A0A0C] border border-white/10' : 'bg-white border border-stone-200'
          }`}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Time Scrubber Timeline */}
          <div className="flex-1 mx-3 flex items-center justify-between">
            {timeFrames.map((frame, idx) => {
              const isCurrent = frameIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setFrameIndex(idx)}
                  className={`flex flex-col items-center px-1 py-0.5 rounded-md transition-all ${
                    isCurrent 
                      ? 'text-sky-400 font-black scale-105' 
                      : isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mb-1 ${
                    isCurrent ? 'bg-sky-400' : isDarkMode ? 'bg-zinc-700' : 'bg-stone-300'
                  }`} />
                  <span className="text-[10px]">{frame}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setFrameIndex(3)}
            className={`p-2 rounded-xl transition-all ${
              isDarkMode ? 'text-zinc-400 hover:text-white bg-zinc-900' : 'text-stone-500 hover:text-stone-900 bg-stone-100'
            }`}
            title="Reset to Live"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
