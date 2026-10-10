import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Shirt, 
  Sun, 
  Smile, 
  ShieldAlert,
  Zap,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface SmartWeatherBriefingProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
}

// Clean up text for natural vocal pronunciation on TTS engines
const sanitizeForSpeech = (text: string): string => {
  return text
    .replace(/(\d+)\s*°C/g, '$1 degrees Celsius')
    .replace(/(\d+)\s*°F/g, '$1 degrees Fahrenheit')
    .replace(/(\d+)\s*°/g, '$1 degrees')
    .replace(/(\d+)\s*%/g, '$1 percent')
    .replace(/(\d+)\s*km\/h/g, '$1 kilometers per hour')
    .replace(/(\d+)\s*mph/g, '$1 miles per hour')
    .replace(/UV Index is elevated at (\d+)/gi, 'U V Index is elevated at $1')
    .replace(/SPF 50\+/gi, 'S P F 50 plus')
    .replace(/AI/g, 'A I');
};

// Split text into chunks under 140 chars for mobile speech synthesis compatibility
const chunkText = (text: string, maxLen = 140): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLen) {
      currentChunk += sentence + ' ';
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks.length > 0 ? chunks : [text];
};

export const SmartWeatherBriefing: React.FC<SmartWeatherBriefingProps> = ({
  metrics,
  location,
}) => {
  const { isDarkMode, formatTemp } = useTheme();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Stop all active audio / speech synthesis instances
  const stopAllAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error cancelling speechSynthesis', e);
      }
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      } catch (e) {
        console.warn('Error stopping HTML5 audio', e);
      }
    }
    setIsPlayingAudio(false);
  };

  // HTML5 Web Audio TTS Fallback for Mobile WebView / Android App
  const playHtml5AudioChunks = (chunks: string[], index = 0) => {
    if (index >= chunks.length) {
      setIsPlayingAudio(false);
      return;
    }

    const cleanChunk = chunks[index];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(cleanChunk)}`;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      playHtml5AudioChunks(chunks, index + 1);
    };

    audio.onerror = () => {
      // If error occurs, try next chunk or stop
      playHtml5AudioChunks(chunks, index + 1);
    };

    audio.play().catch(() => {
      // Browsers or WebViews requiring user gesture fallback gracefully
      setIsPlayingAudio(false);
    });
  };

  // Smart Speech Audio Briefing Controller
  const toggleSpeech = () => {
    if (isPlayingAudio) {
      stopAllAudio();
      return;
    }

    const rawText = `Weather briefing for ${location.name}. Currently ${formatTemp(metrics.temperature)}, ${metrics.conditionTitle}. ${briefing.summary} Suggested outfit: ${briefing.outfit}`;
    const speechText = sanitizeForSpeech(rawText);
    const chunks = chunkText(speechText);

    setIsPlayingAudio(true);

    // Detect if running inside Capacitor Android native app / Webview or desktop browser
    const isMobileApp = typeof window !== 'undefined' && (
      !!(window as any).Capacitor || 
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      navigator.userAgent.includes('wv')
    );

    // If WebSpeech is missing or on Android Native App (where SpeechSynthesis is often disabled in webview), use HTML5 Audio
    if (!('speechSynthesis' in window) || isMobileApp) {
      playHtml5AudioChunks(chunks);
      return;
    }

    // Standard Desktop / Browser SpeechSynthesis with fallback
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      let currentChunkIndex = 0;

      const speakNextChunk = () => {
        if (currentChunkIndex >= chunks.length) {
          setIsPlayingAudio(false);
          return;
        }

        const chunk = chunks[currentChunkIndex];
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Pick preferred English voice if available
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const pref = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen'))) || voices.find(v => v.lang.startsWith('en'));
          if (pref) utterance.voice = pref;
        }

        utterance.onend = () => {
          currentChunkIndex++;
          speakNextChunk();
        };

        utterance.onerror = (err) => {
          console.warn('SpeechSynthesis error, switching to HTML5 Audio fallback', err);
          playHtml5AudioChunks(chunks, currentChunkIndex);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    } catch (err) {
      console.warn('Speech synthesis exception, executing HTML5 Audio fallback', err);
      playHtml5AudioChunks(chunks);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
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
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              isPlayingAudio 
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                : isDarkMode 
                ? 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
            title="Read Weather Briefing"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX size={12} className="animate-pulse" />
                <span>Stop</span>
                {/* Visualizer bars animation */}
                <div className="flex items-end space-x-0.5 h-2.5 ml-0.5">
                  <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-2/3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
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
