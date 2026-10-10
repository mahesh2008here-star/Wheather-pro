import React, { useState } from 'react';
import { Wifi, Battery, Signal, Maximize2, Smartphone, Download, Github } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ApkReleaseModal } from './ApkReleaseModal';

interface PhoneSimulatorProps {
  children: React.ReactNode;
  isSimulatorFrame: boolean;
  onToggleSimulatorFrame: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  isSimulatorFrame,
  onToggleSimulatorFrame,
}) => {
  const { isDarkMode } = useTheme();
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-stone-900 text-stone-100'
    }`}>
      {/* TOP DESKTOP CONTROLS STRIP */}
      <header className="w-full max-w-5xl py-2.5 px-4 flex items-center justify-between text-xs border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-bold tracking-tight text-white">Weather Pro • Animated Microclimate</span>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">• Pure OLED AMOLED Display</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* APK / GitHub Release Guide Button */}
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-semibold text-[11px] transition-all cursor-pointer"
            title="Download APK and GitHub Actions instructions"
          >
            <Download size={12} />
            <span>Get Android APK</span>
          </button>

          <button
            onClick={onToggleSimulatorFrame}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-all cursor-pointer"
            title="Toggle between phone bezel and full view"
          >
            {isSimulatorFrame ? (
              <>
                <Maximize2 size={12} />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone size={12} />
                <span>iPhone Bezel</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* APK Release Modal */}
      <ApkReleaseModal 
        isOpen={isApkModalOpen} 
        onClose={() => setIsApkModalOpen(false)} 
      />

      {/* SIMULATOR CONTAINER */}
      <main className="flex-1 w-full flex items-center justify-center p-0 sm:p-4 overflow-hidden">
        {isSimulatorFrame ? (
          /* iPhone 17 Pro Max Photorealistic Bezel */
          <div className="relative w-full max-w-[420px] h-[900px] max-h-[96vh] rounded-[52px] bg-black p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.18)] ring-1 ring-white/15 flex flex-col overflow-hidden">
            {/* Phone Screen Glass */}
            <div className={`relative w-full h-full rounded-[42px] overflow-hidden flex flex-col transition-colors ${
              isDarkMode ? 'bg-[#000000]' : 'bg-[#F9F7F2]'
            }`}>
              {/* STATUS BAR WITH DYNAMIC ISLAND (Matching Video 00:00 - 00:18) */}
              <div className="relative w-full h-11 px-7 flex items-center justify-between text-[13px] font-semibold select-none z-30 shrink-0">
                {/* Time (10:50 from video) */}
                <span className={isDarkMode ? 'text-white' : 'text-stone-900'}>
                  10:50
                </span>

                {/* Dynamic Island pill */}
                <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-28 h-7 bg-black rounded-full flex items-center justify-end px-2.5 space-x-1.5 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                </div>

                {/* Right Status Icons */}
                <div className={`flex items-center space-x-1.5 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  <Signal size={13} strokeWidth={2.5} />
                  <Wifi size={13} strokeWidth={2.5} />
                  <Battery size={16} strokeWidth={2.5} />
                </div>
              </div>

              {/* ACTIVE SCREEN CONTENT */}
              <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col">
                {children}
              </div>

              {/* iOS Home Indicator Bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-400/80 dark:bg-slate-600 rounded-full z-40 pointer-events-none" />
            </div>
          </div>
        ) : (
          /* Full Mobile Container View */
          <div className={`w-full max-w-md h-[100vh] sm:h-[94vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors relative border ${
            isDarkMode ? 'bg-[#000000] border-white/15' : 'bg-[#F9F7F2] border-stone-200'
          }`}>
            {/* Minimal Mobile Status Bar */}
            <div className="w-full h-8 px-5 flex items-center justify-between text-xs font-semibold select-none z-30 shrink-0 border-b border-black/5 dark:border-white/5">
              <span className={isDarkMode ? 'text-white' : 'text-stone-900'}>10:50</span>
              <div className="flex items-center space-x-1.5">
                <Wifi size={12} />
                <Battery size={14} />
              </div>
            </div>

            <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col">
              {children}
            </div>

            {/* Home Bar */}
            <div className="w-full py-1 flex justify-center bg-transparent z-40 shrink-0 pointer-events-none">
              <div className="w-28 h-1 bg-stone-400/60 dark:bg-slate-600 rounded-full" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
