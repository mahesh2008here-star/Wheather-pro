import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { PhoneSimulator } from './components/PhoneSimulator';
import { AppHeader } from './components/layout/AppHeader';
import { LiquidDockNav } from './components/layout/LiquidDockNav';
import { LocationPickerModal } from './components/layout/LocationPickerModal';
import { FirstLaunchLocationModal } from './components/layout/FirstLaunchLocationModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { HomeScreen } from './components/screens/HomeScreen';
import { LiveRadarScreen } from './components/LiveRadarScreen';
import { AirAndSunScreen } from './components/AirAndSunScreen';
import { WeatherWidgetsScreen } from './components/WeatherWidgetsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AppUpdatesPage } from './components/updates/AppUpdatesPage';
import { UpiDonationPage } from './components/donation/UpiDonationPage';
import { Navigation, AlertCircle, Search } from 'lucide-react';

function MainAppContent() {
  const { 
    activeTab, 
    setActiveTab,
    currentView,
    navigateToView,
    locationStatus, 
    clearLocationStatus,
    locationError,
    clearLocationError,
    isPermissionPermanentlyDenied,
    showFirstLaunchLocationModal,
    acceptFirstLaunchLocationPrompt,
    dismissFirstLaunchLocationPrompt,
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

  // Render Full-Screen App Updates Page
  if (currentView === 'updates') {
    return <AppUpdatesPage onBack={() => navigateToView('main')} />;
  }

  // Render Full-Screen Support Farm Weather / UPI Donation Page
  if (currentView === 'donation') {
    return <UpiDonationPage onBack={() => navigateToView('main')} />;
  }

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

        {/* Location Error / Permission Notification Banner */}
        {locationError && (
          <div className="w-full px-4 pt-1.5 select-none animate-tab-switch z-30">
            <div className="p-3 rounded-2xl bg-[#FFF4ED] border border-[#FFE1CB] text-[#C2410C] text-xs font-medium shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2 min-w-0">
                  <AlertCircle size={16} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-bold text-[#9A3412] block mb-0.5">Location Access Note</span>
                    <span>{locationError}</span>
                    {isPermissionPermanentlyDenied && (
                      <p className="text-[11px] text-[#C2410C] mt-1 opacity-90">
                        To enable GPS: Android Settings → Apps → Farm Weather → Permissions → Location.
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={clearLocationError}
                  className="p-1 cursor-pointer font-bold text-[#9A3412] hover:bg-[#FFE0CB] rounded-lg shrink-0"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>

              {/* Action: Search City Manually */}
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  onClick={() => {
                    clearLocationError();
                    setIsLocationPickerOpen(true);
                  }}
                  className="py-1 px-3 rounded-xl bg-[#EA580C] text-white text-[11px] font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer snappy-touch active:scale-95 transition-transform"
                >
                  <Search size={12} />
                  <span>Search City Manually</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* First-Launch Educational Permission Modal */}
        <FirstLaunchLocationModal
          isOpen={showFirstLaunchLocationModal}
          onAllowLocation={acceptFirstLaunchLocationPrompt}
          onChooseManually={() => {
            dismissFirstLaunchLocationPrompt();
            setIsLocationPickerOpen(true);
          }}
        />

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
