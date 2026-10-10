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
  RefreshCw,
  Download,
  Github
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
  onOpenApkModal?: () => void;
}

export const LocationsManagerScreen: React.FC<LocationsManagerScreenProps> = ({
  locations,
  activeLocation,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRefreshData,
  lastUpdated,
  onOpenApkModal,
}) => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    tempUnit, 
    toggleTempUnit, 
    windUnit, 
    toggleWindUnit,
    pressureUnit,
    togglePressureUnit
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
    <div className={`w-full min-h-full px-4 pt-3 pb-24 transition-colors ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#F8F6F0] text-stone-900'
    }`}>
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-2xl font-black tracking-tight">
          Locations & Preferences
        </h1>
        <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
          Manage saved cities, OLED display & units
        </p>
      </div>

      {/* SEARCH INPUT */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <input
          type="text"
          placeholder="Search any city or country worldwide..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-20 py-2.5 rounded-2xl text-xs font-medium border outline-hidden transition-all ${
            isDarkMode 
              ? 'bg-[#0E0E12] border-white/10 text-white focus:border-sky-500' 
              : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900'
          }`}
        />
        <Search size={15} className="absolute left-3 top-3.5 text-zinc-400" />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all"
        >
          {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* SEARCH RESULTS DROPDOWN */}
      {searchResults.length > 0 && (
        <div className="mb-4 space-y-1.5 p-2 rounded-2xl bg-zinc-900 border border-white/10">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-2 py-1">
            Search Results (Tap to add)
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
              className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-800 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MapPin size={14} className="text-sky-400 shrink-0" />
                <span className="font-bold">{loc.name}, {loc.country}</span>
              </div>
              <Plus size={14} className="text-emerald-400" />
            </button>
          ))}
        </div>
      )}

      {/* SAVED LOCATIONS CARDS */}
      <div className="mb-5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-1">
          Saved Cities
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
                      ? 'bg-[#0E0E12] border-2 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                      : 'bg-white border-2 border-stone-900 shadow-md'
                    : isDarkMode
                      ? 'bg-[#0A0A0C] border border-white/10 hover:border-white/20'
                      : 'bg-white border border-stone-200/60 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-sky-500 text-white' : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-extrabold">{loc.name}</h3>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
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

      {/* DISPLAY & THEME SETTINGS (OLED AMOLED Black requested) */}
      <div className="mb-5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-1">
          Display & Appearance
        </span>
        <div className={`rounded-2xl divide-y ${
          isDarkMode ? 'bg-[#0A0A0C] divide-white/5 border border-white/10' : 'bg-white divide-stone-100 border border-stone-200/60'
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
                  {isDarkMode ? 'True pitch-black OLED power savings' : 'Warm daytime theme'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 ${
                isDarkMode ? 'bg-sky-500' : 'bg-stone-300'
              }`}
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
                <span className="text-xs font-bold block">Temperature Unit</span>
                <span className="text-[11px] text-zinc-400">Celsius or Fahrenheit</span>
              </div>
            </div>
            <button
              onClick={toggleTempUnit}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDarkMode ? 'bg-zinc-800 text-white' : 'bg-stone-100 text-stone-800'
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
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDarkMode ? 'bg-zinc-800 text-white' : 'bg-stone-100 text-stone-800'
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
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDarkMode ? 'bg-zinc-800 text-white' : 'bg-stone-100 text-stone-800'
              }`}
            >
              {pressureUnit}
            </button>
          </div>
        </div>
      </div>

      {/* ANDROID APK & GITHUB RELEASE */}
      <div className="mb-5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-1">
          Android Build & Release
        </span>
        <div 
          onClick={onOpenApkModal}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            isDarkMode 
              ? 'bg-[#0A0A0C] border-emerald-500/30 hover:border-emerald-500/50 shadow-md' 
              : 'bg-white border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Download size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold block text-white">Android APK & GitHub Actions</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Download APK from GitHub Actions or build locally
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-500" />
        </div>
      </div>

      {/* DATA TELEMETRY ATTRIBUTION */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 text-center">
        <p className="text-[11px] text-zinc-400">
          Real-time weather data provided by{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-sky-400 font-bold underline">
            Open-Meteo
          </a>
          . Last synced at {lastUpdated}.
        </p>
      </div>
    </div>
  );
};
