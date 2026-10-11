import React, { useState } from 'react';
import { MapPin, X, Crosshair, Search, Plus, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWeather } from '../../context/WeatherContext';
import { LocationInfo } from '../../types/weather';
import { searchLocations } from '../../services/weatherApi';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { 
    activeLocation, 
    savedLocations, 
    selectLocation, 
    addLocation, 
    detectGpsLocation 
  } = useWeather();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchLocations(query);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex flex-col justify-end animate-tab-switch">
      <div className={`w-full rounded-[28px] p-4 border max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl transition-colors ${
        isDarkMode 
          ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' 
          : 'bg-white border-[#E8E6DF] text-[#121814]'
      }`}>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center space-x-2">
            <MapPin size={17} className="text-[#FF5C00]" />
            <h3 className="text-sm font-black">Choose Weather Parcel</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full cursor-pointer snappy-touch ${
              isDarkMode ? 'bg-[#162019] text-[#F3F6F4]' : 'bg-[#F8F7F4] text-[#121814]'
            }`}
          >
            <X size={15} />
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          onClick={() => {
            detectGpsLocation();
            onClose();
          }}
          className={`w-full mb-3 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 cursor-pointer snappy-touch border transition-all ${
            isDarkMode
              ? 'bg-[#1E2821] hover:bg-[#25332A] border-[#2D3F34] text-[#10B981]'
              : 'bg-[#EAF5EF] hover:bg-[#D7EDE0] border-[#C5E4D2] text-[#1B4332]'
          }`}
        >
          <Crosshair size={14} />
          <span>Use Live GPS Location</span>
        </button>

        {/* Quick Search Input */}
        <form onSubmit={handleSearch} className="relative mb-3">
          <input
            type="text"
            placeholder="Search city, district, or coordinates..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={`w-full pl-8 pr-16 py-2 rounded-xl text-xs font-bold border outline-none transition-colors ${
              isDarkMode 
                ? 'bg-[#162019] border-[#1E2821] text-white focus:border-[#10B981]' 
                : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#121814] focus:border-[#1B4332]'
            }`}
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#5D6861] dark:text-[#89998F]" />
          <button
            type="submit"
            className="absolute right-1 top-1 px-2.5 py-1 rounded-lg bg-[#1B4332] hover:bg-[#12281E] text-white text-[10px] font-black cursor-pointer snappy-touch"
          >
            Search
          </button>
        </form>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-3 space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block px-1 ${
              isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
            }`}>
              Search Results
            </span>
            {results.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  addLocation(loc);
                  selectLocation(loc);
                  onClose();
                  setResults([]);
                  setQuery('');
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between border cursor-pointer snappy-touch ${
                  isDarkMode 
                    ? 'bg-[#162019] border-[#1E2821] text-[#F3F6F4] hover:bg-[#1E2821]' 
                    : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#121814] hover:bg-[#ECE9E0]'
                }`}
              >
                <span>{loc.name}, {loc.country}</span>
                <Plus size={14} className="text-[#10B981]" />
              </button>
            ))}
          </div>
        )}

        {/* Saved Cities Quick Switch */}
        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 px-1 ${
          isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
        }`}>
          Saved Locations
        </span>
        <div className="space-y-1.5">
          {savedLocations.map(loc => {
            const isSelected = loc.id === activeLocation.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  selectLocation(loc);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold flex items-center justify-between border cursor-pointer snappy-touch transition-all ${
                  isSelected
                    ? isDarkMode 
                      ? 'bg-[#1E2821] border-[#2D3F34] text-[#F3F6F4]' 
                      : 'bg-[#EAF5EF] border-[#C5E4D2] text-[#121814]'
                    : isDarkMode 
                      ? 'bg-[#162019] border-[#1E2821] text-[#89998F] hover:bg-[#1E2821]' 
                      : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#5D6861] hover:bg-[#ECE9E0]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className={isSelected ? 'text-[#FF5C00]' : 'opacity-40'} />
                  <span>{loc.name}, {loc.country}</span>
                </div>
                {isSelected && <Check size={14} className="text-[#10B981]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
