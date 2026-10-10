import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  glow: string;
}

export const MATERIAL_ACCENT_PRESETS: ColorPreset[] = [
  { id: 'mint_jade', name: 'Botanical Mint', hex: '#00D284', glow: 'rgba(0, 210, 132, 0.4)' },
  { id: 'sky_cerulean', name: 'Sky Cerulean', hex: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.4)' },
  { id: 'electric_violet', name: 'Royal Violet', hex: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
  { id: 'sunset_amber', name: 'Sunset Amber', hex: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  { id: 'coral_rose', name: 'Coral Blossom', hex: '#F43F5E', glow: 'rgba(244, 63, 94, 0.4)' },
  { id: 'cyber_cyan', name: 'Cyber Turquoise', hex: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
  { id: 'soft_iris', name: 'Muted Iris', hex: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)' },
  { id: 'tangerine_glow', name: 'Warm Tangerine', hex: '#FB923C', glow: 'rgba(251, 146, 60, 0.4)' },
  { id: 'hot_fuchsia', name: 'Neon Fuchsia', hex: '#EC4899', glow: 'rgba(236, 72, 153, 0.4)' },
  { id: 'glacier_ice', name: 'Pure Glacier', hex: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)' },
  { id: 'deep_emerald', name: 'Forest Emerald', hex: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'titanium_slate', name: 'Titanium Slate', hex: '#64748B', glow: 'rgba(100, 116, 139, 0.35)' },
];

export const ACCENT_PRESETS = MATERIAL_ACCENT_PRESETS;

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 210, 132, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  tempUnit: 'C' | 'F';
  toggleTempUnit: () => void;
  windUnit: 'kmh' | 'mph';
  toggleWindUnit: () => void;
  pressureUnit: 'hPa' | 'inHg';
  togglePressureUnit: () => void;
  formatTemp: (celsius: number) => string;
  formatWind: (kmh: number) => string;
  formatPressure: (hpa: number) => string;
  // Custom Material You Accent Color (Implemented globally across all screens)
  customAccentColor: string;
  setCustomAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('weather_oled_dark');
    return saved ? JSON.parse(saved) : true;
  });

  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('weather_temp_unit') as 'C' | 'F') || 'C';
  });

  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>(() => {
    return (localStorage.getItem('weather_wind_unit') as 'kmh' | 'mph') || 'kmh';
  });

  const [pressureUnit, setPressureUnit] = useState<'hPa' | 'inHg'>(() => {
    return (localStorage.getItem('weather_pressure_unit') as 'hPa' | 'inHg') || 'hPa';
  });

  // Custom UI Accent Color Picker (defaults to clean Botanical Mint)
  const [customAccentColor, setCustomAccentColor] = useState<string>(() => {
    return localStorage.getItem('weather_custom_accent') || '#00D284';
  });

  useEffect(() => {
    localStorage.setItem('weather_oled_dark', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F4F6FA';
    }
  }, [isDarkMode]);

  // Apply custom accent color globally across root document
  useEffect(() => {
    localStorage.setItem('weather_custom_accent', customAccentColor);
    const root = document.documentElement;
    root.style.setProperty('--app-accent', customAccentColor);
    root.style.setProperty('--app-accent-10', hexToRgba(customAccentColor, 0.1));
    root.style.setProperty('--app-accent-20', hexToRgba(customAccentColor, 0.2));
    root.style.setProperty('--app-accent-30', hexToRgba(customAccentColor, 0.3));
    root.style.setProperty('--app-accent-50', hexToRgba(customAccentColor, 0.5));
    root.style.setProperty('--app-accent-glow', hexToRgba(customAccentColor, 0.45));
  }, [customAccentColor]);

  useEffect(() => {
    localStorage.setItem('weather_temp_unit', tempUnit);
  }, [tempUnit]);

  useEffect(() => {
    localStorage.setItem('weather_wind_unit', windUnit);
  }, [windUnit]);

  useEffect(() => {
    localStorage.setItem('weather_pressure_unit', pressureUnit);
  }, [pressureUnit]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleTempUnit = () => setTempUnit(prev => (prev === 'C' ? 'F' : 'C'));
  const toggleWindUnit = () => setWindUnit(prev => (prev === 'kmh' ? 'mph' : 'kmh'));
  const togglePressureUnit = () => setPressureUnit(prev => (prev === 'hPa' ? 'inHg' : 'hPa'));

  const formatTemp = (celsius: number): string => {
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°`;
    }
    return `${celsius}°`;
  };

  const formatWind = (kmh: number): string => {
    if (windUnit === 'mph') {
      const mph = Math.round(kmh * 0.621371);
      return `${mph} mph`;
    }
    return `${kmh} km/h`;
  };

  const formatPressure = (hpa: number): string => {
    if (pressureUnit === 'inHg') {
      const inHg = (hpa * 0.02953).toFixed(2);
      return `${inHg} inHg`;
    }
    return `${hpa} hPa`;
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        tempUnit,
        toggleTempUnit,
        windUnit,
        toggleWindUnit,
        pressureUnit,
        togglePressureUnit,
        formatTemp,
        formatWind,
        formatPressure,
        customAccentColor,
        setCustomAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
