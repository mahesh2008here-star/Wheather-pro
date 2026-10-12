import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Square, 
  Sparkles,
  AlertCircle,
  Info
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { ttsService, TTSOptions, unlockAudioHardware, TTSDiagnosticInfo } from '../services/ttsService';

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
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<TTSDiagnosticInfo | null>(null);

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
    setAudioError(null);
    unlockAudioHardware();

    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      setDiagnostics(ttsService.getDiagnostics());
      return;
    }

    const script = `Farm Weather briefing for ${location.name}. Currently ${formatTemp(metrics.temperature)}, ${metrics.conditionTitle}. ${briefing.summary} Agricultural note: ${briefing.fieldworkAdvice}`;

    const options: TTSOptions = {
      rate: 1.0,
      engine: 'auto',
      onStart: () => {
        setIsPlaying(true);
        setDiagnostics(ttsService.getDiagnostics());
      },
      onEnd: () => {
        setIsPlaying(false);
        setDiagnostics(ttsService.getDiagnostics());
      },
      onError: (errMsg) => {
        setIsPlaying(false);
        setAudioError(errMsg || 'Field audio playback unavailable.');
        setDiagnostics(ttsService.getDiagnostics());
      }
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

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                setDiagnostics(ttsService.getDiagnostics());
                setShowDiagnostics(!showDiagnostics);
              }}
              className="p-1.5 text-[#737873] hover:text-[#171717] rounded-full transition-colors cursor-pointer"
              title="Audio Engine Diagnostics"
              aria-label="Toggle Audio Engine Diagnostics"
            >
              <Info size={14} />
            </button>

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
        </div>

        {/* Audio Playing Indicator */}
        {isPlaying && (
          <div className="flex items-center space-x-2 my-2 py-1.5 px-3 rounded-xl bg-[#FFF0E4] text-[#FF7900] text-[11px] font-bold">
            <span className="flex space-x-0.5 items-end h-3">
              <span className="w-1 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
              <span className="w-1 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
              <span className="w-1 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.3s' }} />
            </span>
            <span>Broadcasting real-time field weather briefing ({ttsService.getActiveEngineName()})...</span>
          </div>
        )}

        {/* Audio Error Alert */}
        {audioError && (
          <div className="flex items-start space-x-2 my-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <span className="font-bold block text-amber-950">Audio Playback Note:</span>
              <span>{audioError}</span>
            </div>
          </div>
        )}

        {/* Diagnostics Box */}
        {showDiagnostics && diagnostics && (
          <div className="my-2 p-3 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] text-[11px] font-mono space-y-1 text-[#171717] animate-fade-in">
            <div className="flex justify-between border-b border-[#E9E7E1] pb-1 font-bold">
              <span>Engine:</span>
              <span className="text-[#FF7900]">{diagnostics.activeEngine}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span>{diagnostics.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Audio Context:</span>
              <span>{diagnostics.audioContextState}</span>
            </div>
            <div className="flex justify-between">
              <span>Chunks:</span>
              <span>{diagnostics.currentChunk} / {diagnostics.totalChunks}</span>
            </div>
            {diagnostics.lastError && (
              <div className="text-rose-600 font-bold pt-1">
                Error: {diagnostics.lastError}
              </div>
            )}
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
