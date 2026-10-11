import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
} from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({ alerts }) => {
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

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
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black uppercase tracking-tight">
                    {alert.title}
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-white/70">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-snug font-medium text-[#171717]">
                  {alert.message}
                </p>
                {alert.recommendation && (
                  <p className="text-[11px] font-bold mt-1 text-[#10B981]">
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
