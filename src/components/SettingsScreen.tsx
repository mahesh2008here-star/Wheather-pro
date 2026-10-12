import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Thermometer, 
  Wind, 
  Gauge, 
  Search, 
  Loader2, 
  ChevronRight,
  Github,
  Sliders,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Bell,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../context/WeatherContext';
import { LocationInfo } from '../types/weather';
import { searchLocations } from '../services/weatherApi';
import { RatingFeedbackSection } from './RatingFeedbackSection';

interface SettingsScreenProps {
  locations: LocationInfo[];
  activeLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  onAddLocation: (loc: LocationInfo) => void;
  onDeleteLocation: (id: string) => void;
  onRefreshData: () => void;
  lastUpdated: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  locations,
  activeLocation,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  lastUpdated,
}) => {
  const { 
    tempUnit, 
    toggleTempUnit, 
    windUnit, 
    toggleWindUnit, 
    pressureUnit, 
    togglePressureUnit, 
    customAccentColor,
    setCustomAccentColor,
    accentSurface,
    accentBorder,
    materialPresets,
    resetAccentColor,
  } = useTheme();

  const { 
    dataState, 
    isStale, 
    lastUpdatedLabel, 
    provider, 
    dataQuality, 
    refreshWeather, 
    isLoading 
  } = useWeather();

  const [hexInput, setHexInput] = useState(customAccentColor);

  // Agricultural Alerts Config State
  const [alertSettings, setAlertSettings] = useState({
    rainAlert: true,
    heatAlert: true,
    frostAlert: true,
    windAlert: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('farmweather_alert_settings');
      if (saved) setAlertSettings(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleAlertSetting = (key: keyof typeof alertSettings) => {
    setAlertSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem('farmweather_alert_settings', JSON.stringify(next)); } catch {}
      return next;
    });
    try { navigator.vibrate?.(10); } catch {}
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setHexInput(customAccentColor);
  }, [customAccentColor]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#') && val.length > 0) {
      val = `#${val}`;
    }
    setHexInput(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      setCustomAccentColor(val);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchLocations(searchQuery);
      if (results.length === 0) {
        setSearchError('No matching farm or city locations found.');
      }
      setSearchResults(results);
    } catch {
      setSearchError('Search failed. Please check network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddAndSelect = (loc: LocationInfo) => {
    onAddLocation(loc);
    onSelectLocation(loc);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="w-full px-4 pt-3 pb-36 sm:pb-40 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#E9E7E1] transition-colors"
            style={{ backgroundColor: accentSurface, color: customAccentColor }}
          >
            <Sliders size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#171717]">
              Settings & Preferences
            </h1>
            <p className="text-xs mt-0.5 font-medium text-[#737873]">
              Material theme, measurement units & farm parcels
            </p>
          </div>
        </div>
      </div>

      {/* 1. MATERIAL THEME & CUSTOM COLOR PICKER */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span 
            className="text-[10px] font-black uppercase tracking-wider block transition-colors"
            style={{ color: customAccentColor }}
          >
            Material Design 3 Theme Color
          </span>
          <button
            onClick={resetAccentColor}
            className="flex items-center space-x-1 text-[10px] font-bold text-[#737873] hover:text-[#171717] cursor-pointer"
            title="Reset to default Farm Orange"
          >
            <RotateCcw size={10} />
            <span>Reset Default</span>
          </button>
        </div>

        <div className="rounded-[28px] border border-[#E9E7E1] bg-white p-4 shadow-xs space-y-4">
          {/* Interactive Custom Color Picker & Live Hex Box */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1]">
            <div className="flex items-center space-x-3 min-w-0">
              {/* Native Color Picker Swatch Trigger */}
              <label 
                className="relative w-10 h-10 rounded-2xl cursor-pointer shadow-xs border-2 border-white flex items-center justify-center shrink-0 transition-transform active:scale-95"
                style={{ backgroundColor: customAccentColor }}
                title="Click to open color picker wheel"
              >
                <input
                  type="color"
                  value={customAccentColor}
                  onChange={(e) => {
                    setCustomAccentColor(e.target.value);
                    setHexInput(e.target.value);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Custom color picker"
                />
                <Palette size={16} className="text-white drop-shadow-sm pointer-events-none" />
              </label>

              <div className="min-w-0">
                <span className="text-xs font-bold text-[#171717] block">
                  Custom Color Picker
                </span>
                <span className="text-[10px] text-[#737873] block truncate">
                  Pick any hue or type hex code
                </span>
              </div>
            </div>

            {/* Hex Input Field */}
            <div className="flex items-center space-x-1 shrink-0">
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                maxLength={7}
                placeholder="#FF7900"
                className="w-22 px-2 py-1 rounded-xl text-xs font-black font-mono-numbers uppercase border border-[#E9E7E1] bg-white text-[#171717] focus:outline-none focus:border-[#171717] text-center shadow-xs"
                aria-label="Hex color code"
              />
            </div>
          </div>

          {/* Curated Material Design 3 Palettes Grid */}
          <div>
            <span className="text-[11px] font-bold text-[#171717] block mb-2 px-0.5">
              Material Design 3 Palettes
            </span>
            <div className="grid grid-cols-2 gap-2">
              {materialPresets.map(preset => {
                const isActive = preset.hex.toLowerCase() === customAccentColor.toLowerCase();

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCustomAccentColor(preset.hex);
                      setHexInput(preset.hex);
                      try { navigator.vibrate?.(8); } catch {}
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer snappy-touch ${
                      isActive
                        ? 'border-[#171717] shadow-xs'
                        : 'border-[#E9E7E1] hover:border-[#AAAFA9] bg-white'
                    }`}
                    style={isActive ? { backgroundColor: preset.surface } : undefined}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center shadow-xs border border-white/60"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isActive && <Check size={11} className="text-white stroke-[3]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#171717] block truncate">
                        {preset.name}
                      </span>
                      <span className="text-[9px] text-[#737873] block uppercase tracking-wider font-semibold truncate">
                        {preset.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Theme Preview Strip */}
          <div className="pt-2 border-t border-[#E9E7E1]">
            <span className="text-[10px] font-bold text-[#737873] uppercase tracking-wider block mb-2 px-0.5">
              Live Theme Preview
            </span>
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1]">
              <div
                className="px-3 py-1.5 rounded-full text-xs font-black shadow-xs flex items-center space-x-1.5 transition-colors"
                style={{
                  backgroundColor: accentSurface,
                  color: customAccentColor,
                  border: `1px solid ${accentBorder}`,
                }}
              >
                <Sparkles size={13} />
                <span>Active Pill</span>
              </div>

              <div
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors"
                style={{ backgroundColor: customAccentColor }}
              >
                Theme Button
              </div>

              <span className="text-[11px] font-mono-numbers font-bold text-[#737873] ml-auto">
                {customAccentColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UNIT TOGGLES CARD */}
      <div className="mb-4">
        <span 
          className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 transition-colors"
          style={{ color: customAccentColor }}
        >
          Measurement Units
        </span>

        <div className="rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs divide-y divide-[#E9E7E1] overflow-hidden">
          {/* Temperature */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Thermometer size={16} style={{ color: customAccentColor }} />
              <div>
                <span className="text-xs font-bold block text-[#171717]">Temperature Unit</span>
                <span className="text-[10px] text-[#737873]">
                  Celsius (°C) or Fahrenheit (°F)
                </span>
              </div>
            </div>
            <button
              onClick={toggleTempUnit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer snappy-touch border transition-colors"
              style={{
                backgroundColor: accentSurface,
                color: customAccentColor,
                borderColor: accentBorder,
              }}
            >
              °{tempUnit}
            </button>
          </div>

          {/* Wind Speed */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wind size={16} className="text-[#10B981]" />
              <div>
                <span className="text-xs font-bold block text-[#171717]">Wind Velocity</span>
                <span className="text-[10px] text-[#737873]">
                  Kilometers per hour (km/h) or Miles per hour (mph)
                </span>
              </div>
            </div>
            <button
              onClick={toggleWindUnit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer snappy-touch border bg-[#E5F5EC] text-[#10B981] border-[#CEEFDB]"
            >
              {windUnit}
            </button>
          </div>

          {/* Pressure */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gauge size={16} className="text-[#7C3AED]" />
              <div>
                <span className="text-xs font-bold block text-[#171717]">Barometer Pressure</span>
                <span className="text-[10px] text-[#737873]">
                  Hectopascals (hPa) or Inches of Mercury (inHg)
                </span>
              </div>
            </div>
            <button
              onClick={togglePressureUnit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer snappy-touch border bg-[#EFECFF] text-[#7C3AED] border-[#DDD7FF]"
            >
              {pressureUnit}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SAVED LOCATIONS & SEARCH */}
      <div className="mb-4">
        <span 
          className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 transition-colors"
          style={{ color: customAccentColor }}
        >
          Saved Farm Parcels
        </span>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-2">
          <input
            type="text"
            placeholder="Search worldwide city or agricultural district..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 rounded-2xl text-xs font-bold border border-[#E9E7E1] bg-white text-[#171717] outline-none transition-all shadow-xs"
            style={{ borderColor: searchQuery ? customAccentColor : undefined }}
          />
          <Search size={15} className="absolute left-3 top-3 text-[#737873]" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1 rounded-xl text-white text-xs font-bold cursor-pointer snappy-touch shadow-xs transition-colors"
            style={{ backgroundColor: customAccentColor }}
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-600 mb-2 px-1 font-semibold">{searchError}</p>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-2 p-2 rounded-2xl border border-[#E9E7E1] bg-white space-y-1 shadow-xs">
            <span className="text-[10px] font-bold px-2 py-0.5 text-[#737873] block">
              Search Results
            </span>
            {searchResults.map(result => (
              <div
                key={result.id}
                onClick={() => handleAddAndSelect(result)}
                className="p-2.5 rounded-xl flex items-center justify-between cursor-pointer snappy-touch hover:bg-[#F7F6F2] transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={14} style={{ color: customAccentColor }} />
                  <span className="text-xs font-bold text-[#171717]">{result.name}, {result.country}</span>
                </div>
                <span className="text-xs font-black text-[#10B981] flex items-center space-x-1">
                  <Plus size={13} />
                  <span>Add</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Saved List */}
        <div className="rounded-[28px] border border-[#E9E7E1] bg-white divide-y divide-[#E9E7E1] overflow-hidden shadow-xs">
          {locations.map(loc => {
            const isSelected = loc.id === activeLocation.id;
            return (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className={`p-3.5 flex items-center justify-between cursor-pointer snappy-touch transition-colors ${
                  isSelected ? '' : 'hover:bg-[#F7F6F2]'
                }`}
                style={isSelected ? { backgroundColor: accentSurface } : undefined}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <MapPin 
                    size={15} 
                    className={isSelected ? '' : 'text-[#AAAFA9]'} 
                    style={isSelected ? { color: customAccentColor } : undefined}
                  />
                  <div className="min-w-0">
                    <span className={`text-xs block truncate text-[#171717] ${isSelected ? 'font-black' : 'font-semibold'}`}>
                      {loc.name}
                    </span>
                    <span className="text-[10px] text-[#737873]">
                      {loc.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <span 
                      className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border transition-colors"
                      style={{ color: customAccentColor, borderColor: accentBorder }}
                    >
                      Active
                    </span>
                  )}
                  {locations.length > 1 && !isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLocation(loc.id);
                      }}
                      className="p-1 text-[#737873] hover:text-rose-600 cursor-pointer"
                      title="Remove Location"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CONFIGURABLE AGRICULTURAL ALERTS */}
      <div className="mb-4">
        <span 
          className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 transition-colors"
          style={{ color: customAccentColor }}
        >
          Configurable Weather Alerts
        </span>

        <div className="rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs divide-y divide-[#E9E7E1] overflow-hidden">
          {/* Rain Alert */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Bell size={16} className="text-[#0284C7]" />
              <div>
                <span className="text-xs font-bold text-[#171717] block">Rain & Irrigation Risk Warning</span>
                <span className="text-[10px] text-[#737873]">Notify when rain probability exceeds 35%</span>
              </div>
            </div>
            <button
              onClick={() => toggleAlertSetting('rainAlert')}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 relative ${
                alertSettings.rainAlert ? 'bg-[#10B981]' : 'bg-[#E9E7E1]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                alertSettings.rainAlert ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Frost Alert */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Bell size={16} className="text-[#0284C7]" />
              <div>
                <span className="text-xs font-bold text-[#171717] block">Frost & Freeze Hazard Warning</span>
                <span className="text-[10px] text-[#737873]">Alert when field temperature drops below 3°C</span>
              </div>
            </div>
            <button
              onClick={() => toggleAlertSetting('frostAlert')}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 relative ${
                alertSettings.frostAlert ? 'bg-[#10B981]' : 'bg-[#E9E7E1]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                alertSettings.frostAlert ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Wind Alert */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Bell size={16} className="text-[#FF7900]" />
              <div>
                <span className="text-xs font-bold text-[#171717] block">High Wind & Spray Drift Alert</span>
                <span className="text-[10px] text-[#737873]">Alert when wind exceeds 20 km/h threshold</span>
              </div>
            </div>
            <button
              onClick={() => toggleAlertSetting('windAlert')}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 relative ${
                alertSettings.windAlert ? 'bg-[#10B981]' : 'bg-[#E9E7E1]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                alertSettings.windAlert ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. DATA PROVIDER & 15-MINUTE BACKGROUND REFRESH STATUS */}
      <div className="mb-4">
        <span 
          className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 transition-colors"
          style={{ color: customAccentColor }}
        >
          Weather Data Source & Refresh Status
        </span>

        <div className="p-4 rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={18} className="text-[#10B981]" />
              <div>
                <span className="text-xs font-black text-[#171717] block">{provider}</span>
                <span className="text-[10px] font-medium text-[#737873]">{dataQuality}</span>
              </div>
            </div>

            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              isStale 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-[#E5F5EC] text-[#10B981] border-[#CEEFDB]'
            }`}>
              {isStale ? 'Stale Data' : 'Live Sync'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F7F6F2] border border-[#E9E7E1] text-xs space-y-1 text-[#444746]">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#737873]">Refresh Schedule:</span>
              <span className="font-bold text-[#171717]">Every 15 minutes (Periodic Work)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#737873]">Last Successful Fetch:</span>
              <span className="font-bold text-[#171717]">{lastUpdatedLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#737873]">Attribution:</span>
              <span className="font-bold text-[#171717]">Open-Meteo CC BY 4.0</span>
            </div>
          </div>

          <button
            onClick={() => refreshWeather()}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 text-white cursor-pointer snappy-touch shadow-xs"
            style={{ backgroundColor: customAccentColor }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing Weather Telemetry...' : 'Sync Telemetry Now'}</span>
          </button>
        </div>
      </div>

      {/* 5. COMMUNITY FEEDBACK SECTION */}
      <div className="mb-4">
        <RatingFeedbackSection location={activeLocation} />
      </div>

      {/* 6. GITHUB REPOSITORY & ATTRIBUTION */}
      <div className="space-y-2">
        <a 
          href="https://github.com/mahesh2008here-star/Wheather-pro"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-[24px] border border-[#E9E7E1] bg-white hover:bg-[#F7F6F2] flex items-center justify-between text-xs font-bold cursor-pointer transition-colors shadow-xs"
        >
          <div className="flex items-center space-x-2.5 text-[#171717]">
            <Github size={17} />
            <div>
              <span className="block font-black">mahesh2008here-star / Wheather-pro</span>
              <span className="text-[10px] block text-[#737873]">
                Inspect GitHub repository and releases
              </span>
            </div>
          </div>
          <ChevronRight size={15} className="opacity-50 text-[#171717]" />
        </a>

        <div className="p-3 rounded-2xl text-center border border-[#E9E7E1] bg-white text-[#737873] text-[11px]">
          <span>Telemetry provided by <strong>Open-Meteo API</strong> • Synced {lastUpdated || 'recently'}</span>
        </div>
      </div>
    </div>
  );
};
