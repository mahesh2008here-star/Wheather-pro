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
    <div className="w-full px-4 pt-3 pb-32 select-none">
      {/* HEADER */}
      <div className="mb-3.5 px-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#FFF0E4] text-[#FF7900] border border-[#E9E7E1]">
            <Sliders size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#171717]">
              Settings & Preferences
            </h1>
            <p className="text-xs mt-0.5 font-medium text-[#737873]">
              Measurement units, farm parcels & feedback
            </p>
          </div>
        </div>
      </div>

      {/* 1. UNIT TOGGLES CARD */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 text-[#FF7900]">
          Measurement Units
        </span>

        <div className="rounded-[28px] border border-[#E9E7E1] bg-white shadow-xs divide-y divide-[#E9E7E1] overflow-hidden">
          {/* Temperature */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Thermometer size={16} className="text-[#FF7900]" />
              <div>
                <span className="text-xs font-bold block text-[#171717]">Temperature Unit</span>
                <span className="text-[10px] text-[#737873]">
                  Celsius (°C) or Fahrenheit (°F)
                </span>
              </div>
            </div>
            <button
              onClick={toggleTempUnit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer snappy-touch border bg-[#FFF0E4] text-[#FF7900] border-[#FFE1CB]"
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

      {/* 2. SAVED LOCATIONS & SEARCH */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider block mb-1.5 px-1 text-[#FF7900]">
          Saved Farm Parcels
        </span>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-2">
          <input
            type="text"
            placeholder="Search worldwide city or agricultural district..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 rounded-2xl text-xs font-bold border border-[#E9E7E1] bg-white text-[#171717] focus:border-[#FF7900] outline-none transition-all shadow-xs"
          />
          <Search size={15} className="absolute left-3 top-3 text-[#737873]" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1 rounded-xl bg-[#FF7900] text-white text-xs font-bold cursor-pointer snappy-touch shadow-xs"
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
                  <MapPin size={14} className="text-[#FF7900]" />
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
                  isSelected ? 'bg-[#FFF0E4]' : 'hover:bg-[#F7F6F2]'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <MapPin size={15} className={isSelected ? 'text-[#FF7900]' : 'text-[#AAAFA9]'} />
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
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-[#FF7900] border border-[#FFE1CB]">
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
