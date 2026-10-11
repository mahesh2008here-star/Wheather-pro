import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
    tempUnit, 
    toggleTempUnit, 
    windUnit, 
    toggleWindUnit, 
    pressureUnit, 
    togglePressureUnit, 
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
    <div className="w-full px-4 pt-3 pb-24 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isDarkMode ? 'bg-[#18261E] text-[#10B981]' : 'bg-[#EAF5EF] text-[#1B4332]'
          }`}>
            <Sliders size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Settings & Preferences
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              Measurement units, farm parcels & feedback
            </p>
          </div>
        </div>
      </div>

      {/* 1. UNIT TOGGLES CARD */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 text-[#10B981]">
          Measurement Units
        </span>

        <div className={`rounded-[26px] border shadow-xs divide-y transition-colors overflow-hidden ${
          isDarkMode 
            ? 'bg-[#121814] border-[#1E2821] divide-[#1E2821] text-[#F3F6F4]' 
            : 'bg-[#FFFFFF] border-[#E8E6DF] divide-[#E8E6DF] text-[#121814]'
        }`}>
          {/* Temperature */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Thermometer size={16} className="text-[#FF5C00]" />
              <div>
                <span className="text-xs font-bold block">Temperature Unit</span>
                <span className={`text-[10px] ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
                  Celsius (°C) or Fahrenheit (°F)
                </span>
              </div>
            </div>
            <button
              onClick={toggleTempUnit}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer snappy-touch border ${
                isDarkMode 
                  ? 'bg-[#1E2821] text-[#10B981] border-[#2D3F34]' 
                  : 'bg-[#EAF5EF] text-[#1B4332] border-[#C5E4D2]'
              }`}
            >
              °{tempUnit}
            </button>
          </div>

          {/* Wind Speed */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wind size={16} className="text-[#10B981]" />
              <div>
                <span className="text-xs font-bold block">Wind Velocity</span>
                <span className={`text-[10px] ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
                  Kilometers per hour (km/h) or Miles per hour (mph)
                </span>
              </div>
            </div>
            <button
              onClick={toggleWindUnit}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer snappy-touch border ${
                isDarkMode 
                  ? 'bg-[#1E2821] text-[#10B981] border-[#2D3F34]' 
                  : 'bg-[#EAF5EF] text-[#1B4332] border-[#C5E4D2]'
              }`}
            >
              {windUnit}
            </button>
          </div>

          {/* Pressure */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gauge size={16} className="text-amber-500" />
              <div>
                <span className="text-xs font-bold block">Barometer Pressure</span>
                <span className={`text-[10px] ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
                  Hectopascals (hPa) or Inches of Mercury (inHg)
                </span>
              </div>
            </div>
            <button
              onClick={togglePressureUnit}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer snappy-touch border ${
                isDarkMode 
                  ? 'bg-[#1E2821] text-[#10B981] border-[#2D3F34]' 
                  : 'bg-[#EAF5EF] text-[#1B4332] border-[#C5E4D2]'
              }`}
            >
              {pressureUnit}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SAVED LOCATIONS & SEARCH */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 text-[#10B981]">
          Saved Farm Parcels
        </span>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-2">
          <input
            type="text"
            placeholder="Search worldwide city or agricultural district..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-20 py-2.5 rounded-2xl text-xs font-bold border outline-none transition-all ${
              isDarkMode 
                ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4] focus:border-[#10B981]' 
                : 'bg-white border-[#E8E6DF] text-[#121814] focus:border-[#1B4332]'
            }`}
          />
          <Search size={15} className="absolute left-3 top-3 text-[#5D6861] dark:text-[#89998F]" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1 rounded-xl bg-[#1B4332] hover:bg-[#12281E] text-white text-xs font-bold cursor-pointer snappy-touch"
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-500 mb-2 px-1 font-semibold">{searchError}</p>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={`mb-2 p-2 rounded-2xl border space-y-1 ${
            isDarkMode ? 'bg-[#121814] border-[#1E2821]' : 'bg-white border-[#E8E6DF]'
          }`}>
            <span className="text-[10px] font-bold px-2 py-0.5 text-[#5D6861] dark:text-[#89998F] block">
              Search Results
            </span>
            {searchResults.map(result => (
              <div
                key={result.id}
                onClick={() => handleAddAndSelect(result)}
                className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer snappy-touch transition-colors ${
                  isDarkMode ? 'hover:bg-[#162019]' : 'hover:bg-[#F8F7F4]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-[#FF5C00]" />
                  <span className="text-xs font-bold">{result.name}, {result.country}</span>
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
        <div className={`rounded-[26px] border divide-y overflow-hidden shadow-xs transition-colors ${
          isDarkMode 
            ? 'bg-[#121814] border-[#1E2821] divide-[#1E2821]' 
            : 'bg-white border-[#E8E6DF] divide-[#E8E6DF]'
        }`}>
          {locations.map(loc => {
            const isSelected = loc.id === activeLocation.id;
            return (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className={`p-3.5 flex items-center justify-between cursor-pointer snappy-touch transition-colors ${
                  isSelected 
                    ? isDarkMode ? 'bg-[#162019]' : 'bg-[#F8F7F4]' 
                    : isDarkMode ? 'hover:bg-[#162019]' : 'hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <MapPin size={15} className={isSelected ? 'text-[#FF5C00]' : 'opacity-40'} />
                  <div className="min-w-0">
                    <span className={`text-xs block truncate ${isSelected ? 'font-black' : 'font-semibold'}`}>
                      {loc.name}
                    </span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
                      {loc.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981]">
                      Active
                    </span>
                  )}
                  {locations.length > 1 && !isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLocation(loc.id);
                      }}
                      className="p-1 text-[#5D6861] hover:text-rose-500 cursor-pointer"
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

      {/* 3. COMMUNITY FEEDBACK SECTION */}
      <div className="mb-4">
        <RatingFeedbackSection location={activeLocation} />
      </div>

      {/* 4. GITHUB REPOSITORY & TELEMETRY ATTRIBUTION */}
      <div className="space-y-2">
        <a 
          href="https://github.com/mahesh2008here-star/Wheather-pro"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-3.5 rounded-[22px] border flex items-center justify-between text-xs font-bold cursor-pointer transition-colors ${
            isDarkMode ? 'bg-[#121814] border-[#1E2821] hover:bg-[#162019]' : 'bg-white border-[#E8E6DF] hover:bg-[#F8F7F4]'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Github size={17} />
            <div>
              <span className="block font-black">mahesh2008here-star / Wheather-pro</span>
              <span className={`text-[10px] block ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
                Inspect GitHub repository and releases
              </span>
            </div>
          </div>
          <ChevronRight size={15} className="opacity-50" />
        </a>

        <div className={`p-3 rounded-2xl text-center border text-[11px] ${
          isDarkMode ? 'bg-[#162019] border-[#1E2821] text-[#89998F]' : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#5D6861]'
        }`}>
          <span>Telemetry provided by <strong>Open-Meteo API</strong> • Synced {lastUpdated || 'recently'}</span>
        </div>
      </div>
    </div>
  );
};
