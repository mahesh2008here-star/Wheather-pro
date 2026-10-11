import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface MaterialColorPreset {
  id: string;
  name: string;
  category: string;
  hex: string;
  surface: string;
  border: string;
  description: string;
}

export const MATERIAL_COLOR_PRESETS: MaterialColorPreset[] = [
  {
    id: 'material_orange',
    name: 'Sunset Orange',
    category: 'Harvest',
    hex: '#FF7900',
    surface: '#FFF0E4',
    border: '#FFE1CB',
    description: 'Signature Farm Weather warm orange',
  },
  {
    id: 'material_amber',
    name: 'Harvest Amber',
    category: 'Grain',
    hex: '#F59E0B',
    surface: '#FEF3C7',
    border: '#FDE68A',
    description: 'Golden wheat and ripe agricultural crops',
  },
  {
    id: 'material_terracotta',
    name: 'Terracotta Soil',
    category: 'Earth',
    hex: '#E65100',
    surface: '#FBE9E7',
    border: '#FFCCBC',
    description: 'Rich fertile loam and clay earth',
  },
  {
    id: 'material_emerald',
    name: 'Field Emerald',
    category: 'Flora',
    hex: '#10B981',
    surface: '#E5F5EC',
    border: '#CEEFDB',
    description: 'Fresh crop shoots and spring pasture',
  },
  {
    id: 'material_forest',
    name: 'Forest Canopy',
    category: 'Flora',
    hex: '#15803D',
    surface: '#E8F5E9',
    border: '#C8E6C9',
    description: 'Dense orchard canopy and woodland',
  },
  {
    id: 'material_azure',
    name: 'Atmosphere Azure',
    category: 'Atmosphere',
    hex: '#0284C7',
    surface: '#E8F4FF',
    border: '#BAE6FD',
    description: 'Clear troposphere and rain systems',
  },
  {
    id: 'material_indigo',
    name: 'Twilight Indigo',
    category: 'Atmosphere',
    hex: '#4F46E5',
    surface: '#EEF2FF',
    border: '#C7D2FE',
    description: 'Dusk horizon and night sky ephemeris',
  },
  {
    id: 'material_lavender',
    name: 'Orchard Lavender',
    category: 'Flora',
    hex: '#7C3AED',
    surface: '#EFECFF',
    border: '#DDD7FF',
    description: 'Blooming pollinator meadows',
  },
  {
    id: 'material_crimson',
    name: 'Berry Crimson',
    category: 'Harvest',
    hex: '#E11D48',
    surface: '#FFE4E6',
    border: '#FECDD3',
    description: 'Ripe summer berries and vineyard fruits',
  },
  {
    id: 'material_teal',
    name: 'Irrigation Teal',
    category: 'Hydrology',
    hex: '#0D9488',
    surface: '#E6FFFA',
    border: '#B2F5EA',
    description: 'Fresh water canals and aquifer sensors',
  },
];

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  glow: string;
}

export const ACCENT_PRESETS: ColorPreset[] = MATERIAL_COLOR_PRESETS.map(p => ({
  id: p.id,
  name: p.name,
  hex: p.hex,
  glow: p.surface,
}));

export const MATERIAL_ACCENT_PRESETS = ACCENT_PRESETS;

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function generateCompanionColors(hex: string) {
  const rgb = hexToRgb(hex) || { r: 255, g: 121, b: 0 };
  return {
    surface: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
    border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`,
    glow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`,
    rgbString: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
  };
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
  precipUnit: 'mm' | 'in';
  togglePrecipUnit: () => void;
  formatTemp: (celsius: number) => string;
  formatWind: (kmh: number) => string;
  formatPressure: (hpa: number) => string;
  formatPrecip: (mm: number) => string;
  customAccentColor: string;
  setCustomAccentColor: (color: string) => void;
  accentSurface: string;
  accentBorder: string;
  materialPresets: MaterialColorPreset[];
  resetAccentColor: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Strict light theme requirement
  const isDarkMode = false;

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

  const [customAccentColor, setCustomAccentColorState] = useState<string>(() => {
    return localStorage.getItem('farmweather_accent_color') || '#FF7900';
  });

  const [accentSurface, setAccentSurface] = useState<string>('#FFF0E4');
  const [accentBorder, setAccentBorder] = useState<string>('#FFE1CB');

  const applyThemeColors = useCallback((hex: string) => {
    if (!hex) return;
    const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
    setCustomAccentColorState(cleanHex);

    const matched = MATERIAL_COLOR_PRESETS.find(
      p => p.hex.toLowerCase() === cleanHex.toLowerCase()
    );
    const companions = generateCompanionColors(cleanHex);

    const surface = matched ? matched.surface : companions.surface;
    const border = matched ? matched.border : companions.border;

    setAccentSurface(surface);
    setAccentBorder(border);

    // Update dynamic CSS variables across the document root
    const root = document.documentElement;
    root.style.setProperty('--md-sys-color-primary', cleanHex);
    root.style.setProperty('--md-sys-color-primary-container', surface);
    root.style.setProperty('--md-sys-color-primary-border', border);
    root.style.setProperty('--brand-primary', cleanHex);
    root.style.setProperty('--accent-orange', cleanHex);
    root.style.setProperty('--brand-surface', surface);
    root.style.setProperty('--surface-pale-orange', surface);
    root.style.setProperty('--brand-border', border);
    root.style.setProperty('--border-pale-orange', border);
    root.style.setProperty('--brand-glow', companions.glow);
    root.style.setProperty('--brand-primary-rgb', companions.rgbString);

    // Keep mobile web title/status bar synchronized
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', cleanHex);
    }

    try {
      localStorage.setItem('farmweather_accent_color', cleanHex);
    } catch {}
  }, []);

  const setCustomAccentColor = useCallback((color: string) => {
    applyThemeColors(color);
  }, [applyThemeColors]);

  const resetAccentColor = useCallback(() => {
    applyThemeColors('#FF7900');
  }, [applyThemeColors]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#F7F6F2';
    document.body.style.color = '#171717';
    // Initialize color on mount
    applyThemeColors(customAccentColor);
  }, [applyThemeColors, customAccentColor]);

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

  const toggleDarkMode = () => {
    // Light theme locked as per design brief
  };

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
        accentSurface,
        accentBorder,
        materialPresets: MATERIAL_COLOR_PRESETS,
        resetAccentColor,
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

