import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Moon, 
  Thermometer, 
  Wind, 
  Gauge, 
  Check, 
  Search, 
  Loader2, 
  ChevronRight,
  Github,
  Palette,
  Settings,
  Globe
} from 'lucide-react';
import { useTheme, MATERIAL_ACCENT_PRESETS } from '../context/ThemeContext';
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
    isDarkMode, 
    toggleDarkMode, 
    tempUnit, 
    toggleTempUnit, 
    windUnit, 
    toggleWindUnit,
    pressureUnit,
    togglePressureUnit,
    customAccentColor,
    setCustomAccentColor,
  } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No locations found. Try another city name.');
      }
    } catch {
      setSearchError('Search failed. Check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`w-full min-h-full px-4 pt-4 pb-32 transition-colors select-none ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F2F5FA] text-slate-900'
    }`}>
      {/* HEADER */}
      <div className="mb-5">
        <h1 className="text-2xl font-black tracking-tight flex items-center space-x-2">
          <Settings size={24} style={{ color: customAccentColor }} />
          <span>App Settings</span>
        </h1>
        <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
          Custom theme colors, weather units, saved cities & user feedback
        </p>
      </div>

      {/* CUSTOM ACCENT COLOR PALETTE PICKER */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center space-x-1.5 mb-2.5 px-1"
          style={{ color: customAccentColor }}
        >
          <Palette size={14} />
          <span>Material UI Color Palette & Custom Picker</span>
        </span>

        <div className={`p-4 rounded-3xl border transition-all ${
          isDarkMode ? 'bg-[#0E121A] border-white/10 shadow-lg' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          {/* Preset Color Chips */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
            {MATERIAL_ACCENT_PRESETS.map((color) => {
              const isSelected = customAccentColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.id}
                  onClick={() => setCustomAccentColor(color.hex)}
                  className={`flex flex-col items-center p-2 rounded-2xl transition-all relative cursor-pointer ${
                    isSelected 
                      ? 'scale-105 ring-2 ring-white/70 bg-white/10 shadow-md font-black' 
                      : 'hover:scale-102 hover:bg-white/5 opacity-85'
                  }`}
                  title={color.name}
                >
                  <div 
                    className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center transition-transform"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <Check size={16} className="text-black stroke-[3]" />}
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 text-center truncate w-full ${
                    isDarkMode ? 'text-zinc-200' : 'text-slate-800'
                  }`}>
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hex Input & Native HTML Color Wheel */}
          <div className={`pt-3 border-t flex items-center justify-between ${
            isDarkMode ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customAccentColor}
                onChange={(e) => setCustomAccentColor(e.target.value)}
                className="w-9 h-9 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                title="Choose custom HEX color wheel"
              />
              <div>
                <span className={`text-xs font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Custom Hex Color Wheel
                </span>
                <span className="text-[11px] font-mono font-bold uppercase" style={{ color: customAccentColor }}>
                  {customAccentColor}
                </span>
              </div>
            </div>

            <div 
              className="px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-950 shadow-md"
              style={{ backgroundColor: customAccentColor }}
            >
              Active UI Accent
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND ADD CITIES */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          Search Worldwide Cities & Countries
        </span>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search city (e.g., London, Tokyo, New York)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-22 py-3 rounded-2xl text-xs font-bold border outline-hidden transition-all ${
              isDarkMode 
                ? 'bg-[#0E121A] border-white/10 text-white focus:border-emerald-400' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-600 shadow-xs'
            }`}
          />
          <Search size={16} className="absolute left-3 top-3.5 text-zinc-400" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3.5 py-1.5 rounded-xl text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md"
            style={{ backgroundColor: customAccentColor }}
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
          </button>
        </form>
        {searchError && (
          <p className="text-xs text-rose-400 mt-1.5 px-1 font-semibold">{searchError}</p>
        )}

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <div className={`mt-2 space-y-1.5 p-2 rounded-2xl border ${
            isDarkMode ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-2 py-1">
              Select City to Set as Active Home
            </span>
            {searchResults.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onAddLocation(loc);
                  onSelectLocation(loc);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={14} style={{ color: customAccentColor }} className="shrink-0" />
                  <span className="font-extrabold">{loc.name}, {loc.country}</span>
                </div>
                <Plus size={14} style={{ color: customAccentColor }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SAVED LOCATIONS LIST */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          Saved Cities
        </span>

        <div className="space-y-2">
          {locations.map((loc) => {
            const isSelected = loc.id === activeLocation.id;
            return (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-[#101622] border-2 shadow-lg'
                      : 'bg-white border-2 shadow-md'
                    : isDarkMode
                      ? 'bg-[#0E121A] border border-white/10 hover:border-white/20'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
                }`}
                style={{
                  borderColor: isSelected ? customAccentColor : undefined
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                      isSelected ? 'text-slate-950' : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                    }`}
                    style={{
                      backgroundColor: isSelected ? customAccentColor : undefined
                    }}
                  >
                    <MapPin size={17} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {loc.name}
                      </h3>
                      {isSelected && (
                        <span 
                          className="px-2 py-0.2 rounded-full text-[9px] font-black"
                          style={{
                            backgroundColor: `${customAccentColor}25`,
                            color: customAccentColor
                          }}
                        >
                          Active Home
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {loc.region ? `${loc.region}, ` : ''}{loc.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {locations.length > 1 && !isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLocation(loc.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove City"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <ChevronRight size={16} className="text-zinc-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISPLAY & THEME SETTINGS */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          System Units & OLED Display
        </span>
        <div className={`rounded-3xl divide-y ${
          isDarkMode 
            ? 'bg-[#0E121A] divide-white/5 border border-white/10' 
            : 'bg-white divide-slate-100 border border-slate-200 shadow-xs'
        }`}>
          {/* PURE OLED DARK MODE */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Moon size={18} />
              </div>
              <div>
                <span className={`text-xs font-extrabold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Pure AMOLED Black (#000000)
                </span>
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {isDarkMode ? 'True pitch-black OLED display' : 'Light high-contrast day theme'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer"
              style={{ backgroundColor: isDarkMode ? customAccentColor : '#CBD5E1' }}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                  isDarkMode ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* TEMPERATURE UNIT */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Thermometer size={18} />
              </div>
              <div>
                <span className={`text-xs font-extrabold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Temperature Unit
                </span>
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Celsius (°C) or Fahrenheit (°F)
                </span>
              </div>
            </div>
            <button
              onClick={toggleTempUnit}
              className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              °{tempUnit}
            </button>
          </div>

          {/* WIND SPEED UNIT */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wind size={18} />
              </div>
              <div>
                <span className={`text-xs font-extrabold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Wind Speed Unit
                </span>
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Kilometers per hour or Miles per hour
                </span>
              </div>
            </div>
            <button
              onClick={toggleWindUnit}
              className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {windUnit}
            </button>
          </div>

          {/* PRESSURE UNIT */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Gauge size={18} />
              </div>
              <div>
                <span className={`text-xs font-extrabold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Barometer Unit
                </span>
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Hectopascals (hPa) or Inches of Mercury (inHg)
                </span>
              </div>
            </div>
            <button
              onClick={togglePressureUnit}
              className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {pressureUnit}
            </button>
          </div>
        </div>
      </div>

      {/* GITHUB REPOSITORY LINK */}
      <div className="mb-6">
        <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          GitHub Source Repository
        </span>
        <a 
          href="https://github.com/mahesh2008here-star/Wheather-pro"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-4 rounded-3xl border transition-all flex items-center justify-between group cursor-pointer ${
            isDarkMode 
              ? 'bg-[#0E121A] border-white/10 hover:border-emerald-400 text-white' 
              : 'bg-white border-slate-200 hover:border-emerald-600 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
              isDarkMode ? 'bg-zinc-900 text-white group-hover:text-emerald-400' : 'bg-slate-100 text-slate-800 group-hover:text-emerald-600'
            }`}>
              <Github size={20} />
            </div>
            <div>
              <span className="text-xs font-black block">mahesh2008here-star / Wheather-pro</span>
              <p className={`text-[11px] mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                View project source code, APK workflow & commits on GitHub
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-500 transition-colors" style={{ color: customAccentColor }} />
        </a>
      </div>

      {/* RATING AND FEEDBACK SECTION MOVED TO SETTINGS (Dispatches to mmmmahe46@gmail.com) */}
      <div className="mb-6">
        <RatingFeedbackSection location={activeLocation} />
      </div>

      {/* DATA ATTRIBUTION */}
      <div className={`p-4 rounded-2xl text-center border ${
        isDarkMode ? 'bg-black border-white/10 text-zinc-400' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
      }`}>
        <p className="text-[11px] font-medium flex items-center justify-center space-x-1">
          <Globe size={13} style={{ color: customAccentColor }} />
          <span>Real-time weather data provided by</span>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="font-extrabold underline" style={{ color: customAccentColor }}>
            Open-Meteo
          </a>
          <span>. Last synced at {lastUpdated}.</span>
        </p>
      </div>
    </div>
  );
};
