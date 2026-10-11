import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { PhoneSimulator } from './components/PhoneSimulator';
import { AppHeader } from './components/layout/AppHeader';
import { LiquidDockNav } from './components/layout/LiquidDockNav';
import { LocationPickerModal } from './components/layout/LocationPickerModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { HomeScreen } from './components/screens/HomeScreen';
import { LiveRadarScreen } from './components/LiveRadarScreen';
import { AirAndSunScreen } from './components/AirAndSunScreen';
import { WeatherWidgetsScreen } from './components/WeatherWidgetsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Navigation } from 'lucide-react';

function MainAppContent() {
  const { isDarkMode } = useTheme();
  const { 
    activeTab, 
    locationStatus, 
    clearLocationStatus, 
    metrics, 
    hourlyForecast, 
    activeLocation, 
    isLoading, 
    refreshWeather, 
    savedLocations, 
    selectLocation, 
    addLocation, 
    deleteLocation 
  } = useWeather();

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  return (
    <PhoneSimulator>
      {/* Top Header Bar */}
      <AppHeader onOpenLocationPicker={() => setIsLocationPickerOpen(true)} />

      {/* GPS Location Status Feedback Toast */}
      {locationStatus && (
        <div className="w-full px-4 pt-1.5 select-none animate-fadeIn z-30">
          <div className="p-2 px-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <Navigation size={14} className="animate-spin text-teal-400 shrink-0" />
              <span>{locationStatus}</span>
            </div>
            <button onClick={clearLocationStatus} className="text-teal-200 text-xs font-bold p-0.5 cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {/* Location Picker Overlay Modal */}
      <LocationPickerModal 
        isOpen={isLocationPickerOpen} 
        onClose={() => setIsLocationPickerOpen(false)} 
      />

      {/* Screen Views with ErrorBoundary Protection */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col pb-28 animate-tab-switch">
        <ErrorBoundary fallbackTitle="Screen Error">
          {activeTab === 0 && <HomeScreen />}

          {activeTab === 1 && (
            <div className="w-full flex-col flex pb-4">
              <LiveRadarScreen location={activeLocation} />
            </div>
          )}

          {activeTab === 2 && (
            <div className="w-full flex-col flex pb-4">
              <AirAndSunScreen
                airQuality={metrics.airQuality}
                astronomy={metrics.astronomy}
                location={activeLocation}
              />
            </div>
          )}

          {activeTab === 3 && (
            <div className="w-full flex-col flex pb-4">
              <WeatherWidgetsScreen
                metrics={metrics}
                hourly={hourlyForecast}
                location={activeLocation}
                isLoading={isLoading}
                onRefreshData={refreshWeather}
              />
            </div>
          )}

          {activeTab === 4 && (
            <div className="w-full flex-col flex pb-4">
              <SettingsScreen
                locations={savedLocations}
                activeLocation={activeLocation}
                onSelectLocation={selectLocation}
                onAddLocation={addLocation}
                onDeleteLocation={deleteLocation}
                onRefreshData={refreshWeather}
                lastUpdated={metrics.lastUpdated}
              />
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* Apple Liquid Glass Navigation Dock (85% Liquidity) */}
      <LiquidDockNav />
    </PhoneSimulator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WeatherProvider>
        <MainAppContent />
      </WeatherProvider>
    </ThemeProvider>
  );
}
