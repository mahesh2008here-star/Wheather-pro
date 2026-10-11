import React from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Crosshair, 
  Sun, 
  Moon, 
  RefreshCw,
  Sprout
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWeather } from '../../context/WeatherContext';

interface AppHeaderProps {
  onOpenLocationPicker: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenLocationPicker }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { 
    activeLocation, 
    detectGpsLocation, 
    isLocating, 
    alerts, 
    isLoading, 
    refreshWeather 
  } = useWeather();

  return (
    <header className={`w-full px-4 pt-3 pb-2.5 flex items-center justify-between shrink-0 select-none z-20 transition-colors border-b ${
      isDarkMode 
        ? 'bg-[#0E1310] border-[#1C241F] text-[#F3F6F4]' 
        : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#121814]'
    }`}>
      {/* Brand Identity & Location Selector */}
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform ${
          isDarkMode 
            ? 'bg-[#151D18] border-[#222E26] text-[#10B981]' 
            : 'bg-[#FFFFFF] border-[#E2DFD7] text-[#1B4332] shadow-xs'
        }`}>
          <Sprout size={18} strokeWidth={2.4} />
        </div>

        <button
          onClick={onOpenLocationPicker}
          aria-label={`Change weather location. Currently set to ${activeLocation.name}`}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-left transition-colors cursor-pointer snappy-touch min-w-0 ${
            isDarkMode
              ? 'hover:bg-[#151D18] text-[#F3F6F4]'
              : 'hover:bg-[#EFECE5] text-[#121814]'
          }`}
          title="Change location"
        >
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C00] leading-none">
                Farm Weather
              </span>
              {alerts.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00] animate-ping inline-block" />
              )}
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-xs font-black truncate max-w-[130px]">
                {activeLocation.name}
              </span>
              <ChevronDown size={12} className="opacity-60 shrink-0" />
            </div>
          </div>
        </button>
      </div>

      {/* Quick Action Icons */}
      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={detectGpsLocation}
          disabled={isLocating}
          aria-label="Use current GPS location"
          className={`p-2 rounded-xl transition-all cursor-pointer snappy-touch ${
            isLocating
              ? 'bg-[#FF5C00]/20 text-[#FF5C00] animate-pulse'
              : isDarkMode
              ? 'text-[#89998F] hover:text-[#FFFFFF] hover:bg-[#151D18]'
              : 'text-[#5D6861] hover:text-[#121814] hover:bg-[#EFECE5]'
          }`}
          title="Locate with GPS"
        >
          <Crosshair size={16} className={isLocating ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={refreshWeather}
          aria-label="Refresh live weather"
          className={`p-2 rounded-xl transition-all cursor-pointer snappy-touch ${
            isDarkMode
              ? 'text-[#89998F] hover:text-[#FFFFFF] hover:bg-[#151D18]'
              : 'text-[#5D6861] hover:text-[#121814] hover:bg-[#EFECE5]'
          }`}
          title="Refresh forecast"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#FF5C00]' : ''} />
        </button>

        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark and light mode"
          className={`p-2 rounded-xl transition-all cursor-pointer snappy-touch ${
            isDarkMode
              ? 'text-[#FCD34D] hover:bg-[#151D18]'
              : 'text-[#121814] hover:bg-[#EFECE5]'
          }`}
          title="Toggle theme"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

