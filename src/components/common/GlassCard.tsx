import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 relative overflow-hidden ${
        isDarkMode
          ? 'bg-[#000000] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.95)]'
          : 'bg-white border border-stone-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
      } ${
        hoverable ? 'cursor-pointer snappy-touch hover:scale-[1.01]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
