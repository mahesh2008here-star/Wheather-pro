import React from 'react';
import { CloudSun, Radar, SunMedium, LayoutGrid, Sliders } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWeather } from '../../context/WeatherContext';

export const LiquidDockNav: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { activeTab, setActiveTab } = useWeather();

  const tabs = [
    { id: 0, label: 'Weather', icon: CloudSun },
    { id: 1, label: 'Radar', icon: Radar },
    { id: 2, label: 'Air & Sun', icon: SunMedium },
    { id: 3, label: 'Widgets', icon: LayoutGrid },
    { id: 4, label: 'Settings', icon: Sliders },
  ];

  return (
    <nav 
      aria-label="Main Navigation"
      className={`w-full shrink-0 h-[64px] px-2 flex items-center justify-around select-none z-30 transition-colors border-t ${
        isDarkMode
          ? 'bg-[#0E1310] border-[#1C241F] text-[#F3F6F4]'
          : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
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
              try { navigator.vibrate?.(10); } catch {}
            }}
            aria-label={`Navigate to ${tab.label}`}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all cursor-pointer snappy-touch ${
              isActive
                ? 'text-[#FF5C00]'
                : isDarkMode ? 'text-[#89998F] hover:text-[#FFFFFF]' : 'text-[#5D6861] hover:text-[#121814]'
            }`}
          >
            <div 
              className={`px-3.5 py-1 rounded-2xl transition-all duration-150 flex items-center justify-center ${
                isActive 
                  ? isDarkMode 
                    ? 'bg-[#FF5C00]/15 text-[#FF5C00]' 
                    : 'bg-[#FF5C00]/10 text-[#FF5C00]' 
                  : 'bg-transparent'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${
              isActive ? 'font-black text-[#FF5C00]' : 'font-semibold'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

