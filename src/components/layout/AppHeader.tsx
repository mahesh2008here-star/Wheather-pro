import React from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Crosshair, 
  AlertTriangle, 
  Sun, 
  Moon, 
  RefreshCw 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWeather } from '../../context/WeatherContext';

interface AppHeaderProps {
  onOpenLocationPicker: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenLocationPicker }) => {
  const { isDarkMode, toggleDarkMode, customAccentColor } = useTheme();
  const { 
    activeLocation, 
    detectGpsLocation, 
    isLocating, 
    alerts, 
    isLoading, 
    refreshWeather 
  } = useWeather();

  return (
    <header className={`w-full px-3 pt-2 pb-2 flex items-center justify-between shrink-0 select-none z-20 transition-colors ${
      isDarkMode ? 'bg-[#000000] border-b border-white/10' : 'bg-[#F2F5FA] border-b border-slate-200'
    }`}>
      {/* Left: App Logo Icon & Active Location Switcher */}
      <div className="flex items-center space-x-2">
        <img 
          src="/assets/weather_app_logo.svg" 
          alt="Weather App Icon" 
          className="w-8 h-8 rounded-xl shadow-xs shrink-0 object-cover border border-white/20"
        />

        <button
          onClick={onOpenLocationPicker}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-[#141820] text-white hover:bg-[#1C222E] border border-white/15 shadow-xs'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300/80 shadow-xs'
          }`}
          title="Change active weather location"
        >
          <MapPin size={13} style={{ color: customAccentColor }} className="shrink-0" />
          <span className="truncate max-w-[120px] text-xs font-black">{activeLocation.name}</span>
          <ChevronDown size={13} className="opacity-60 shrink-0" />
        </button>
      </div>

      {/* Right Actions: GPS Auto-Detect, Severe Alerts, Theme & Refresh */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={detectGpsLocation}
          disabled={isLocating}
          className={`px-2.5 py-1.5 rounded-2xl flex items-center space-x-1 text-[11px] font-black transition-all cursor-pointer ${
            isLocating
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 animate-pulse'
              : isDarkMode
              ? 'bg-[#141820] text-teal-400 hover:bg-[#1C222E] border border-teal-500/30'
              : 'bg-white text-teal-600 hover:bg-teal-50 border border-teal-300 shadow-xs'
          }`}
          title="Auto Detect GPS Location"
        >
          <Crosshair size={13} className={isLocating ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">GPS</span>
        </button>

        {alerts.length > 0 && (
          <span 
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse"
            title={`${alerts.length} Active Severe Weather Warning`}
          >
            <AlertTriangle size={11} />
            <span>{alerts.length}</span>
          </span>
        )}

        <button
          onClick={toggleDarkMode}
          className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            isDarkMode 
              ? 'bg-[#141820] text-amber-300 hover:bg-[#1C222E] border border-white/10' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
          }`}
          title="Toggle Dark / Light Theme"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={refreshWeather}
          className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            isLoading ? 'animate-spin text-teal-400' : ''
          } ${
            isDarkMode 
              ? 'bg-[#141820] text-slate-200 hover:bg-[#1C222E] border border-white/10' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
          }`}
          title="Refresh Live Weather"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </header>
  );
};
