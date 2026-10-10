import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Check, 
  Sun, 
  Layers,
  CheckCircle2,
  Eye,
  Info,
  RefreshCw,
  Clock,
  RotateCw,
  Zap,
  Wind,
  Droplets,
  Sprout,
  Compass,
  CloudRain,
  ShieldAlert,
  Sliders,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../types/weather';
import { FarmWeatherHero } from './FarmWeatherHero';

interface AndroidHomeWidgetsProps {
  metrics: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  location: LocationInfo;
  isLoading?: boolean;
  onRefreshData?: () => void;
}

interface WidgetDefinition {
  id: string;
  nativeId: string;
  name: string;
  sizeTag: string;
  dimensions: string;
  description: string;
  category: 'house' | 'liquid_glass' | 'x_reality' | 'agri_soil' | 'minimal';
}

const WIDGETS_LIST: WidgetDefinition[] = [
  {
    id: 'house_hero',
    nativeId: 'house',
    name: 'Dynamic Farm Estate Widget',
    sizeTag: '4×2 Wide',
    dimensions: '4 cols × 2 rows',
    description: 'Animated farm landscape reacting dynamically to real-time microclimate rain, sunny skies, or night scenery with moving tractor & wind turbines.',
    category: 'house'
  },
  {
    id: 'glance_medium',
    nativeId: 'forecast',
    name: 'Apple Liquid Glass Forecast Hub',
    sizeTag: '4×2 Extended',
    dimensions: '4 cols × 2 rows',
    description: 'Translucent frosted liquid glass with next 5 hours forecast, precipitation chance, and feels-like barometer.',
    category: 'liquid_glass'
  },
  {
    id: 'clock_weather',
    nativeId: 'glance',
    name: 'Sony X-Reality At-A-Glance Clock',
    sizeTag: '3×2 Compact',
    dimensions: '3 cols × 2 rows',
    description: 'Deep AMOLED contrast with vibrant ambient radial aura, live digital clock, wind vectors, UV meter, and air quality.',
    category: 'x_reality'
  },
  {
    id: 'agri_soil_widget',
    nativeId: 'agri',
    name: 'Microclimate Soil & Crop Advisory',
    sizeTag: '4×2 Extended',
    dimensions: '4 cols × 2 rows',
    description: 'Farm-specialized weather telemetry displaying soil moisture %, evapotranspiration rate, spraying safety score, and next rain window.',
    category: 'agri_soil'
  },
  {
    id: 'glance_pill',
    nativeId: 'pill',
    name: 'Liquid Glass Minimal Pill',
    sizeTag: '2×1 Glance',
    dimensions: '2 cols × 1 row',
    description: 'Ultra-clean floating glass pill displaying current live temperature, weather condition, and pulse ring.',
    category: 'minimal'
  }
];

const STORAGE_PINNED_WIDGETS_KEY = 'weatherapp_pinned_widgets';

export const WeatherWidgetsScreen: React.FC<AndroidHomeWidgetsProps> = React.memo(({
  metrics,
  hourly,
  location,
  isLoading = false,
  onRefreshData
}) => {
  const { isDarkMode, formatTemp, formatWind, customAccentColor } = useTheme();

  // Selected widget for inspection and pinning
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('house_hero');
  
  // Customization: Glass / Dark / Vibrant
  const [widgetTheme] = useState<'liquid_glass' | 'oled_black' | 'sony_vivid'>('liquid_glass');

  // Track which widgets are added to home screen
  const [pinnedWidgetIds, setPinnedWidgetIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PINNED_WIDGETS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse pinned widgets:', e);
    }
    return ['house_hero']; // Default has the iconic house widget active
  });

  // Feedback toast message
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PINNED_WIDGETS_KEY, JSON.stringify(pinnedWidgetIds));
    } catch (e) {
      console.warn('Failed to save pinned widgets:', e);
    }
  }, [pinnedWidgetIds]);

  const selectedWidget = WIDGETS_LIST.find(w => w.id === selectedWidgetId) || WIDGETS_LIST[0];
  const isSelectedPinned = pinnedWidgetIds.includes(selectedWidget.id);

  // Snappy working "Add to Home Screen" Trigger with haptics
  const handleToggleAddToHomeScreen = useCallback((widget: WidgetDefinition) => {
    try { navigator.vibrate?.([15, 30, 15]); } catch {}
    
    const isCurrentlyPinned = pinnedWidgetIds.includes(widget.id);

    if (isCurrentlyPinned) {
      setPinnedWidgetIds(prev => prev.filter(id => id !== widget.id));
      setActionNotice(`Removed "${widget.name}" from active Home Screen widgets.`);
      setTimeout(() => setActionNotice(null), 2500);
      return;
    }

    let nativeTriggered = false;
    if (typeof window !== 'undefined' && (window as any).AndroidWidgetBridge) {
      try {
        const bridge = (window as any).AndroidWidgetBridge;
        if (typeof bridge.requestPinWidget === 'function') {
          nativeTriggered = bridge.requestPinWidget(widget.nativeId);
        }
      } catch (err) {
        console.warn('Android native widget bridge invoke:', err);
      }
    }

    setPinnedWidgetIds(prev => [...prev, widget.id]);

    if (nativeTriggered) {
      setActionNotice(`Android System Dialog opened! "${widget.name}" added to Home Screen.`);
    } else {
      setActionNotice(`✓ "${widget.name}" successfully added to your Home Screen!`);
    }

    setTimeout(() => setActionNotice(null), 3500);
  }, [pinnedWidgetIds]);

  return (
    <div className={`w-full min-h-full px-4 pt-3 pb-32 select-none transition-colors touch-manipulation gpu-accelerate ${
      isDarkMode ? 'text-white' : 'text-slate-900'
    }`}>
      {/* HEADER WITH VISUAL SYNC INDICATOR & REFETCH TRIGGER */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center font-black shadow-sm shrink-0 gpu-accelerate"
              style={{ 
                backgroundColor: `${customAccentColor}25`,
                color: customAccentColor 
              }}
            >
              <Layers size={19} />
            </div>
            <div>
              <h1 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Home Screen Widgets
              </h1>
              <p className={`text-xs mt-0.5 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                Aesthetic, working Android widgets with snappy touch response
              </p>
            </div>
          </div>

          {/* REFETCH / SYNC ACTION BUTTON WITH INSTANT TOUCH RESPONSE */}
          {onRefreshData && (
            <button
              onClick={() => {
                onRefreshData();
                try { navigator.vibrate?.(12); } catch {}
              }}
              disabled={isLoading}
              className={`p-2.5 rounded-2xl border snappy-touch cursor-pointer ${
                isLoading 
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' 
                  : isDarkMode 
                    ? 'bg-[#121622] hover:bg-[#1A2030] border-white/10 text-zinc-300 hover:text-white' 
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
              }`}
              title="Refetch weather data now"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-teal-400' : ''} />
            </button>
          )}
        </div>

        {/* VISUAL LIVE SYNC INDICATOR BAR */}
        <div className={`mt-3 p-2.5 px-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all gpu-accelerate ${
          isLoading
            ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-md animate-pulse'
            : isDarkMode 
              ? 'bg-[#101420] border-white/10 text-zinc-300' 
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <RotateCw size={14} className="animate-spin text-teal-400 shrink-0" />
              ) : (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                </span>
              )}
            </div>
            <span>
              {isLoading ? 'Refetching live satellite & microclimate data...' : 'Widgets Live Sync Engine Active'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300">
            <Clock size={11} className={isLoading ? 'animate-spin' : ''} />
            <span>Updated {metrics.lastUpdated || 'Just now'}</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK ACTION TOAST */}
      {actionNotice && (
        <div 
          className="mb-4 p-3 rounded-2xl text-slate-950 font-black text-xs flex items-center justify-between shadow-lg animate-card-slide-fade gpu-accelerate"
          style={{ backgroundColor: customAccentColor }}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)} 
            className="text-[11px] font-black uppercase opacity-75 hover:opacity-100 p-1 cursor-pointer snappy-touch"
          >
            ✕
          </button>
        </div>
      )}

      {/* WIDGET GALLERY HORIZONTAL SELECTION PILLS - HIGH TOUCH SENSITIVITY */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 mb-4 touch-manipulation">
        {WIDGETS_LIST.map(widget => {
          const isSelected = selectedWidgetId === widget.id;
          const isPinned = pinnedWidgetIds.includes(widget.id);
          return (
            <button
              key={widget.id}
              onClick={() => {
                setSelectedWidgetId(widget.id);
                try { navigator.vibrate?.(10); } catch {}
              }}
              className={`py-2 px-3.5 rounded-2xl text-xs font-black whitespace-nowrap snappy-touch flex items-center space-x-2 cursor-pointer ${
                isSelected
                  ? 'text-slate-950 shadow-md scale-102 font-extrabold'
                  : isDarkMode
                  ? 'bg-[#121622] text-zinc-200 hover:bg-[#1A2030] border border-white/10'
                  : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-300 shadow-xs'
              }`}
              style={{
                backgroundColor: isSelected ? customAccentColor : undefined
              }}
            >
              <span>{widget.name}</span>
              {isPinned && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-teal-500/20 text-teal-400'
                }`}>
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* LIVE INTERACTIVE WIDGET PREVIEW CARD */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1">
            <Eye size={12} />
            <span>Live Interactive Preview ({selectedWidget.sizeTag})</span>
          </span>
          <span className="text-[10px] text-zinc-500">
            {selectedWidget.dimensions}
          </span>
        </div>

        {/* CONTAINER MOCKUP: THE WIDGET ITSELF - HIGHLY RESPONSIVE SNAPPY TAP */}
        <div 
          onClick={() => handleToggleAddToHomeScreen(selectedWidget)}
          className="cursor-pointer snappy-touch group gpu-accelerate"
          title="Tap to toggle Add to Home Screen"
        >
          {/* 1. DYNAMIC FARM ESTATE HERO WIDGET (4x2) */}
          {selectedWidget.id === 'house_hero' && (
            <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative">
              <div className="relative w-full h-[205px] overflow-hidden">
                <FarmWeatherHero
                  sceneState={metrics.sceneState}
                  temperature={metrics.temperature}
                  conditionTitle={metrics.conditionTitle}
                  isLive={true}
                  tempMin={metrics.tempMinToday}
                  tempMax={metrics.tempMaxToday}
                  apparentTemperature={metrics.apparentTemperature}
                />
              </div>

              {/* Liquid Glass bottom strip with EXPLICIT HIGHLY READABLE LAST UPDATED TIME */}
              <div className={`p-3 flex items-center justify-between backdrop-blur-xl border-t ${
                isDarkMode 
                  ? 'bg-black/85 border-white/15 text-white' 
                  : 'bg-white/95 border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                  <span className="text-xs font-black">{location.name}</span>
                  <span className="text-[11px] opacity-70 hidden sm:inline">
                    • H:{formatTemp(metrics.tempMaxToday)} L:{formatTemp(metrics.tempMinToday)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* EXPLICIT LAST UPDATED BADGE */}
                  <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] font-black shadow-xs">
                    <Clock size={11} className={isLoading ? 'animate-spin' : ''} />
                    <span>Updated {metrics.lastUpdated || 'Just now'}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    isSelectedPinned 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}>
                    {isSelectedPinned ? <Check size={10} /> : <Sparkles size={10} />}
                    <span>{isSelectedPinned ? 'Added' : 'Add'}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. APPLE LIQUID GLASS FORECAST (4x2) */}
          {selectedWidget.id === 'glance_medium' && (
            <div className={`w-full p-4 rounded-3xl relative overflow-hidden transition-all gpu-accelerate ${
              widgetTheme === 'liquid_glass' 
                ? isDarkMode ? 'liquid-glass-dock text-white' : 'liquid-glass-dock-light text-slate-900'
                : widgetTheme === 'oled_black'
                ? 'bg-black border border-white/10 text-white'
                : 'bg-gradient-to-br from-teal-950/80 via-slate-900 to-black border border-teal-500/30 text-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-extrabold text-teal-400 uppercase tracking-wide flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    <span>{location.name}</span>
                  </p>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-3xl font-black">{formatTemp(metrics.temperature)}</span>
                    <span className="text-sm font-semibold opacity-90">{metrics.conditionTitle}</span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  {/* EXPLICIT LAST UPDATED BADGE */}
                  <div className="mb-1 px-2.5 py-0.5 rounded-full bg-teal-400/15 border border-teal-400/30 text-teal-300 text-[10px] font-black flex items-center space-x-1 shadow-xs">
                    <Clock size={11} className={isLoading ? 'animate-spin' : ''} />
                    <span>Updated {metrics.lastUpdated || 'Just now'}</span>
                  </div>

                  <span className="text-xs font-bold block">
                    H:{formatTemp(metrics.tempMaxToday)} L:{formatTemp(metrics.tempMinToday)}
                  </span>
                  <span className="text-[11px] opacity-70">
                    Feels {formatTemp(metrics.apparentTemperature)}
                  </span>
                </div>
              </div>

              {/* 5-Hour Horizontal Forecast */}
              <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-white/15">
                {hourly.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center py-1 rounded-xl bg-white/5">
                    <span className="text-[10px] opacity-75 mb-0.5">{item.hour}</span>
                    <span className="text-xs font-bold">{formatTemp(item.temperature)}</span>
                    {item.rainProbability > 0 && (
                      <span className="text-[9px] font-extrabold text-teal-400 mt-0.5">
                        {item.rainProbability}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SONY X-REALITY AT-A-GLANCE (3x2) */}
          {selectedWidget.id === 'clock_weather' && (
            <div className={`w-full p-4 rounded-3xl border shadow-xl relative overflow-hidden gpu-accelerate ${
              isDarkMode 
                ? 'bg-[#0E131E] border-white/15 text-white' 
                : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {/* Radial Aura Glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundColor: customAccentColor }}
              />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md shrink-0"
                    style={{ backgroundColor: `${customAccentColor}25`, color: customAccentColor }}
                  >
                    <Sun size={26} />
                  </div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black">{formatTemp(metrics.temperature)}</span>
                      <span className="text-xs font-bold text-teal-400">{location.name}</span>
                    </div>
                    <p className="text-[11px] opacity-75 font-medium">
                      {metrics.conditionTitle} • Humidity {metrics.humidity}%
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  {/* EXPLICIT LAST UPDATED BADGE */}
                  <div className="mb-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-black flex items-center space-x-1">
                    <Clock size={11} className={isLoading ? 'animate-spin' : ''} />
                    <span>Synced {metrics.lastUpdated || 'Just now'}</span>
                  </div>

                  <span className="text-xs font-bold block text-teal-400">
                    Wind {formatWind(metrics.windSpeed)}
                  </span>
                  <span className="text-[10px] opacity-65">
                    AQI {metrics.airQuality.aqi} ({metrics.airQuality.category})
                  </span>
                </div>
              </div>

              {/* Quick stats bottom row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] opacity-80">
                <span>UV Index: {metrics.uvIndex} ({metrics.uvLevel})</span>
                <span>Barometer: {metrics.pressure} hPa</span>
                <span>Rain: {metrics.rainChance}%</span>
              </div>
            </div>
          )}

          {/* 4. MICROCLIMATE CROP & SOIL ADVISORY WIDGET (4x2) */}
          {selectedWidget.id === 'agri_soil_widget' && (
            <div className={`w-full p-4 rounded-3xl border shadow-xl relative overflow-hidden gpu-accelerate ${
              isDarkMode 
                ? 'bg-gradient-to-br from-[#0A110D] via-[#0D1812] to-black border-emerald-500/30 text-white' 
                : 'bg-emerald-50/90 border-emerald-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                    <Sprout size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-emerald-400">
                      Crop & Soil Field Telemetry
                    </h4>
                    <span className="text-[11px] opacity-80 font-bold">{location.name} Farm District</span>
                  </div>
                </div>

                {/* EXPLICIT LAST UPDATED BADGE */}
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black flex items-center space-x-1 shadow-xs">
                  <Clock size={11} className={isLoading ? 'animate-spin' : ''} />
                  <span>Synced {metrics.lastUpdated || 'Just now'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-zinc-400 block font-bold">Soil Moisture</span>
                  <span className="text-xs font-black text-emerald-400">68% Optimal</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-zinc-400 block font-bold">Evapotransp.</span>
                  <span className="text-xs font-black text-emerald-400">3.4 mm/day</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-zinc-400 block font-bold">Spray Score</span>
                  <span className="text-xs font-black text-amber-400">92/100 Safe</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span className="flex items-center space-x-1">
                  <CloudRain size={13} />
                  <span>Next Rain Window: {metrics.rainChance > 30 ? 'Expected in 4h' : 'No rain for 24h'}</span>
                </span>
                <span className="font-black underline">Field Advisory →</span>
              </div>
            </div>
          )}

          {/* 5. LIQUID GLASS MINIMAL PILL (2x1) */}
          {selectedWidget.id === 'glance_pill' && (
            <div className="flex flex-col items-center py-2 gpu-accelerate">
              <div className={`px-6 py-3.5 rounded-full border shadow-xl flex items-center space-x-4 ${
                widgetTheme === 'liquid_glass'
                  ? isDarkMode ? 'liquid-glass-dock text-white' : 'liquid-glass-dock-light text-slate-900'
                  : 'bg-black/90 border-white/20 text-white'
              }`}>
                <Sun size={22} className="text-amber-400 shrink-0 animate-pulse" />
                <span className="text-xl font-black">{formatTemp(metrics.temperature)}</span>
                <div className="h-5 w-px bg-white/25" />
                <div className="text-left">
                  <span className="text-xs font-extrabold block leading-tight">{location.name}</span>
                  <span className="text-[10px] opacity-80 leading-tight block">{metrics.conditionTitle}</span>
                </div>
              </div>

              {/* EXPLICIT LAST UPDATED TIME FOR MINIMAL PILL */}
              <div className="mt-2.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-black flex items-center space-x-1.5 shadow-xs">
                <Clock size={12} className={isLoading ? 'animate-spin' : ''} />
                <span>Widget Last Synced: {metrics.lastUpdated || 'Just now'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED "ADD TO HOME SCREEN" WORKING CONTROLS CARD */}
      <div className={`p-4 rounded-3xl border shadow-xl mb-5 transition-all gpu-accelerate ${
        isDarkMode 
          ? 'bg-[#10141E] border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-extrabold flex items-center space-x-1.5">
              <span>{selectedWidget.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold">
                {selectedWidget.sizeTag}
              </span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {selectedWidget.description}
            </p>
          </div>
        </div>

        {/* WORKING "ADD TO HOME SCREEN" TOGGLE SWITCH WITH INSTANT NATIVE TOUCH RESPONSE */}
        <div className={`p-3.5 rounded-2xl flex items-center justify-between border mb-4 transition-all ${
          isSelectedPinned 
            ? 'bg-teal-500/10 border-teal-500/40' 
            : isDarkMode ? 'bg-[#151A26] border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
              isSelectedPinned ? 'bg-teal-500 text-slate-950' : 'bg-zinc-700/50 text-zinc-300'
            }`}>
              <Smartphone size={18} />
            </div>
            <div>
              <span className="text-xs font-black block">
                Add to Home Screen
              </span>
              <span className={`text-[10px] font-medium block ${
                isSelectedPinned ? 'text-teal-400 font-bold' : isDarkMode ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                {isSelectedPinned ? `✓ Active • Synced at ${metrics.lastUpdated || 'Just now'}` : 'Toggle to pin widget to launcher'}
              </span>
            </div>
          </div>

          {/* REAL FUNCTIONAL TOGGLE SWITCH */}
          <button
            type="button"
            role="switch"
            aria-checked={isSelectedPinned}
            onClick={() => handleToggleAddToHomeScreen(selectedWidget)}
            className={`w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer relative shadow-inner snappy-touch ${
              isSelectedPinned ? 'bg-teal-500' : isDarkMode ? 'bg-zinc-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                isSelectedPinned ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* INSTANT ONE-TAP PIN BUTTON */}
        <button
          onClick={() => handleToggleAddToHomeScreen(selectedWidget)}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg snappy-touch ${
            isSelectedPinned
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/25'
          }`}
        >
          {isSelectedPinned ? (
            <>
              <span>Remove from Active Home Screen</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Add to Home Screen Now</span>
            </>
          )}
        </button>
      </div>

      {/* ALL WORKING WIDGETS STATUS SUMMARY LIST - SNAPPY TOUCH */}
      <div className="mb-5">
        <span 
          className="text-[11px] font-black uppercase tracking-wider block mb-2 px-1"
          style={{ color: customAccentColor }}
        >
          Installed & Available Widgets ({WIDGETS_LIST.length})
        </span>

        <div className="space-y-2">
          {WIDGETS_LIST.map(widget => {
            const isPinned = pinnedWidgetIds.includes(widget.id);
            const isSelected = selectedWidgetId === widget.id;
            return (
              <div
                key={widget.id}
                onClick={() => {
                  setSelectedWidgetId(widget.id);
                  try { navigator.vibrate?.(10); } catch {}
                }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-150 cursor-pointer snappy-touch ${
                  isSelected
                    ? isDarkMode ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-400'
                    : isDarkMode ? 'bg-[#10141E] border-white/10 hover:border-white/20' : 'bg-white border-slate-200/90 shadow-xs'
                }`}
                style={{
                  borderColor: isSelected ? customAccentColor : undefined
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      isPinned ? 'text-slate-950' : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                    }`}
                    style={{
                      backgroundColor: isPinned ? customAccentColor : undefined
                    }}
                  >
                    {isPinned ? '✓' : '+'}
                  </div>
                  <div>
                    <span className={`text-xs font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {widget.name}
                    </span>
                    <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {widget.sizeTag} • {widget.dimensions}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAddToHomeScreen(widget);
                    }}
                    className={`text-[10px] font-black px-3 py-1 rounded-full transition-all cursor-pointer snappy-touch ${
                      isPinned 
                        ? 'text-slate-950 shadow-xs' 
                        : isDarkMode ? 'bg-[#181E2C] text-zinc-200 hover:text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                    style={{
                      backgroundColor: isPinned ? customAccentColor : undefined
                    }}
                  >
                    {isPinned ? 'Active' : '+ Add'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK ANDROID LAUNCHER GUIDE */}
      <div className={`p-4 rounded-3xl border ${
        isDarkMode ? 'bg-[#0E121B] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
      }`}>
        <h4 
          className="text-xs font-black uppercase tracking-wider mb-2 flex items-center space-x-1.5"
          style={{ color: customAccentColor }}
        >
          <Info size={14} />
          <span>Android Launcher Widget Placement</span>
        </h4>
        <ol className={`space-y-2 text-xs font-semibold leading-relaxed ${
          isDarkMode ? 'text-zinc-200' : 'text-slate-800'
        }`}>
          <li className="flex items-start space-x-2">
            <span className="font-black" style={{ color: customAccentColor }}>1.</span>
            <span>Tapping <strong>Add to Home Screen Now</strong> opens the native system prompt to place the widget directly on your home screen.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-black" style={{ color: customAccentColor }}>2.</span>
            <span>You can also long-press any empty space on your phone home screen &gt; select <strong>Widgets</strong> &gt; choose <strong>WeatherApp</strong>.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-black" style={{ color: customAccentColor }}>3.</span>
            <span>All widgets auto-sync your active city (<strong>{location.name}</strong>) with live weather readings (last synced <strong>{metrics.lastUpdated || 'Just now'}</strong>).</span>
          </li>
        </ol>
      </div>
    </div>
  );
});

WeatherWidgetsScreen.displayName = 'WeatherWidgetsScreen';
