import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface AndroidContainerProps {
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<AndroidContainerProps> = ({ children }) => {
  const { isDarkMode, xRealityMode, customAccentColor } = useTheme();

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors ${
        isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#0D1117] text-slate-100'
      }`}
      style={{
        '--app-accent': customAccentColor,
      } as React.CSSProperties}
    >
      {/* FULL EDGE-TO-EDGE ANDROID CONTAINER (NO STATUS BAR, NO PUNCH HOLE) */}
      <main className={`w-full max-w-md min-h-screen sm:min-h-[94vh] sm:my-3 sm:rounded-[36px] flex flex-col overflow-hidden relative shadow-2xl border-0 sm:border border-white/10 ${
        xRealityMode ? 'x-reality-boost' : ''
      } ${
        isDarkMode ? 'bg-[#000000]' : 'bg-[#F2F5FA]'
      }`}>
        {/* ACTIVE SCREEN CONTENT - CLEAN FULL IMMERSIVE VIEW */}
        <div className={`flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col transition-colors ${
          isDarkMode ? 'bg-[#000000]' : 'bg-[#F2F5FA]'
        }`}>
          {children}
        </div>
      </main>
    </div>
  );
};
