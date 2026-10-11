import React from 'react';
import { Sun, Radar, Flower2, Layers, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWeather } from '../../context/WeatherContext';

export const LiquidDockNav: React.FC = () => {
  const { isDarkMode, customAccentColor } = useTheme();
  const { activeTab, setActiveTab } = useWeather();

  const tabs = [
    { id: 0, label: 'Weather', icon: Sun },
    { id: 1, label: 'Radar', icon: Radar },
    { id: 2, label: 'Air & Sun', icon: Flower2 },
    { id: 3, label: 'Widgets', icon: Layers },
    { id: 4, label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Liquid Glass Dock"
      className={`absolute bottom-4 sm:bottom-5 inset-x-0 mx-auto w-[92%] max-w-[390px] h-16 px-2 flex items-center justify-around select-none z-40 rounded-full transition-all duration-200 shadow-2xl ${
        isDarkMode
          ? 'liquid-glass-dock text-white'
          : 'liquid-glass-dock-light text-slate-900'
      }`}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              try { navigator.vibrate?.(12); } catch {}
            }}
            aria-label={`Navigate to ${tab.label} screen`}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full touch-response cursor-pointer active:scale-90 ${
              isActive
                ? 'font-black scale-105'
                : isDarkMode
                  ? 'text-zinc-300 hover:text-white font-bold hover:scale-102'
                  : 'text-slate-700 hover:text-slate-950 font-bold hover:scale-102'
            }`}
            style={{
              color: isActive ? customAccentColor : undefined,
            }}
          >
            <div 
              className={`px-3.5 py-1 rounded-full transition-all duration-150 ${
                isActive 
                  ? 'shadow-md border border-white/40 backdrop-blur-md' 
                  : ''
              }`}
              style={{
                backgroundColor: isActive ? `${customAccentColor}28` : undefined,
                borderColor: isActive ? `${customAccentColor}60` : undefined,
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-extrabold">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
