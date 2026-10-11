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
  MapPin
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
  const { formatTemp } = useTheme();

  // Dynamic icon mapping based on weather code and daytime
  const getWeatherIcon = () => {
    if (weatherCode === 0 || weatherCode === 1) {
      return isDaytime 
        ? <Sun size={36} className="text-[#FF7900] shrink-0" strokeWidth={2.2} />
        : <Moon size={34} className="text-[#F59E0B] shrink-0" strokeWidth={2.2} />;
    }
    if (weatherCode === 2) {
      return <CloudSun size={36} className="text-[#FF7900] shrink-0" strokeWidth={2.2} />;
    }
    if (weatherCode === 3) {
      return <Cloud size={36} className="text-[#737873] shrink-0" strokeWidth={2.2} />;
    }
    if ([45, 48].includes(weatherCode)) {
      return <CloudFog size={36} className="text-[#737873] shrink-0" strokeWidth={2.2} />;
    }
    if ([51, 53, 55, 56, 57].includes(weatherCode)) {
      return <CloudDrizzle size={36} className="text-[#0284C7] shrink-0" strokeWidth={2.2} />;
    }
    if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      return <CloudRain size={36} className="text-[#0284C7] shrink-0" strokeWidth={2.2} />;
    }
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      return <Snowflake size={36} className="text-[#38BDF8] shrink-0" strokeWidth={2.2} />;
    }
    if ([95, 96, 99].includes(weatherCode)) {
      return <CloudLightning size={36} className="text-[#FF7900] shrink-0" strokeWidth={2.2} />;
    }
    return <CloudSun size={36} className="text-[#FF7900] shrink-0" strokeWidth={2.2} />;
  };

  // Concise weather summary based on actual meteorological data
  const conditionSummary = React.useMemo(() => {
    if (rainChance > 40) {
      return `Elevated rain probability (${rainChance}%). Surface moisture increasing across field rows.`;
    }
    if (windSpeed >= 22) {
      return `Moderate surface winds at ${windSpeed} km/h ${windDirectionCardinal}. Higher drift risk for spraying.`;
    }
    if (temperature >= 30) {
      return `High thermal index today. Canopy evapotranspiration elevated; monitor crop hydration.`;
    }
    if (temperature <= 4) {
      return `Chilly conditions near freezing. Inspect vulnerable tender seedlings for ground frost.`;
    }
    return `Mild, steady atmospheric conditions favorable for scheduled fieldwork and cultivation.`;
  }, [rainChance, windSpeed, windDirectionCardinal, temperature]);

  return (
    <div className="w-full px-4 pt-3 pb-2 select-none">
      <div className="w-full rounded-[28px] p-5 bg-white border border-[#E9E7E1] shadow-xs transition-all">
        {/* Top Kicker: Condition & Timestamp */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-[#FFF0E4]">
              {getWeatherIcon()}
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-[#171717] leading-tight">
                {conditionTitle}
              </h2>
              {apparentTemperature !== undefined && (
                <span className="text-xs font-semibold text-[#737873]">
                  Feels like {formatTemp(apparentTemperature)}
                </span>
              )}
            </div>
          </div>

          {lastUpdated && (
            <div className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F7F6F2] text-[#737873] border border-[#E9E7E1]">
              <Clock size={11} />
              <span>{lastUpdated}</span>
            </div>
          )}
        </div>

        {/* Hero Temperature & High/Low Display */}
        <div className="flex items-baseline justify-between my-2 pt-1">
          <div className="flex items-baseline">
            <span className="hero-temperature text-7xl sm:text-8xl font-black text-[#171717] tracking-tighter">
              {temperature}
            </span>
            <span className="text-4xl font-black text-[#FF7900] ml-0.5">
              °
            </span>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="flex items-center space-x-2 text-xs font-black font-mono-numbers">
              {tempMax !== undefined && (
                <span className="flex items-center text-[#171717]">
                  <ArrowUp size={13} className="text-[#FF7900] mr-0.5" />
                  <span>{formatTemp(tempMax)}</span>
                </span>
              )}
              {tempMin !== undefined && (
                <span className="flex items-center text-[#737873]">
                  <ArrowDown size={13} className="mr-0.5" />
                  <span>{formatTemp(tempMin)}</span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-[#737873] mt-1">
              High / Low
            </span>
          </div>
        </div>

        {/* Short Data-Grounded Weather Summary */}
        <p className="text-xs leading-relaxed my-3 font-medium text-[#737873]">
          {conditionSummary}
        </p>

        {/* Three Quick Metrics Strip */}
        <div className="mt-3.5 pt-3.5 border-t border-[#E9E7E1] grid grid-cols-3 gap-2">
          {/* Rain Probability (Blue category) */}
          <div className="p-2.5 rounded-2xl bg-[#E8F4FF] border border-[#D5ECFF]">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-[#0284C7]">
              Rain Risk
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <Droplets size={13} className="text-[#0284C7]" />
              <span className="text-sm font-black font-mono-numbers text-[#0284C7]">
                {rainChance}%
              </span>
            </div>
          </div>

          {/* Surface Wind (Mint category) */}
          <div className="p-2.5 rounded-2xl bg-[#E5F5EC] border border-[#CEEFDB]">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-[#10B981]">
              Field Wind
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <Wind size={13} className="text-[#10B981]" />
              <span className="text-sm font-black font-mono-numbers text-[#10B981]">
                {windSpeed} <span className="text-[10px] font-medium">{windDirectionCardinal}</span>
              </span>
            </div>
          </div>

          {/* Humidity (Mint category) */}
          <div className="p-2.5 rounded-2xl bg-[#E5F5EC] border border-[#CEEFDB]">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-[#10B981]">
              Humidity
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-sm font-black font-mono-numbers text-[#10B981]">
                {humidity}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
