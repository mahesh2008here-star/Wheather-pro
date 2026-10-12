import React from 'react';
import { MapPin, ShieldCheck, Search, Navigation } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FirstLaunchLocationModalProps {
  isOpen: boolean;
  onAllowLocation: () => void;
  onChooseManually: () => void;
}

export const FirstLaunchLocationModal: React.FC<FirstLaunchLocationModalProps> = ({
  isOpen,
  onAllowLocation,
  onChooseManually,
}) => {
  const { customAccentColor, accentSurface, accentBorder } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-tab-switch">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-prompt-title"
        className="w-full max-w-sm rounded-[32px] bg-white border border-[#E9E7E1] shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Top Decorative Emblem */}
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xs transition-colors"
            style={{
              backgroundColor: accentSurface,
              borderColor: accentBorder,
              color: customAccentColor,
            }}
          >
            <MapPin size={32} strokeWidth={2.4} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 
            id="location-prompt-title" 
            className="text-lg font-black tracking-tight text-[#171717] mb-2"
          >
            Enable Device Location
          </h2>
          <p className="text-xs font-medium text-[#737873] leading-relaxed">
            Farm Weather uses your device location to provide accurate local field conditions, 
            crop-safety alerts, hourly rain forecasts, and radar telemetry for your farm.
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] text-left flex items-start space-x-2.5">
            <ShieldCheck size={18} className="text-[#10B981] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#444746] leading-tight">
              <span className="font-bold text-[#171717] block mb-0.5">Your Privacy & Android Permissions</span>
              Android lets you choose <span className="font-semibold text-[#171717]">Precise</span> or <span className="font-semibold text-[#171717]">Approximate</span> location. We only access location while using the app.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onAllowLocation}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 text-white cursor-pointer snappy-touch shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: customAccentColor,
            }}
          >
            <Navigation size={15} />
            <span>Allow Location Access</span>
          </button>

          <button
            onClick={onChooseManually}
            className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-[#737873] hover:text-[#171717] hover:bg-[#F7F6F2] flex items-center justify-center space-x-2 cursor-pointer snappy-touch border border-transparent transition-colors"
          >
            <Search size={14} />
            <span>Search or Select City Manually</span>
          </button>
        </div>
      </div>
    </div>
  );
};
