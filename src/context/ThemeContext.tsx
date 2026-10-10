import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  glow: string;
}

export const ACCENT_PRESETS: ColorPreset[] = [
  { id: 'emerald', name: 'Sony Bravia Teal', hex: '#00F2B4', glow: 'rgba(0, 242, 180, 0.35)' },
  { id: 'cyber_cyan', name: 'X-Reality Cyan', hex: '#00E5FF', glow: 'rgba(0, 229, 255, 0.4)' },
  { id: 'vivid_amber', name: 'Sunburst Amber', hex: '#FFB800', glow: 'rgba(255, 184, 0, 0.4)' },
  { id: 'neon_coral', name: 'Ultra Coral', hex: '#FF3366', glow: 'rgba(255, 51, 102, 0.4)' },
  { id: 'electric_violet', name: 'Bravia Violet', hex: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' },
  { id: 'matrix_green', name: 'Hyper Lime', hex: '#39FF14', glow: 'rgba(57, 255, 20, 0.35)' },
  { id: 'pure_ice', name: 'Pure Glacier', hex: '#38BDF8', glow: 'rgba(56, 189, 248, 0.35)' },
];

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
  // Sony X-Reality Color Engine
  xRealityMode: boolean;
  toggleXRealityMode: () => void;
  // Custom UI Accent Color Picker
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

  // Sony X-Reality Color Engine (Vivid contrast, rich saturation, crisp edge definition)
  const [xRealityMode, setXRealityMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('weather_x_reality');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Custom UI Accent Color Picker
  const [customAccentColor, setCustomAccentColor] = useState<string>(() => {
    return localStorage.getItem('weather_custom_accent') || '#00F2B4';
  });

  useEffect(() => {
    localStorage.setItem('weather_oled_dark', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F2F5FA';
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('weather_x_reality', JSON.stringify(xRealityMode));
  }, [xRealityMode]);

  useEffect(() => {
    localStorage.setItem('weather_custom_accent', customAccentColor);
    document.documentElement.style.setProperty('--app-accent', customAccentColor);
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
  const toggleXRealityMode = () => setXRealityMode(prev => !prev);

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
        xRealityMode,
        toggleXRealityMode,
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
