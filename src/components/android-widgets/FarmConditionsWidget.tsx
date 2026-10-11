import React from 'react';
import { 
  Sprout, 
  Wind, 
  Droplets, 
  Thermometer, 
  Compass, 
  CloudRain
} from 'lucide-react';
import { CurrentWeatherMetrics, LocationInfo } from '../../types/weather';

interface FarmConditionsWidgetProps {
  metrics: CurrentWeatherMetrics;
  location: LocationInfo;
  onClick?: () => void;
}

export const FarmConditionsWidget: React.FC<FarmConditionsWidgetProps> = ({
  metrics,
  location,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Farm Conditions Telemetry for ${location.name}`}
      className="w-full p-4 rounded-[26px] bg-[#E4F5E9] border border-[#CDEED6] shadow-sm hover:shadow-md transition-all cursor-pointer select-none text-[#171717]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#CDEED6]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-[#159B69] shadow-2xs">
            <Sprout size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#171717]">Farm Field Conditions</h4>
            <p className="text-[10px] text-[#737873] font-medium">{location.name} • Agronomy Telemetry</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#159B69] bg-white px-2 py-0.5 rounded-full border border-[#CDEED6]">
          Parcel
        </span>
      </div>

      {/* 2x2 Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-3">
        {/* Soil Moisture & Temp */}
        <div className="p-2.5 rounded-2xl bg-white border border-[#CDEED6]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#737873]">
            <span className="text-[10px] font-bold">Topsoil Layer</span>
            <Sprout size={13} className="text-[#159B69]" />
          </div>
          <div className="mt-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers text-[#171717]">
                {metrics.soilMoisture !== undefined ? `${metrics.soilMoisture}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-[#737873]">moisture</span>
            </div>
            <span className="text-[10px] font-bold text-[#159B69] block">
              Temp: {metrics.soilTemperature !== undefined ? `${metrics.soilTemperature}°` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Rain Probability & Volume */}
        <div className="p-2.5 rounded-2xl bg-white border border-[#CDEED6]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#737873]">
            <span className="text-[10px] font-bold">Precipitation</span>
            <CloudRain size={13} className="text-[#1687C9]" />
          </div>
          <div className="mt-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers text-[#171717]">
                {metrics.rainChance}%
              </span>
              <span className="text-[10px] text-[#737873]">chance</span>
            </div>
            <span className="text-[10px] font-bold text-[#1687C9] block">
              Sum: {metrics.precipitationAmount} mm
            </span>
          </div>
        </div>

        {/* Wind Speed & Direction */}
        <div className="p-2.5 rounded-2xl bg-white border border-[#CDEED6]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#737873]">
            <span className="text-[10px] font-bold">Field Wind</span>
            <Wind size={13} className="text-[#159B69]" />
          </div>
          <div className="mt-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers text-[#171717]">
                {metrics.windSpeed}
              </span>
              <span className="text-[10px] text-[#737873]">km/h</span>
            </div>
            <span className="text-[10px] font-bold text-[#737873] block">
              {metrics.windDirectionCardinal} ({metrics.windDirection}°) • Gust {metrics.windGusts}
            </span>
          </div>
        </div>

        {/* Relative Humidity & Dew Point */}
        <div className="p-2.5 rounded-2xl bg-white border border-[#CDEED6]/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#737873]">
            <span className="text-[10px] font-bold">Humidity</span>
            <Droplets size={13} className="text-[#1687C9]" />
          </div>
          <div className="mt-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-black font-mono-numbers text-[#171717]">
                {metrics.humidity}%
              </span>
              <span className="text-[10px] text-[#737873]">RH</span>
            </div>
            <span className="text-[10px] font-bold text-[#737873] block">
              Dew Point: {metrics.dewPoint}°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
