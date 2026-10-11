import React from 'react';
import { 
  ChevronDown, 
  Crosshair, 
  RefreshCw,
  Sprout,
  Sliders
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

interface AppHeaderProps {
  onOpenLocationPicker: () => void;
  onOpenSettings?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenLocationPicker, onOpenSettings }) => {
  const { 
    activeLocation, 
    detectGpsLocation, 
    isLocating, 
    alerts, 
    isLoading, 
    refreshWeather,
    setActiveTab
  } = useWeather();

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setActiveTab(4); // Switch to Settings tab
    }
  };

  return (
    <header className="w-full px-4 pt-3.5 pb-2.5 flex items-center justify-between shrink-0 select-none z-20 border-b border-[#E9E7E1] bg-[#F7F6F2] text-[#171717]">
      {/* Brand Identity & Location Selector */}
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-[#E9E7E1] bg-white text-[#FF7900] shadow-xs">
          <Sprout size={18} strokeWidth={2.4} />
        </div>

        <button
          onClick={onOpenLocationPicker}
          aria-label={`Change weather location. Currently set to ${activeLocation.name}`}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-left hover:bg-[#EAE8E1] transition-colors cursor-pointer snappy-touch min-w-0"
          title="Change location"
        >
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7900] leading-none">
                Farm Weather
              </span>
              {alerts.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] animate-ping inline-block" />
              )}
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-xs font-black truncate max-w-[135px] text-[#171717]">
                {activeLocation.name}
              </span>
              <ChevronDown size={12} className="text-[#737873] shrink-0" />
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
              ? 'bg-[#FFF0E4] text-[#FF7900] animate-pulse'
              : 'text-[#737873] hover:text-[#171717] hover:bg-white'
          }`}
          title="Locate with GPS"
        >
          <Crosshair size={16} className={isLocating ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={refreshWeather}
          aria-label="Refresh live weather"
          className="p-2 rounded-xl text-[#737873] hover:text-[#171717] hover:bg-white transition-all cursor-pointer snappy-touch"
          title="Refresh forecast"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#FF7900]' : ''} />
        </button>

        <button
          onClick={handleSettingsClick}
          aria-label="Open settings"
          className="p-2 rounded-xl text-[#737873] hover:text-[#171717] hover:bg-white transition-all cursor-pointer snappy-touch"
          title="Open settings"
        >
          <Sliders size={16} />
        </button>
      </div>
    </header>
  );
};
