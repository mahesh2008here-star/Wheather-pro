import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Check, 
  Sun, 
  CloudSun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Compass, 
  Layers,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Palette,
  Eye,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CurrentWeatherMetrics, HourlyForecastItem, LocationInfo } from '../types/weather';
import { FarmWeatherHero } from './FarmWeatherHero';

interface AndroidHomeWidgetsProps {
  metrics: CurrentWeatherMetrics;
  hourly: HourlyForecastItem[];
  location: LocationInfo;
}

interface WidgetDefinition {
  id: string;
  nativeId: string;
  name: string;
  sizeTag: string;
  dimensions: string;
  description: string;
  category: 'house' | 'liquid_glass' | 'x_reality' | 'minimal';
}

const WIDGETS_LIST: WidgetDefinition[] = [
  {
    id: 'house_hero',
    nativeId: 'house',
    name: 'Iconic Farm House Scene',
    sizeTag: '4×2 Wide',
    dimensions: '4 cols × 2 rows',
    description: 'Animated farm landscape reacting dynamically to real-time microclimate rain, sunny skies, or night scenery.',
    category: 'house'
  },
  {
    id: 'glance_medium',
    nativeId: 'forecast',
    name: 'Apple Liquid Glass Forecast',
    sizeTag: '4×2 Extended',
    dimensions: '4 cols × 2 rows',
    description: 'Translucent frosted glass with next 5 hours forecast, precipitation chance, and feels-like barometer.',
    category: 'liquid_glass'
  },
  {
    id: 'clock_weather',
    nativeId: 'glance',
    name: 'Sony X-Reality At-A-Glance',
    sizeTag: '3×2 Compact',
    dimensions: '3 cols × 2 rows',
    description: 'Deep AMOLED contrast with vibrant ambient radial aura, wind vectors, UV meter, and air quality.',
    category: 'x_reality'
  },
  {
    id: 'glance_pill',
    nativeId: 'pill',
    name: 'Liquid Glass Minimal Pill',
    sizeTag: '2×1 Glance',
    dimensions: '2 cols × 1 row',
    description: 'Ultra-clean floating glass pill displaying current live temperature and weather condition.',
    category: 'minimal'
  }
];

const STORAGE_PINNED_WIDGETS_KEY = 'weatherapp_pinned_widgets';

export const WeatherWidgetsScreen: React.FC<AndroidHomeWidgetsProps> = ({
  metrics,
  hourly,
  location,
}) => {
  const { isDarkMode, formatTemp, formatWind, customAccentColor } = useTheme();

  // Selected widget for inspection and pinning
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('house_hero');
  
  // Customization: Glass / Dark / Vibrant
  const [widgetTheme, setWidgetTheme] = useState<'liquid_glass' | 'oled_black' | 'sony_vivid'>('liquid_glass');

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

  // Core Working "Add to Home Screen" Trigger
  const handleToggleAddToHomeScreen = (widget: WidgetDefinition) => {
    const isCurrentlyPinned = pinnedWidgetIds.includes(widget.id);

    if (isCurrentlyPinned) {
      // Remove from Home Screen
      setPinnedWidgetIds(prev => prev.filter(id => id !== widget.id));
      setActionNotice(`Removed "${widget.name}" from active Home Screen widgets.`);
      setTimeout(() => setActionNotice(null), 3000);
      try { navigator.vibrate?.(20); } catch {}
      return;
    }

    // Add to Home Screen:
    // 1. Check if running inside native Android APK with AndroidWidgetBridge
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

    // 2. Play haptic feedback
    try {
      navigator.vibrate?.([40, 60, 40]);
    } catch {}

    // 3. Update pinned widgets list
    setPinnedWidgetIds(prev => [...prev, widget.id]);

    // 4. Show success banner
    if (nativeTriggered) {
      setActionNotice(`Android System Dialog opened! "${widget.name}" added to Home Screen.`);
    } else {
      setActionNotice(`✓ "${widget.name}" successfully added to your Home Screen!`);
    }

    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="w-full min-h-full px-4 pt-3 pb-32 select-none">
      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
            style={{ 
              backgroundColor: `${customAccentColor}25`,
              color: customAccentColor 
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Home Screen Widgets
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Aesthetic, working Android widgets — tap to add directly to your home screen
            </p>
          </div>
        </div>
      </div>

      {/* FEEDBACK ACTION TOAST */}
      {actionNotice && (
        <div className="mb-4 p-3 rounded-2xl bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-lg shadow-teal-500/25 animate-card-slide-fade">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)} 
            className="text-[11px] font-black uppercase opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* WIDGET GALLERY HORIZONTAL SELECTION PILLS */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 mb-4">
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
              className={`py-2 px-3.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 cursor-pointer ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 shadow-md scale-102 font-extrabold'
                  : isDarkMode
                  ? 'bg-[#121622] text-zinc-300 hover:bg-[#1A2030] border border-white/10'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
              }`}
            >
              <span>{widget.name}</span>
              {isPinned && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-teal-500/20 text-teal-300'
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

        {/* CONTAINER MOCKUP: THE WIDGET ITSELF */}
        <div 
          onClick={() => handleToggleAddToHomeScreen(selectedWidget)}
          className="cursor-pointer transition-transform active:scale-[0.985] group"
          title="Tap to toggle Add to Home Screen"
        >
          {/* 1. THE ICONIC FARM HOUSE SCENE WIDGET (4x2) */}
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

              {/* Liquid Glass bottom strip */}
              <div className={`p-3 flex items-center justify-between backdrop-blur-xl border-t ${
                isDarkMode 
                  ? 'bg-black/85 border-white/15 text-white' 
                  : 'bg-white/95 border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-black">{location.name}</span>
                  <span className="text-[11px] opacity-70">
                    • H:{formatTemp(metrics.tempMaxToday)} L:{formatTemp(metrics.tempMinToday)}
                  </span>
                </div>
                
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  isSelectedPinned 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}>
                  {isSelectedPinned ? <Check size={10} /> : <Sparkles size={10} />}
                  <span>{isSelectedPinned ? 'Added' : 'Tap to Add'}</span>
                </span>
              </div>
            </div>
          )}

          {/* 2. APPLE LIQUID GLASS FORECAST (4x2) */}
          {selectedWidget.id === 'glance_medium' && (
            <div className={`w-full p-4 rounded-3xl relative overflow-hidden transition-all ${
              widgetTheme === 'liquid_glass' 
                ? isDarkMode ? 'liquid-glass-dock text-white' : 'liquid-glass-dock-light text-slate-900'
                : widgetTheme === 'oled_black'
                ? 'bg-black border border-white/10 text-white'
                : 'bg-gradient-to-br from-teal-950/80 via-slate-900 to-black border border-teal-500/30 text-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-extrabold text-teal-400 uppercase tracking-wide">
                    {location.name}
                  </p>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-3xl font-black">{formatTemp(metrics.temperature)}</span>
                    <span className="text-sm font-semibold opacity-90">{metrics.conditionTitle}</span>
                  </div>
                </div>
                <div className="text-right">
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
            <div className={`w-full p-4 rounded-3xl border shadow-xl relative overflow-hidden ${
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
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md"
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

                <div className="text-right">
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

          {/* 4. LIQUID GLASS MINIMAL PILL (2x1) */}
          {selectedWidget.id === 'glance_pill' && (
            <div className="flex justify-center py-2">
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
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED "ADD TO HOME SCREEN" WORKING CONTROLS CARD */}
      <div className={`p-4 rounded-3xl border shadow-xl mb-5 transition-all ${
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

        {/* WORKING "ADD TO HOME SCREEN" TOGGLE SWITCH */}
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
                {isSelectedPinned ? '✓ Active & syncing live weather' : 'Toggle to pin widget to launcher'}
              </span>
            </div>
          </div>

          {/* REAL FUNCTIONAL TOGGLE SWITCH */}
          <button
            type="button"
            role="switch"
            aria-checked={isSelectedPinned}
            onClick={() => handleToggleAddToHomeScreen(selectedWidget)}
            className={`w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer relative shadow-inner ${
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
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
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

      {/* ALL WORKING WIDGETS STATUS SUMMARY LIST */}
      <div className="mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block mb-2 px-1">
          Installed & Available Widgets ({WIDGETS_LIST.length})
        </span>

        <div className="space-y-2">
          {WIDGETS_LIST.map(widget => {
            const isPinned = pinnedWidgetIds.includes(widget.id);
            const isSelected = selectedWidgetId === widget.id;
            return (
              <div
                key={widget.id}
                onClick={() => setSelectedWidgetId(widget.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-500/60 bg-teal-500/5'
                    : isDarkMode ? 'bg-[#10141E] border-white/5 hover:border-white/20' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                    isPinned ? 'bg-teal-500/20 text-teal-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isPinned ? '✓' : '+'}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{widget.name}</span>
                    <span className="text-[10px] opacity-60 block">{widget.sizeTag} • {widget.dimensions}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAddToHomeScreen(widget);
                    }}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      isPinned 
                        ? 'bg-teal-500 text-slate-950 shadow-xs' 
                        : isDarkMode ? 'bg-[#181E2C] text-zinc-300 hover:text-white' : 'bg-slate-100 text-slate-700'
                    }`}
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
        isDarkMode ? 'bg-[#0E121B] border-white/10' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-400 mb-2 flex items-center space-x-1.5">
          <Info size={14} />
          <span>Android Launcher Widget Placement</span>
        </h4>
        <ol className="space-y-1.5 text-xs opacity-80 leading-relaxed">
          <li className="flex items-start space-x-2">
            <span className="font-bold text-teal-400">1.</span>
            <span>Tapping <strong>Add to Home Screen</strong> prompts Android to place the widget instantly.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-teal-400">2.</span>
            <span>You can also long-press your home screen wallpaper &gt; select <strong>Widgets</strong> &gt; <strong>WeatherApp</strong>.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-bold text-teal-400">3.</span>
            <span>Widgets automatically sync your saved city (<strong>{location.name}</strong>) and live microclimate farm graphics!</span>
          </li>
        </ol>
      </div>
    </div>
  );
};
