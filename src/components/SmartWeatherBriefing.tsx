import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Shirt, 
  Sun, 
  Smile, 
  ShieldAlert,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface SmartWeatherBriefingProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
}

export const SmartWeatherBriefing: React.FC<SmartWeatherBriefingProps> = ({
  metrics,
  location,
}) => {
  const { isDarkMode, formatTemp } = useTheme();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

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

  // Audio Speech Synthesis Toggle
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const fullText = `Weather briefing for ${location.name}. Currently ${formatTemp(metrics.temperature)}, ${metrics.conditionTitle}. ${briefing.summary} Suggested outfit: ${briefing.outfit}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <span className={`text-xs font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              AI Weather Briefing
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${briefing.badgeColor}`}>
              {briefing.badgeText}
            </span>
          </div>

          {/* Audio speech button */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
              isPlayingAudio 
                ? 'bg-sky-500 text-white animate-pulse' 
                : isDarkMode 
                ? 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/10' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            title="Read Weather Briefing"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX size={12} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 size={12} />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>

        {/* AI Generated Briefing Text */}
        <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-zinc-300' : 'text-stone-700'}`}>
          {briefing.summary}
        </p>

        {/* Key Quick Insights Row */}
        <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5 text-zinc-400 truncate max-w-[210px]">
            <Shirt size={13} className="text-amber-400 shrink-0" />
            <span className="truncate">{briefing.outfit}</span>
          </div>

          <div className="flex items-center space-x-1 shrink-0 font-bold">
            <span className="text-[10px] text-zinc-500">Outdoor Score</span>
            <span className="text-emerald-400">{briefing.outdoorScore}/10</span>
          </div>
        </div>
      </div>
    </div>
  );
};
