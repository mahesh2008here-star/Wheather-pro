import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Wind, 
  Snowflake, 
  CloudRain, 
  Zap, 
  ChevronRight, 
  X, 
  CheckCircle2
} from 'lucide-react';
import { WeatherAlert } from '../types/weather';
import { useTheme } from '../context/ThemeContext';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({ alerts }) => {
  const { isDarkMode } = useTheme();
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  const activeAlerts = alerts.filter(a => !dismissedAlertIds.includes(a.id));

  if (activeAlerts.length === 0) return null;

  return (
    <div className="w-full px-4 py-1.5 select-none animate-tab-switch">
      <div className="space-y-2">
        {activeAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`p-3.5 rounded-2xl border flex items-start justify-between shadow-xs ${
              alert.severity === 'warning'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black uppercase tracking-tight">
                    {alert.title}
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10">
                    {alert.severity}
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-snug font-medium ${
                  isDarkMode ? 'text-[#EEF5F0]' : 'text-[#132E20]'
                }`}>
                  {alert.message}
                </p>
                {alert.recommendation && (
                  <p className="text-[11px] font-bold mt-1 text-[#059669] dark:text-[#34D399]">
                    Action: {alert.recommendation}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setDismissedAlertIds(prev => [...prev, alert.id])}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
              title="Dismiss warning"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
