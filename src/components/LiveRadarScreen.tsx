import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Wind, 
  Thermometer, 
  CloudRain, 
  Cloud,
  MapPin,
  Info
} from 'lucide-react';
import { LocationInfo } from '../types/weather';

interface LiveRadarScreenProps {
  location: LocationInfo;
}

export const LiveRadarScreen: React.FC<LiveRadarScreenProps> = ({ location }) => {
  const [activeLayer, setActiveLayer] = useState<'radar' | 'temp' | 'wind' | 'satellite'>('radar');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [frameIndex, setFrameIndex] = useState<number>(3);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Time loop animation for live Doppler sweep
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % 6);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const timeFrames = ['-90m', '-60m', '-30m', 'Live', '+30m', '+60m'];

  return (
    <div className="w-full px-4 pt-3 pb-36 sm:pb-40 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center space-x-2 text-[#171717]">
              <Radar className="text-[#FF7900]" size={22} />
              <span>Precipitation Radar</span>
            </h1>
            <p className="text-xs mt-0.5 font-medium text-[#737873]">
              Doppler echo & satellite telemetry • {location.name}
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E5F5EC] text-[#10B981] border border-[#CEEFDB]">
            ● Live Stream
          </span>
        </div>

        {/* LAYER SELECTOR PILLS */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
          {[
            { id: 'radar' as const, label: 'Precipitation', icon: CloudRain },
            { id: 'wind' as const, label: 'Wind Streams', icon: Wind },
            { id: 'temp' as const, label: 'Temperature', icon: Thermometer },
            { id: 'satellite' as const, label: 'Cloud & IR', icon: Cloud },
          ].map(tab => {
            const isActive = activeLayer === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLayer(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer snappy-touch ${
                  isActive
                    ? 'bg-[#FFF0E4] text-[#FF7900] border border-[#FFE1CB] shadow-xs'
                    : 'bg-white text-[#737873] hover:text-[#171717] border border-[#E9E7E1]'
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAP CANVAS CARD */}
      <div className="mb-3.5">
        <div className="relative w-full h-[370px] rounded-[28px] overflow-hidden border border-[#E9E7E1] bg-[#E9EFE7] shadow-xs">
          {/* Topography & Geographical Grid Lines */}
          <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 400 370">
            <g style={{ transform: `scale(${zoomLevel})`, transformOrigin: '200px 185px', transition: 'transform 0.3s ease' }}>
              <defs>
                <radialGradient id="stormCell1" cx="40%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
                  <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.75" />
                  <stop offset="70%" stopColor="#10B981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="stormCell2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.85" />
                  <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.7" />
                  <stop offset="80%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Geographical Range Rings */}
              <circle cx="200" cy="185" r="55" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="200" cy="185" r="110" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="200" cy="185" r="160" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

              {/* Crosshairs */}
              <line x1="200" y1="20" x2="200" y2="350" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
              <line x1="30" y1="185" x2="370" y2="185" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />

              {/* ACTIVE LAYER: PRECIPITATION RADAR */}
              {activeLayer === 'radar' && (
                <g className="transition-all duration-700">
                  <ellipse 
                    cx={160 + frameIndex * 12} 
                    cy={150 - frameIndex * 5} 
                    rx={65 + (frameIndex % 3) * 5} 
                    ry={45} 
                    fill="url(#stormCell1)" 
                    transform={`rotate(-20 ${160 + frameIndex * 12} ${150 - frameIndex * 5})`}
                    filter="blur(4px)"
                  />
                  <ellipse 
                    cx={250 + frameIndex * 8} 
                    cy={210 - frameIndex * 6} 
                    rx={80} 
                    ry={50} 
                    fill="url(#stormCell2)" 
                    transform={`rotate(15 ${250 + frameIndex * 8} ${210 - frameIndex * 6})`}
                    filter="blur(5px)"
                  />
                </g>
              )}

              {/* ACTIVE LAYER: TEMPERATURE HEATMAP */}
              {activeLayer === 'temp' && (
                <g className="transition-all duration-700">
                  <circle cx="150" cy="140" r="100" fill="#EF4444" opacity="0.35" filter="blur(20px)" />
                  <circle cx="270" cy="220" r="120" fill="#F59E0B" opacity="0.3" filter="blur(25px)" />
                  <circle cx="90" cy="270" r="80" fill="#38BDF8" opacity="0.3" filter="blur(20px)" />
                  <text x="140" y="140" fill="#171717" fontSize="12" fontWeight="bold">26°C</text>
                  <text x="260" y="220" fill="#171717" fontSize="12" fontWeight="bold">23°C</text>
                  <text x="90" y="260" fill="#171717" fontSize="12" fontWeight="bold">18°C</text>
                </g>
              )}

              {/* ACTIVE LAYER: WIND STREAMLINES */}
              {activeLayer === 'wind' && (
                <g stroke="#10B981" strokeWidth="2" strokeLinecap="round" opacity="0.8">
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
                      strokeDasharray="14 7" 
                      className="animate-pulse"
                    />
                  ))}
                </g>
              )}

              {/* ACTIVE LAYER: SATELLITE CLOUD */}
              {activeLayer === 'satellite' && (
                <g fill="#FFFFFF" opacity="0.6" filter="blur(12px)">
                  <ellipse cx="180" cy="120" rx="120" ry="60" />
                  <ellipse cx="260" cy="200" rx="90" ry="70" />
                </g>
              )}

              {/* Pinpoint Location Marker */}
              <circle cx="200" cy="185" r="5" fill="#FF7900" />
              <circle cx="200" cy="185" r="14" fill="none" stroke="#FF7900" strokeWidth="1.5" className="animate-ping" />
            </g>
          </svg>

          {/* Floating Map Zoom Controls */}
          <div className="absolute right-3 top-3 flex flex-col space-y-1.5 z-20">
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs bg-white text-[#171717] border border-[#E9E7E1] cursor-pointer snappy-touch"
              title="Zoom In"
            >
              <Plus size={15} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.15))}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs bg-white text-[#171717] border border-[#E9E7E1] cursor-pointer snappy-touch"
              title="Zoom Out"
            >
              <Minus size={15} />
            </button>
          </div>

          {/* Location Badge */}
          <div className="absolute left-3 top-3 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-[#E9E7E1] text-[#171717] text-[11px] font-bold flex items-center space-x-1.5 shadow-xs">
            <MapPin size={12} className="text-[#FF7900]" />
            <span>{location.name}</span>
          </div>

          {/* Reflectivity Scale Legend */}
          <div className="absolute left-3 right-3 bottom-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-[#E9E7E1] flex items-center justify-between text-[10px] text-[#171717]">
            <span className="font-bold">Light (15 dBZ)</span>
            <div className="flex-1 mx-3 h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500 overflow-hidden" />
            <span className="font-bold text-rose-500">Severe (65 dBZ)</span>
          </div>
        </div>
      </div>

      {/* TIME SCRUBBER & PLAYBACK CONTROLLER */}
      <div className="p-3 rounded-[24px] flex items-center justify-between border border-[#E9E7E1] bg-white shadow-xs mb-3.5">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause radar loop' : 'Play radar loop'}
          className="w-8 h-8 rounded-xl bg-[#FFF0E4] text-[#FF7900] border border-[#FFE1CB] flex items-center justify-center shadow-xs cursor-pointer snappy-touch"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        {/* Time Scrubber Timeline */}
        <div className="flex-1 mx-3 flex items-center justify-between">
          {timeFrames.map((frame, idx) => {
            const isCurrent = frameIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setFrameIndex(idx)}
                className={`flex flex-col items-center px-1 py-0.5 rounded-md transition-all cursor-pointer ${
                  isCurrent 
                    ? 'text-[#FF7900] font-black' 
                    : 'text-[#737873] hover:text-[#171717]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                  isCurrent ? 'bg-[#FF7900]' : 'bg-[#E9E7E1]'
                }`} />
                <span className="text-[10px] font-mono-numbers">{frame}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setFrameIndex(3)}
          className="p-1.5 rounded-xl transition-all cursor-pointer snappy-touch text-[#737873] hover:text-[#171717] bg-[#F7F6F2] border border-[#E9E7E1]"
          title="Reset to Live"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Field Note */}
      <div className="p-3 rounded-2xl border border-[#E9E7E1] bg-white text-xs flex items-start space-x-2 text-[#737873]">
        <Info size={14} className="text-[#FF7900] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Echoes exceeding <strong>35 dBZ (amber/red)</strong> indicate precipitation rates over 4 mm/h. Delay foliar spraying during active rain sweeps.
        </p>
      </div>
    </div>
  );
};
