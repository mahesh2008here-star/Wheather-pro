import React from 'react';
import { CloudSun, Radar, SunMedium, LayoutGrid, Sliders } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';

export const LiquidDockNav: React.FC = () => {
  const { activeTab, setActiveTab } = useWeather();
  const { customAccentColor, accentSurface, accentBorder } = useTheme();

  const tabs = [
    { id: 0, label: 'Weather', icon: CloudSun },
    { id: 1, label: 'Radar', icon: Radar },
    { id: 2, label: 'Air & Sun', icon: SunMedium },
    { id: 3, label: 'Widgets', icon: LayoutGrid },
    { id: 4, label: 'Settings', icon: Sliders },
  ];

  return (
    <div 
      className="absolute left-0 right-0 z-40 flex justify-center pointer-events-none px-3"
      style={{
        bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 6px), 14px)'
      }}
    >
      <nav 
        aria-label="Main Navigation Dock"
        className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-full border shadow-[0_8px_32px_rgba(23,23,23,0.08)] select-none w-full max-w-[390px] transition-all"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--md-sys-color-outline-variant, rgba(230, 229, 225, 0.85))',
        }}
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
                  ? 'flex-auto py-2 px-3.5 rounded-full shadow-xs border'
                  : 'flex-1 py-2 px-2 rounded-full hover:bg-black/5 transition-colors'
              }`}
              style={isActive ? {
                backgroundColor: accentSurface || 'var(--md-sys-color-primary-container, #FFF0E4)',
                color: customAccentColor || 'var(--md-sys-color-primary, #FF7900)',
                borderColor: accentBorder || 'var(--md-sys-color-primary-border, #FFE1CB)',
                boxShadow: `0 2px 8px ${accentBorder || 'rgba(0,0,0,0.06)'}`,
              } : {
                color: 'var(--md-sys-color-on-surface-variant, #444746)',
              }}
            >
              <Icon 
                size={19} 
                strokeWidth={isActive ? 2.4 : 1.9} 
                className="shrink-0 transition-transform duration-150"
              />
              {isActive && (
                <span className="text-xs font-bold tracking-tight ml-1.5 whitespace-nowrap font-display">
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

