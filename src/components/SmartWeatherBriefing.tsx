import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Square, 
  Sparkles,
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { ttsService, TTSOptions, unlockAudioHardware } from '../services/ttsService';

interface SmartWeatherBriefingProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
}

export const SmartWeatherBriefing: React.FC<SmartWeatherBriefingProps> = ({
  metrics,
  location,
}) => {
  const { formatTemp } = useTheme();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate] = useState<number>(1.0);

  // Generate dynamic agricultural weather briefing text based on real metrics
  const briefing = React.useMemo(() => {
    let summary = '';
    let fieldworkAdvice = '';
    let badgeText = 'Normal Operations';

    if (metrics.precipitationRate > 0 || metrics.rainChance > 50) {
      summary = `Active precipitation forecasted across ${location.name}. Rain probability is ${metrics.rainChance}% with elevated surface moisture.`;
      fieldworkAdvice = 'Delay heavy tractor transit to prevent soil compaction and rutting.';
      badgeText = 'Rain Conditions';
    } else if (metrics.temperature >= 30) {
      summary = `High thermal index reaching ${formatTemp(metrics.temperature)}. Evapotranspiration is accelerated with UV index at ${metrics.uvIndex}.`;
      fieldworkAdvice = 'Schedule irrigation cycles during early morning or evening hours.';
      badgeText = 'Heat Caution';
    } else if (metrics.temperature <= 4) {
      summary = `Cold temperatures holding near ${formatTemp(metrics.temperature)}. Ground frost hazard in low-lying crop zones.`;
      fieldworkAdvice = 'Inspect row covers and thermal blankets for sensitive plantings.';
      badgeText = 'Frost Alert';
    } else if (metrics.windSpeed >= 20) {
      summary = `Breezy conditions with surface winds at ${metrics.windSpeed} km/h and gusts to ${metrics.windGusts} km/h from ${metrics.windDirectionCardinal}.`;
      fieldworkAdvice = 'Halt foliar spraying due to high droplet drift risk.';
      badgeText = 'Gusty Winds';
    } else {
      summary = `${metrics.conditionTitle} with pleasant temperatures peaking near ${formatTemp(metrics.tempMaxToday)}. Relative humidity is steady at ${metrics.humidity}%.`;
      fieldworkAdvice = 'Favorable weather for field cultivation, planting, and harvesting.';
      badgeText = 'Optimal Field Day';
    }

    return { summary, fieldworkAdvice, badgeText };
  }, [metrics, location.name, formatTemp]);

  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    unlockAudioHardware();

    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      return;
    }

    const script = `Farm Weather briefing for ${location.name}. Currently ${formatTemp(metrics.temperature)}, ${metrics.conditionTitle}. ${briefing.summary} Agricultural note: ${briefing.fieldworkAdvice}`;

    const options: TTSOptions = {
      rate: speechRate,
      engine: 'auto',
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    };

    ttsService.speak(script, options);
  };

  return (
    <div className="w-full px-4 py-2 select-none">
      <div className="w-full p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#FFF0E4] text-[#FF7900]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-tight uppercase text-[#171717]">
                Field Audio Briefing
              </h3>
            </div>
          </div>

          <button
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Stop audio briefing' : 'Play audio briefing'}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer snappy-touch ${
              isPlaying
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-[#FFF0E4] hover:bg-[#FFE3D0] text-[#FF7900] border border-[#FFE1CB]'
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={12} className="fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Playing Indicator */}
        {isPlaying && (
          <div className="flex items-center space-x-2 my-2 py-1 px-2.5 rounded-xl bg-[#FFF0E4] text-[#FF7900] text-[11px] font-bold">
            <span className="flex space-x-0.5 items-end h-3">
              <span className="w-1 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
              <span className="w-1 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
              <span className="w-1 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.3s' }} />
            </span>
            <span>Broadcasting real-time field weather briefing...</span>
          </div>
        )}

        <p className="text-xs leading-relaxed my-2 font-medium text-[#737873]">
          {briefing.summary}
        </p>

        <div className="p-2.5 rounded-2xl border border-[#E9E7E1] bg-[#F7F6F2] text-[11px] font-semibold flex items-start space-x-2">
          <span className="text-[#FF7900] font-black shrink-0">Field Note:</span>
          <span className="text-[#171717]">{briefing.fieldworkAdvice}</span>
        </div>
      </div>
    </div>
  );
};
