import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface AndroidContainerProps {
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<AndroidContainerProps> = ({ children }) => {
  const { isDarkMode, customAccentColor } = useTheme();

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors ${
        isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#0B0F17] text-slate-100'
      }`}
      style={{
        '--app-accent': customAccentColor,
      } as React.CSSProperties}
    >
      {/* 
        CLEAN ANDROID & APPLE OPTIMISED CONTAINER:
        - Includes dedicated top status bar safe clearance to ensure 
          the phone's punch-hole camera and system status bar (clock, battery, 5G) 
          are never blocked or overlapped by app content.
        - Position relative and h-screen/h-[95vh] allows the liquid glass dock to float in place.
      */}
      <main 
        className={`w-full max-w-md h-screen sm:h-[95vh] sm:my-2 sm:rounded-[38px] flex flex-col overflow-hidden relative shadow-2xl border-0 sm:border border-white/10 pt-[max(env(safe-area-inset-top,0px),26px)] sm:pt-3 transition-colors ${
          isDarkMode ? 'bg-[#000000]' : 'bg-[#F4F6FA]'
        }`}
      >
        {children}
      </main>
    </div>
  );
};
