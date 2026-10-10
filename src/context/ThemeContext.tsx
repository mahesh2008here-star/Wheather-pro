import React, { createContext, useContext, useEffect, useState } from 'react';

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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('weather_oled_dark');
    return saved ? JSON.parse(saved) : true; // Default to OLED Dark mode as requested
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

  useEffect(() => {
    localStorage.setItem('weather_oled_dark', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8F6F0';
    }
  }, [isDarkMode]);

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
