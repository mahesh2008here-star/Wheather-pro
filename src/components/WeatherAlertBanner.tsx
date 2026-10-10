import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Wind, 
  Snowflake, 
  CloudRain, 
  Zap, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  ShieldAlert,
  Layers,
  Clock
} from 'lucide-react';
import { WeatherAlert } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
  onTriggerAction?: (alert: WeatherAlert) => void;
  onSimulateAlert?: (type: 'frost' | 'wind' | 'rain' | 'clear') => void;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  alerts,
  onTriggerAction,
  onSimulateAlert,
}) => {
  const { isDarkMode } = useTheme();
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [selectedAlertForDetails, setSelectedAlertForDetails] = useState<WeatherAlert | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter(a => !dismissedAlertIds.includes(a.id));

  if (activeAlerts.length === 0) {
    return (
      <div className="w-full px-4 pt-2">
        {/* Quick simulator shortcut when no alerts are active */}
        <div className={`p-2.5 rounded-2xl flex items-center justify-between text-xs transition-colors ${
          isDarkMode ? 'bg-[#0A0A0C] border border-white/10 text-zinc-400' : 'bg-stone-100/60 border border-stone-200/50 text-stone-500'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-[11px]">All Clear • No severe weather advisories</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onSimulateAlert?.('frost')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-white/10' : 'bg-white hover:bg-stone-200 text-cyan-700 border border-stone-200'
              }`}
            >
              Test Frost
            </button>
            <button
              onClick={() => onSimulateAlert?.('wind')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-white/10' : 'bg-white hover:bg-stone-200 text-amber-700 border border-stone-200'
              }`}
            >
              Test Wind
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display top primary alert
  const primaryAlert = activeAlerts[0];

  const getAlertColorTheme = (alert: WeatherAlert) => {
    switch (alert.type) {
      case 'frost':
        return {
          border: isDarkMode ? 'border-cyan-500/50' : 'border-cyan-400',
          bg: isDarkMode ? 'bg-cyan-950/40' : 'bg-cyan-50',
          badgeBg: isDarkMode ? 'bg-cyan-900/60 text-cyan-200' : 'bg-cyan-100 text-cyan-800',
          iconBg: 'bg-cyan-500 text-white',
          buttonBg: 'bg-cyan-600 hover:bg-cyan-700 text-white',
          accent: 'text-cyan-600 dark:text-cyan-400',
        };
      case 'wind':
        return {
          border: isDarkMode ? 'border-amber-500/50' : 'border-amber-400',
          bg: isDarkMode ? 'bg-amber-950/40' : 'bg-amber-50',
          badgeBg: isDarkMode ? 'bg-amber-900/60 text-amber-200' : 'bg-amber-100 text-amber-800',
          iconBg: 'bg-amber-500 text-white',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
          accent: 'text-amber-600 dark:text-amber-400',
        };
      case 'rain':
        return {
          border: isDarkMode ? 'border-indigo-500/50' : 'border-indigo-400',
          bg: isDarkMode ? 'bg-indigo-950/40' : 'bg-indigo-50',
          badgeBg: isDarkMode ? 'bg-indigo-900/60 text-indigo-200' : 'bg-indigo-100 text-indigo-800',
          iconBg: 'bg-indigo-500 text-white',
          buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          accent: 'text-indigo-600 dark:text-indigo-400',
        };
      case 'storm':
      default:
        return {
          border: isDarkMode ? 'border-rose-500/50' : 'border-rose-400',
          bg: isDarkMode ? 'bg-rose-950/40' : 'bg-rose-50',
          badgeBg: isDarkMode ? 'bg-rose-900/60 text-rose-200' : 'bg-rose-100 text-rose-800',
          iconBg: 'bg-rose-500 text-white',
          buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white',
          accent: 'text-rose-600 dark:text-rose-400',
        };
    }
  };

  const colors = getAlertColorTheme(primaryAlert);

  const renderIcon = (type: string) => {
    switch (type) {
      case 'frost':
        return <Snowflake size={18} />;
      case 'wind':
        return <Wind size={18} />;
      case 'rain':
        return <CloudRain size={18} />;
      case 'storm':
      default:
        return <Zap size={18} />;
    }
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedAlertIds(prev => [...prev, id]);
  };

  const handleExecuteAction = (alert: WeatherAlert) => {
    let msg = '';
    if (alert.type === 'frost') {
      msg = 'Freeze precautions active: outdoor pipes insulated, heating ready.';
    } else if (alert.type === 'wind') {
      msg = 'High wind advisory saved: outdoor fixtures secured, travel safety alerted.';
    } else if (alert.type === 'rain') {
      msg = 'Precipitation watch confirmed: storm drainage checked, umbrella advised.';
    } else {
      msg = 'Severe weather safety protocol acknowledged: stay indoors in sturdy shelter.';
    }
    setActionSuccessMessage(msg);
    onTriggerAction?.(alert);
  };

  return (
    <div className="w-full px-4 pt-2.5 select-none">
      {/* REAL-TIME ALERT BANNER */}
      <div 
        onClick={() => setSelectedAlertForDetails(primaryAlert)}
        className={`relative w-full rounded-2xl p-3.5 border transition-all duration-300 shadow-sm cursor-pointer ${colors.bg} ${colors.border}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Pulsing Icon Capsule */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${colors.iconBg}`}>
              {renderIcon(primaryAlert.type)}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1 ${colors.badgeBg}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping mr-1" />
                  {primaryAlert.severity === 'warning' ? 'Warning' : 'Advisory'}
                </span>
                <span className={`text-[10px] font-medium flex items-center space-x-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  <Clock size={11} className="mr-0.5" />
                  {primaryAlert.effectiveTime}
                </span>
              </div>

              <h4 className={`text-sm font-bold tracking-tight mt-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {primaryAlert.title}
              </h4>

              <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                {primaryAlert.message}
              </p>

              {/* Affected Area Badge */}
              <div className="flex items-center space-x-1 mt-2">
                <span className="text-[10px] font-semibold opacity-60">Area:</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-white/90 text-stone-700 border border-stone-200/60'
                }`}>
                  📍 {primaryAlert.affectedArea}
                </span>
              </div>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={(e) => handleDismiss(primaryAlert.id, e)}
            className={`p-1 rounded-full transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-200/50'
            }`}
            title="Dismiss Alert"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Button & Details Link */}
        <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExecuteAction(primaryAlert);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center space-x-1.5 ${colors.buttonBg}`}
          >
            <span>{primaryAlert.actionText}</span>
          </button>

          <span className={`text-[11px] font-bold flex items-center space-x-0.5 ${colors.accent}`}>
            <span>View Advisory Protocol</span>
            <ChevronRight size={14} />
          </span>
        </div>
      </div>

      {/* DETAIL MODAL FOR ADVISORY ACTION */}
      {selectedAlertForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#000000] text-white border border-white/20' : 'bg-white text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.iconBg}`}>
                  {renderIcon(selectedAlertForDetails.type)}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedAlertForDetails.title}</h3>
                  <span className="text-[11px] text-stone-500 dark:text-zinc-400">{selectedAlertForDetails.effectiveTime}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlertForDetails(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <span className="text-xs font-bold block text-stone-400 dark:text-zinc-400 mb-1">
                  Conditions Detected
                </span>
                <p className="text-xs leading-relaxed">
                  {selectedAlertForDetails.message}
                </p>
              </div>

              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-zinc-900/80 border border-white/10' : 'bg-stone-50'}`}>
                <span className="text-xs font-bold block mb-1">
                  Weather Safety Recommendation
                </span>
                <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed">
                  {selectedAlertForDetails.recommendation}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold block text-stone-400 dark:text-zinc-400 mb-1">
                  Impacted Region
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-zinc-900 text-sky-300 border border-white/10' : 'bg-stone-100 text-stone-700'
                  }`}>
                    📍 {selectedAlertForDetails.affectedArea || 'Local Area'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                onClick={() => {
                  handleExecuteAction(selectedAlertForDetails);
                  setSelectedAlertForDetails(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md ${colors.buttonBg}`}
              >
                {selectedAlertForDetails.actionText}
              </button>
              <button
                onClick={() => setSelectedAlertForDetails(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION TOAST */}
      {actionSuccessMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm p-3 rounded-2xl bg-stone-900 text-white dark:bg-emerald-600 shadow-2xl flex items-center justify-between text-xs animate-card-slide-fade">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMessage(null)}
            className="p-1 text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
