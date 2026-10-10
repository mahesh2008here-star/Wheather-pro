import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Moon, 
  Sun, 
  Thermometer, 
  Wind, 
  Gauge, 
  Check, 
  Search, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  Github,
  Sparkles,
  Palette,
  Type
} from 'lucide-react';
import { useTheme, ACCENT_PRESETS } from '../context/ThemeContext';
import { LocationInfo } from '../types/weather';
import { searchLocations } from '../services/weatherApi';

interface LocationsManagerScreenProps {
  locations: LocationInfo[];
  activeLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  onAddLocation: (loc: LocationInfo) => void;
  onDeleteLocation: (id: string) => void;
  onRefreshData: () => void;
  lastUpdated: string;
}

export const LocationsManagerScreen: React.FC<LocationsManagerScreenProps> = ({
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
    xRealityMode,
    toggleXRealityMode,
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
    <div className={`w-full min-h-full px-4 pt-4 pb-24 transition-colors ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F2F5FA] text-slate-900'
    }`}>
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-2xl font-black tracking-tight flex items-center space-x-2">
          <span>Locations & Customization</span>
        </h1>
        <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          Sony X-Reality boost, color picker, eye-catching fonts & saved cities
        </p>
      </div>

      {/* SONY X-REALITY ENGINE HERO CARD */}
      <div className={`p-4 rounded-3xl border mb-5 transition-all relative overflow-hidden ${
        xRealityMode 
          ? isDarkMode
            ? 'bg-gradient-to-br from-[#121824] via-[#0E1522] to-[#0A0E18] border-teal-400/40 shadow-[0_4px_24px_rgba(0,242,180,0.18)]'
            : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-white border-teal-300 shadow-md'
          : isDarkMode
            ? 'bg-[#0E0E14] border-white/10'
            : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black transition-colors ${
              xRealityMode 
                ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/30' 
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              <Sparkles size={22} className={xRealityMode ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black tracking-tight">Sony X-Reality Engine</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  xRealityMode ? 'bg-teal-400/20 text-teal-400 border border-teal-400/40' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {xRealityMode ? 'Active Boost' : 'Standard'}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                Triluminos color gamut, micro-contrast enhancement & super-vibrant scenery
              </p>
            </div>
          </div>

          <button
            onClick={toggleXRealityMode}
            className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
              xRealityMode ? 'bg-teal-400 shadow-sm shadow-teal-400/50' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                xRealityMode ? 'translate-x-5.5 bg-white' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* CUSTOM ACCENT COLOR PICKER */}
      <div className="mb-5">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5 px-1">
          <Palette size={13} className="text-teal-400" />
          <span>Custom UI Color Palette</span>
        </span>

        <div className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-[#0E121A] border-white/10' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Preset Chips */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3.5">
            {ACCENT_PRESETS.map((color) => {
              const isSelected = customAccentColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.id}
                  onClick={() => setCustomAccentColor(color.hex)}
                  className={`flex flex-col items-center p-2 rounded-2xl transition-all relative ${
                    isSelected 
                      ? 'scale-105 ring-2 ring-white/60 bg-white/10 shadow-lg' 
                      : 'hover:scale-102 hover:bg-white/5 opacity-80'
                  }`}
                  title={color.name}
                >
                  <div 
                    className="w-7 h-7 rounded-xl shadow-md flex items-center justify-center transition-transform"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <Check size={14} className="text-black stroke-[3]" />}
                  </div>
                  <span className="text-[9px] font-bold mt-1 text-center truncate w-full opacity-90">
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hex Input & Native HTML Color Picker */}
          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <input
                type="color"
                value={customAccentColor}
                onChange={(e) => setCustomAccentColor(e.target.value)}
                className="w-8 h-8 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                title="Choose custom HEX color"
              />
              <div>
                <span className="text-xs font-bold block">Custom Color Wheel</span>
                <span className="text-[10px] text-zinc-400 font-mono uppercase">{customAccentColor}</span>
              </div>
            </div>

            <div 
              className="px-3 py-1 rounded-xl text-[11px] font-black border text-slate-950 shadow-sm"
              style={{ backgroundColor: customAccentColor }}
            >
              Live Accent
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div className="mb-4">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          Search Worldwide Cities
        </span>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search any city or country (e.g., Tokyo, Mumbai, London)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-20 py-3 rounded-2xl text-xs font-medium border outline-hidden transition-all ${
              isDarkMode 
                ? 'bg-[#0E121A] border-white/10 text-white focus:border-teal-400' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-teal-600'
            }`}
          />
          <Search size={16} className="absolute left-3 top-3.5 text-zinc-400" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-500 text-slate-950 text-xs font-bold transition-all cursor-pointer"
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
          </button>
        </form>
        {searchError && (
          <p className="text-xs text-rose-400 mt-1.5 px-1">{searchError}</p>
        )}
      </div>

      {/* SEARCH RESULTS DROPDOWN */}
      {searchResults.length > 0 && (
        <div className="mb-4 space-y-1.5 p-2 rounded-2xl bg-zinc-900 border border-white/10">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-2 py-1">
            Search Results (Tap to select)
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
              className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800 flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <MapPin size={14} className="text-teal-400 shrink-0" />
                <span className="font-bold">{loc.name}, {loc.country}</span>
              </div>
              <Plus size={14} className="text-teal-400" />
            </button>
          ))}
        </div>
      )}

      {/* SAVED LOCATIONS CARDS */}
      <div className="mb-5">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          Saved Cities (Always Remembered)
        </span>

        <div className="space-y-2">
          {locations.map((loc) => {
            const isSelected = loc.id === activeLocation.id;
            return (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-[#101622] border-2 border-teal-400 shadow-[0_0_24px_rgba(0,242,180,0.25)]'
                      : 'bg-white border-2 border-teal-600 shadow-md'
                    : isDarkMode
                      ? 'bg-[#0E121A] border border-white/10 hover:border-white/20'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-teal-400 text-slate-950 font-black' : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-extrabold">{loc.name}</h3>
                      {isSelected && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-teal-400/20 text-teal-400">
                          Active Home
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
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
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
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

      {/* DISPLAY & THEME SETTINGS (OLED AMOLED Black) */}
      <div className="mb-5">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          System Units & OLED Display
        </span>
        <div className={`rounded-2xl divide-y ${
          isDarkMode ? 'bg-[#0E121A] divide-white/5 border border-white/10' : 'bg-white divide-slate-100 border border-slate-200'
        }`}>
          {/* OLED BLACK SWITCH */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Moon size={18} />
              </div>
              <div>
                <span className="text-xs font-bold block">Pure AMOLED Black (#000000)</span>
                <span className="text-[11px] text-zinc-400">
                  {isDarkMode ? 'True pitch-black OLED display' : 'Daylight high-contrast theme'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                isDarkMode ? 'bg-teal-400' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                  isDarkMode ? 'translate-x-5.5 bg-white' : 'translate-x-0'
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
                <span className="text-xs font-bold block">Temperature Unit</span>
                <span className="text-[11px] text-zinc-400">Celsius or Fahrenheit</span>
              </div>
            </div>
            <button
              onClick={toggleTempUnit}
              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
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
                <span className="text-xs font-bold block">Wind Speed Unit</span>
                <span className="text-[11px] text-zinc-400">km/h or mph</span>
              </div>
            </div>
            <button
              onClick={toggleWindUnit}
              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
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
                <span className="text-xs font-bold block">Barometer Unit</span>
                <span className="text-[11px] text-zinc-400">hPa or inHg</span>
              </div>
            </div>
            <button
              onClick={togglePressureUnit}
              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {pressureUnit}
            </button>
          </div>
        </div>
      </div>

      {/* GITHUB REPOSITORY LINK COLUMN */}
      <div className="mb-5">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          Source Repository
        </span>
        <a 
          href="https://github.com/mahesh2008here-star/Wheather-pro"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-4 rounded-3xl border transition-all flex items-center justify-between group cursor-pointer ${
            isDarkMode 
              ? 'bg-[#0E121A] border-white/10 hover:border-teal-400 text-white' 
              : 'bg-white border-slate-200 hover:border-teal-500 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
              isDarkMode ? 'bg-zinc-900 text-white group-hover:text-teal-400' : 'bg-slate-100 text-slate-800 group-hover:text-teal-600'
            }`}>
              <Github size={20} />
            </div>
            <div>
              <span className="text-xs font-black block">mahesh2008here-star / Wheather-pro</span>
              <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                View project source code, APK workflow & commits on GitHub
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-teal-400 transition-colors" />
        </a>
      </div>

      {/* DATA TELEMETRY ATTRIBUTION */}
      <div className="p-4 rounded-2xl bg-black border border-white/10 text-center">
        <p className="text-[11px] text-zinc-400">
          Real-time weather data provided by{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-teal-400 font-bold underline">
            Open-Meteo
          </a>
          . Last synced at {lastUpdated}.
        </p>
      </div>
    </div>
  );
};
