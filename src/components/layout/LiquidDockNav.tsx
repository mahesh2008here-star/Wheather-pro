import React from 'react';
import { CloudSun, Radar, SunMedium, LayoutGrid, Sliders } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

export const LiquidDockNav: React.FC = () => {
  const { activeTab, setActiveTab } = useWeather();

  const tabs = [
    { id: 0, label: 'Weather', icon: CloudSun },
    { id: 1, label: 'Radar', icon: Radar },
    { id: 2, label: 'Air & Sun', icon: SunMedium },
    { id: 3, label: 'Widgets', icon: LayoutGrid },
    { id: 4, label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="absolute bottom-3.5 left-0 right-0 z-40 flex justify-center pointer-events-none px-3">
      <nav 
        aria-label="Main Navigation Dock"
        className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E9E7E1] shadow-[0_8px_24px_rgba(0,0,0,0.08)] select-none w-full max-w-[390px] transition-all"
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
              className={`flex items-center justify-center transition-all duration-200 cursor-pointer snappy-touch ${
                isActive
                  ? 'flex-auto bg-[#FFF0E4] text-[#FF7900] py-1.5 px-3 rounded-full shadow-xs'
                  : 'flex-1 text-[#171717] opacity-65 hover:opacity-100 py-1.5 px-2 rounded-full hover:bg-[#F7F6F2]'
              }`}
            >
              <Icon 
                size={19} 
                strokeWidth={isActive ? 2.4 : 1.8} 
                className="shrink-0"
              />
              {isActive && (
                <span className="text-xs font-black tracking-tight ml-1.5 whitespace-nowrap">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
