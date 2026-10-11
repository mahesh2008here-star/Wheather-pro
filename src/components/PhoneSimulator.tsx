import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface AndroidContainerProps {
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<AndroidContainerProps> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors ${
        isDarkMode ? 'bg-[#080B09] text-[#F3F6F4]' : 'bg-[#EAE8E3] text-[#121814]'
      }`}
    >
      <main 
        className={`w-full max-w-md h-screen sm:h-[94vh] sm:my-2 sm:rounded-[36px] flex flex-col overflow-hidden relative shadow-2xl border-0 sm:border transition-colors ${
          isDarkMode 
            ? 'bg-[#0E1310] border-[#1C241F] text-[#F3F6F4]' 
            : 'bg-[#F8F7F4] border-[#E2DFD7] text-[#121814]'
        }`}
      >
        {children}
      </main>
    </div>
  );
};
