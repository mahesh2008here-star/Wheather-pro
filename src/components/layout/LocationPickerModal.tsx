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
  const { isDarkMode, customAccentColor } = useTheme();
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
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex flex-col justify-end animate-card-slide-fade">
      <div className={`w-full rounded-3xl p-4 border max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl ${
        isDarkMode ? 'bg-[#0E121A] border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <MapPin size={18} style={{ color: customAccentColor }} />
            <h3 className="text-sm font-black">Choose Weather Location</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full cursor-pointer ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          onClick={() => {
            detectGpsLocation();
            onClose();
          }}
          className="w-full mb-3 py-2.5 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-black flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
        >
          <Crosshair size={15} />
          <span>Use Current GPS Location</span>
        </button>

        {/* Quick Search Input */}
        <form onSubmit={handleSearch} className="relative mb-3">
          <input
            type="text"
            placeholder="Search city name (e.g. Tokyo, Berlin)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={`w-full pl-8 pr-16 py-2 rounded-xl text-xs font-bold border outline-hidden ${
              isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
          <button
            type="submit"
            className="absolute right-1 top-1 px-2.5 py-1 rounded-lg text-slate-950 text-[10px] font-black cursor-pointer"
            style={{ backgroundColor: customAccentColor }}
          >
            Search
          </button>
        </form>

        {/* Quick Search Results */}
        {results.length > 0 && (
          <div className="mb-3 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-1">Search Results</span>
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
                className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                <span>{loc.name}, {loc.country}</span>
                <Plus size={14} style={{ color: customAccentColor }} />
              </button>
            ))}
          </div>
        )}

        {/* Saved Cities Quick Switch */}
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 px-1">Saved Cities</span>
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
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/20 border text-white'
                    : isDarkMode ? 'bg-white/5 hover:bg-white/10 text-zinc-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                style={{ borderColor: isSelected ? customAccentColor : undefined }}
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={14} style={{ color: isSelected ? customAccentColor : undefined }} />
                  <span>{loc.name}, {loc.country}</span>
                </div>
                {isSelected && <Check size={14} style={{ color: customAccentColor }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
