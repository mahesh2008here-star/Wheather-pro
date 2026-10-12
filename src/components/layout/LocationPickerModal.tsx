import React, { useState } from 'react';
import { MapPin, X, Crosshair, Search, Plus, Check } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { LocationInfo } from '../../types/weather';
import { searchLocations } from '../../services/weatherApi';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeLocation, 
    savedLocations, 
    selectLocation, 
    addLocation, 
    detectGpsLocation,
    isLocating 
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
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs p-4 flex flex-col justify-end animate-tab-switch">
      <div className="w-full rounded-[28px] p-4 border border-[#E9E7E1] bg-white text-[#171717] max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E9E7E1]">
          <div className="flex items-center space-x-2">
            <MapPin size={17} className="text-[#FF7900]" />
            <h3 className="text-sm font-black text-[#171717]">Choose Weather Parcel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full cursor-pointer snappy-touch bg-[#F7F6F2] text-[#171717] hover:bg-[#EAE8E1]"
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
          disabled={isLocating}
          className={`w-full mb-3 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 cursor-pointer snappy-touch border border-[#FFE1CB] bg-[#FFF0E4] hover:bg-[#FFE0CB] text-[#FF7900] transition-all shadow-xs ${
            isLocating ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <Crosshair size={14} className={isLocating ? 'animate-spin' : ''} />
          <span>{isLocating ? 'Acquiring GPS Location...' : 'Fetch Current Location via GPS'}</span>
        </button>

        {/* Quick Search Input */}
        <form onSubmit={handleSearch} className="relative mb-3">
          <input
            type="text"
            placeholder="Search city, district, or coordinates..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-16 py-2.5 rounded-xl text-xs font-bold border border-[#E9E7E1] bg-[#F7F6F2] text-[#171717] focus:border-[#FF7900] outline-none transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-3 text-[#737873]" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-[#FF7900] text-white text-[10px] font-black cursor-pointer snappy-touch"
          >
            Search
          </button>
        </form>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block px-1 text-[#737873]">
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
                className="w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between border border-[#E9E7E1] bg-[#F7F6F2] text-[#171717] hover:bg-[#FFF0E4] cursor-pointer snappy-touch"
              >
                <span>{loc.name}, {loc.country}</span>
                <Plus size={14} className="text-[#FF7900]" />
              </button>
            ))}
          </div>
        )}

        {/* Saved Cities Quick Switch */}
        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 px-1 text-[#737873]">
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
                    ? 'bg-[#FFF0E4] border-[#FFE1CB] text-[#FF7900]'
                    : 'bg-[#F7F6F2] border-[#E9E7E1] text-[#171717] hover:bg-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className={isSelected ? 'text-[#FF7900]' : 'text-[#AAAFA9]'} />
                  <span>{loc.name}, {loc.country}</span>
                </div>
                {isSelected && <Check size={14} className="text-[#FF7900]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
