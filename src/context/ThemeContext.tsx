import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  glow: string;
}

export const ACCENT_PRESETS: ColorPreset[] = [
  { id: 'bold_orange', name: 'Editorial Orange', hex: '#FF6B35', glow: 'rgba(255, 107, 53, 0.4)' },
  { id: 'amber_glow', name: 'Harvest Amber', hex: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  { id: 'forest_emerald', name: 'Field Emerald', hex: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'sky_azure', name: 'Sky Azure', hex: '#0284C7', glow: 'rgba(2, 132, 199, 0.4)' },
];

export const MATERIAL_ACCENT_PRESETS = ACCENT_PRESETS;

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  tempUnit: 'C' | 'F';
  toggleTempUnit: () => void;
  windUnit: 'kmh' | 'mph';
  toggleWindUnit: () => void;
  pressureUnit: 'hPa' | 'inHg';
  togglePressureUnit: () => void;
  precipUnit: 'mm' | 'in';
  togglePrecipUnit: () => void;
  formatTemp: (celsius: number) => string;
  formatWind: (kmh: number) => string;
  formatPressure: (hpa: number) => string;
  formatPrecip: (mm: number) => string;
  customAccentColor: string;
  setCustomAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('farmweather_dark_theme');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('farmweather_temp_unit') as 'C' | 'F') || 'C';
  });

  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>(() => {
    return (localStorage.getItem('farmweather_wind_unit') as 'kmh' | 'mph') || 'kmh';
  });

  const [pressureUnit, setPressureUnit] = useState<'hPa' | 'inHg'>(() => {
    return (localStorage.getItem('farmweather_pressure_unit') as 'hPa' | 'inHg') || 'hPa';
  });

  const [precipUnit, setPrecipUnit] = useState<'mm' | 'in'>(() => {
    return (localStorage.getItem('farmweather_precip_unit') as 'mm' | 'in') || 'mm';
  });

  // Default Editorial Orange (#FF6B35)
  const [customAccentColor, setCustomAccentColor] = useState<string>(() => {
    return localStorage.getItem('farmweather_accent_color') || '#FF6B35';
  });

  useEffect(() => {
    localStorage.setItem('farmweather_dark_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#171717';
      document.body.style.color = '#F5F5F5';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F7F7F5';
      document.body.style.color = '#151515';
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('farmweather_accent_color', customAccentColor);
    document.documentElement.style.setProperty('--app-accent', customAccentColor);
  }, [customAccentColor]);

  useEffect(() => {
    localStorage.setItem('farmweather_temp_unit', tempUnit);
  }, [tempUnit]);

  useEffect(() => {
    localStorage.setItem('farmweather_wind_unit', windUnit);
  }, [windUnit]);

  useEffect(() => {
    localStorage.setItem('farmweather_pressure_unit', pressureUnit);
  }, [pressureUnit]);

  useEffect(() => {
    localStorage.setItem('farmweather_precip_unit', precipUnit);
  }, [precipUnit]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleTempUnit = () => setTempUnit(prev => (prev === 'C' ? 'F' : 'C'));
  const toggleWindUnit = () => setWindUnit(prev => (prev === 'kmh' ? 'mph' : 'kmh'));
  const togglePressureUnit = () => setPressureUnit(prev => (prev === 'hPa' ? 'inHg' : 'hPa'));
  const togglePrecipUnit = () => setPrecipUnit(prev => (prev === 'mm' ? 'in' : 'mm'));

  const formatTemp = (celsius: number): string => {
    if (tempUnit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const formatWind = (kmh: number): string => {
    if (windUnit === 'mph') {
      const mph = Math.round(kmh * 0.621371);
      return `${mph} mph`;
    }
    return `${Math.round(kmh)} km/h`;
  };

  const formatPressure = (hpa: number): string => {
    if (pressureUnit === 'inHg') {
      const inHg = (hpa * 0.02953).toFixed(2);
      return `${inHg} inHg`;
    }
    return `${Math.round(hpa)} hPa`;
  };

  const formatPrecip = (mm: number): string => {
    if (precipUnit === 'in') {
      const inches = (mm * 0.0393701).toFixed(2);
      return `${inches} in`;
    }
    return `${Number(mm.toFixed(1))} mm`;
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
        precipUnit,
        togglePrecipUnit,
        formatTemp,
        formatWind,
        formatPressure,
        formatPrecip,
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
