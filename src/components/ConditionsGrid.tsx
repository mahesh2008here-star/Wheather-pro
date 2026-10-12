import React from 'react';
import { 
  Wind, 
  Droplets, 
  Gauge, 
  Eye, 
  SunMedium, 
  ShieldCheck, 
} from 'lucide-react';
import { CurrentWeatherMetrics } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface ConditionsGridProps {
  metrics: CurrentWeatherMetrics;
}

export const ConditionsGrid: React.FC<ConditionsGridProps> = ({ metrics }) => {
  const { isDarkMode, formatTemp, formatWind, formatPressure } = useTheme();

  return (
    <div className="w-full px-4 py-2 select-none">
      <div 
        className={`w-full p-4 rounded-[26px] border shadow-xs transition-colors ${
          isDarkMode 
            ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
            : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
        }`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-black tracking-tight uppercase flex items-center space-x-1.5">
            <span>Atmospheric Observations</span>
          </h3>
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
            Air Quality: AQI {metrics.airQuality?.aqi ?? 32} ({metrics.airQuality?.category ?? 'Good'})
          </span>
        </div>

        {/* 6 Structured Condition Metrics in an Integrated Divider Grid */}
        <div className={`grid grid-cols-2 divide-x divide-y divide-black/5 dark:divide-white/5 rounded-2xl overflow-hidden border ${
          isDarkMode ? 'border-[#1E2821] bg-[#162019]' : 'border-[#E8E6DF] bg-[#F8F7F4]'
        }`}>
          {/* 1. Wind & Gusts */}
          <div className="p-3">
            <div className="flex items-center space-x-1.5 text-[#5D6861] dark:text-[#89998F] mb-1">
              <Wind size={14} className="text-[#10B981]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Wind & Gusts</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers">
                {formatWind(metrics.windSpeed)}
              </span>
              <span className="text-xs font-bold text-[#10B981]">
                {metrics.windDirectionCardinal}
              </span>
            </div>
            <span className={`text-[10px] font-medium block mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              Gusts to {formatWind(metrics.windGusts)}
            </span>
          </div>

          {/* 2. Humidity & Dew Point */}
          <div className="p-3">
            <div className="flex items-center space-x-1.5 text-[#5D6861] dark:text-[#89998F] mb-1">
              <Droplets size={14} className="text-sky-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers">
                {metrics.humidity}%
              </span>
            </div>
            <span className={`text-[10px] font-medium block mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              Dew point is {formatTemp(metrics.dewPoint)}
            </span>
          </div>

          {/* 3. Barometer */}
          <div className="p-3">
            <div className="flex items-center space-x-1.5 text-[#5D6861] dark:text-[#89998F] mb-1">
              <Gauge size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Barometer</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers">
                {formatPressure(metrics.pressure)}
              </span>
            </div>
            <span className={`text-[10px] font-medium block mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              Pressure is {metrics.pressureTendency}
            </span>
          </div>

          {/* 4. UV Index */}
          <div className="p-3">
            <div className="flex items-center space-x-1.5 text-[#5D6861] dark:text-[#89998F] mb-1">
              <SunMedium size={14} className="text-[#FF5C00]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">UV Index</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers">
                {metrics.uvIndex}
              </span>
              <span className="text-xs font-bold text-[#FF5C00]">
                {metrics.uvLevel}
              </span>
            </div>
            <span className={`text-[10px] font-medium block mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              {metrics.uvIndex >= 6 ? 'Sun protection advised' : 'Low burn risk'}
            </span>
          </div>

          {/* 5. Visibility & Cloud Cover */}
          <div className="p-3">
            <div className="flex items-center space-x-1.5 text-[#5D6861] dark:text-[#89998F] mb-1">
              <Eye size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Visibility</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers">
                {metrics.visibility} km
              </span>
            </div>
            <span className={`text-[10px] font-medium block mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              {metrics.cloudCover}% cloud coverage
            </span>
          </div>

          {/* 6. Air Quality Summary */}
          <div className="p-3">
            <div className="flex items-center space-x-1.5 text-[#5D6861] dark:text-[#89998F] mb-1">
              <ShieldCheck size={14} className="text-[#10B981]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Air Quality</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers">
                {metrics.airQuality?.aqi ?? 28}
              </span>
              <span className="text-xs font-bold text-[#10B981]">
                {metrics.airQuality?.category ?? 'Good'}
              </span>
            </div>
            <span className={`text-[10px] font-medium block mt-0.5 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              PM2.5: {metrics.airQuality?.pm25 ?? 6.2} µg/m³
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
