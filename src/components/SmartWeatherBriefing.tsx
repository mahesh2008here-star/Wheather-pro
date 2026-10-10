import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Gauge, 
  Radio, 
  RefreshCw, 
  Info,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { ttsService, TTSOptions } from '../services/ttsService';

interface SmartWeatherBriefingProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
}

export const SmartWeatherBriefing: React.FC<SmartWeatherBriefingProps> = ({
  metrics,
  location,
}) => {
  const { isDarkMode, formatTemp } = useTheme();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number } | null>(null);
  const [activeEngine, setActiveEngine] = useState<string>('Universal HD Voice');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Generate dynamic intelligent AI briefing text based on real weather metrics
  const briefing = React.useMemo(() => {
    let summary = '';
    let outfit = '';
    let outdoorScore = 9;
    let badgeText = 'Favorable Conditions';
    let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

    if (metrics.precipitationRate > 0 || metrics.rainChance > 50) {
      summary = `Expect active showers throughout the area with precipitation probability near ${metrics.rainChance}%. Ground moisture is high with slippery roads.`;
      outfit = 'Waterproof shell jacket & umbrella strongly advised.';
      outdoorScore = 5.2;
      badgeText = 'Rainy Conditions';
      badgeColor = 'bg-sky-500/20 text-sky-400 border-sky-400/30';
    } else if (metrics.temperature >= 30) {
      summary = `Intense heat with temperatures reaching ${formatTemp(metrics.temperature)} (feels like ${formatTemp(metrics.apparentTemperature)}). UV Index is elevated at ${metrics.uvIndex}.`;
      outfit = 'Breathable lightweight cotton, sunhat & SPF 50+ protection.';
      outdoorScore = 6.4;
      badgeText = 'High Heat Caution';
      badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    } else if (metrics.temperature <= 5) {
      summary = `Cold crisp air holding at ${formatTemp(metrics.temperature)}. Wind chill will make it feel noticeably brisk in open corridors.`;
      outfit = 'Heavy thermal coat, scarf, and insulated gloves recommended.';
      outdoorScore = 6.0;
      badgeText = 'Cold Air Advisory';
      badgeColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    } else if (metrics.windSpeed >= 25) {
      summary = `Breezy conditions with surface winds at ${metrics.windSpeed} km/h and gusts to ${metrics.windGusts} km/h from ${metrics.windDirectionCardinal}.`;
      outfit = 'Windbreaker and secure headwear.';
      outdoorScore = 7.1;
      badgeText = 'Gusty Winds';
      badgeColor = 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    } else {
      summary = `${metrics.conditionTitle} with pleasant temperatures peaking near ${formatTemp(metrics.tempMaxToday)}. Humidity is comfortable at ${metrics.humidity}%.`;
      outfit = 'T-shirt or light layer, comfortable walking footwear.';
      outdoorScore = 9.4;
      badgeText = 'Ideal for Outdoors';
      badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }

    return { summary, outfit, outdoorScore, badgeText, badgeColor };
  }, [metrics, formatTemp]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const handleTogglePlay = (forcedEngine?: 'cloud' | 'native') => {
    setSpeechError(null);

    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      setCurrentProgress(null);
      return;
    }

    const rawText = `Weather briefing for ${location.name}. Currently ${formatTemp(metrics.temperature)}, ${metrics.conditionTitle}. ${briefing.summary} Suggested outfit: ${briefing.outfit}`;

    const options: TTSOptions = {
      rate: speechRate,
      engine: forcedEngine || 'auto',
      onStart: () => {
        setIsPlaying(true);
        setActiveEngine(ttsService.getActiveEngineName());
      },
      onEnd: () => {
        setIsPlaying(false);
        setCurrentProgress(null);
      },
      onProgress: (current, total) => {
        setCurrentProgress({ current, total });
        setActiveEngine(ttsService.getActiveEngineName());
      },
      onError: (msg) => {
        setSpeechError(msg);
        setIsPlaying(false);
        setCurrentProgress(null);
      }
    };

    ttsService.speak(rawText, options);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.2, 1.4];
    const nextIndex = (speeds.indexOf(speechRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setSpeechRate(newSpeed);

    // If currently playing, restart with new speed
    if (isPlaying) {
      ttsService.stop();
      setTimeout(() => handleTogglePlay(), 50);
    }
  };

  return (
    <div className="w-full px-4 pt-2.5 pb-1 select-none">
      <div 
        className={`p-3.5 rounded-2xl transition-all duration-300 border relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#000000] border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.9)]' 
            : 'bg-white border-stone-200/70 shadow-sm'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles size={14} className={isPlaying ? "animate-spin text-sky-400" : ""} style={{ animationDuration: '6s' }} />
            </div>
            <span className={`text-xs font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              AI Weather Briefing
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${briefing.badgeColor}`}>
              {briefing.badgeText}
            </span>
          </div>

          {/* Controls Cluster */}
          <div className="flex items-center space-x-1.5">
            {/* Speed Selector Button */}
            <button
              onClick={cycleSpeed}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
                isDarkMode 
                  ? 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/20' 
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Voice Speed Rate"
            >
              {speechRate.toFixed(1)}x
            </button>

            {/* Play/Stop Main Voice Button */}
            <button
              onClick={() => handleTogglePlay()}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                isPlaying 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                  : isDarkMode 
                  ? 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20' 
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
              title="Read Weather Briefing"
            >
              {isPlaying ? (
                <>
                  <Square size={11} className="fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 size={13} className="text-sky-400" />
                  <span>Play Voice</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Speech Playing Sound Equalizer Waves */}
        {isPlaying && (
          <div className="flex items-center justify-between px-3 py-1.5 mb-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center space-x-2">
              {/* Sound Wave Animation Bars */}
              <div className="flex items-end space-x-0.5 h-3">
                <span className="w-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }}></span>
                <span className="w-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }}></span>
                <span className="w-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDuration: '0.3s' }}></span>
                <span className="w-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDuration: '0.5s' }}></span>
              </div>
              <span className="text-[10px] font-extrabold text-sky-400 tracking-wide">
                Broadcasting Briefing ({activeEngine})
              </span>
            </div>

            {currentProgress && (
              <span className="text-[10px] font-bold text-sky-300">
                Part {currentProgress.current} / {currentProgress.total}
              </span>
            )}
          </div>
        )}

        {/* Briefing Text Summary */}
        <p className={`text-xs leading-relaxed mb-2 font-medium ${isDarkMode ? 'text-zinc-300' : 'text-stone-700'}`}>
          {briefing.summary}
        </p>

        {/* Outfit Recommendation Banner */}
        <div className={`flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold border ${
          isDarkMode 
            ? 'bg-zinc-900/60 border-white/10 text-zinc-300' 
            : 'bg-stone-50 border-stone-200/80 text-stone-700'
        }`}>
          <div className="flex items-center space-x-1.5">
            <span className="text-sky-400 font-bold">Recommended Gear:</span>
            <span className="truncate">{briefing.outfit}</span>
          </div>

          {/* Outdoor Activity Suitability Rating */}
          <div className="flex items-center space-x-1 pl-2 border-l border-white/10 shrink-0">
            <span className="text-[10px] opacity-70">Outdoor Score:</span>
            <span className="font-extrabold text-sky-400">{briefing.outdoorScore}</span>
            <span className="text-[9px] opacity-50">/10</span>
          </div>
        </div>

        {/* App Voice Compatibility Engine Footer */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px]">
          <div className="flex items-center space-x-1 text-zinc-500">
            <Cpu size={10} className="text-sky-400/80" />
            <span>Universal Audio Stream + WebSpeech Supported</span>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleTogglePlay('cloud')}
              className="text-sky-400 hover:underline font-bold"
              title="Force HD Audio Stream Mode"
            >
              HD Stream
            </button>
            <span className="text-zinc-600">|</span>
            <button 
              onClick={() => handleTogglePlay('native')}
              className="text-zinc-400 hover:text-zinc-200 font-bold"
              title="Force System Device TTS Engine"
            >
              System Voice
            </button>
          </div>
        </div>

        {/* Error notification banner */}
        {speechError && (
          <div className="mt-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] flex items-center justify-between">
            <span>{speechError}</span>
            <button 
              onClick={() => handleTogglePlay('cloud')}
              className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[9px]"
            >
              Retry Cloud Audio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
