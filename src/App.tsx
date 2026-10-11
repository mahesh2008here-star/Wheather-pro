import React, { useState, useEffect } from 'react';
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
  const { 
    activeTab, 
    setActiveTab,
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

  // Listen for native widget deep links (from MainActivity onNewIntent / onCreate)
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (typeof e?.detail?.tab === 'number') {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, [setActiveTab]);

  return (
    <PhoneSimulator>
      {/* Main container respecting safe-area-inset-bottom */}
      <div 
        id="app-main-container"
        className="w-full h-full flex flex-col relative overflow-hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Top Brand Header Bar */}
        <AppHeader onOpenLocationPicker={() => setIsLocationPickerOpen(true)} />

        {/* GPS Location Status Feedback Toast */}
        {locationStatus && (
          <div className="w-full px-4 pt-1.5 select-none animate-tab-switch z-30">
            <div className="p-2.5 px-3.5 rounded-2xl bg-[#E5F5EC] border border-[#CEEFDB] text-[#10B981] text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2">
                <Navigation size={14} className="animate-spin shrink-0 text-[#10B981]" />
                <span>{locationStatus}</span>
              </div>
              <button onClick={clearLocationStatus} className="p-0.5 cursor-pointer font-bold text-[#10B981]">✕</button>
            </div>
          </div>
        )}

        {/* Location Picker Overlay Modal */}
        <LocationPickerModal 
          isOpen={isLocationPickerOpen} 
          onClose={() => setIsLocationPickerOpen(false)} 
        />

        {/* Screen Views with ErrorBoundary Protection */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar relative flex flex-col animate-tab-switch">
          <ErrorBoundary fallbackTitle="Screen Error">
            {activeTab === 0 && <HomeScreen />}

            {activeTab === 1 && (
              <div className="w-full flex-col flex">
                <LiveRadarScreen location={activeLocation} />
              </div>
            )}

            {activeTab === 2 && (
              <div className="w-full flex-col flex">
                <AirAndSunScreen
                  airQuality={metrics.airQuality}
                  astronomy={metrics.astronomy}
                  location={activeLocation}
                />
              </div>
            )}

            {activeTab === 3 && (
              <div className="w-full flex-col flex">
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
              <div className="w-full flex-col flex">
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

        {/* Grounded Bottom Navigation Bar */}
        <LiquidDockNav />
      </div>
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
