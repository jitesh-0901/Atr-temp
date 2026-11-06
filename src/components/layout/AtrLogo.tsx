import React from 'react';

interface AtrLogoProps {
  className?: string;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AtrLogo: React.FC<AtrLogoProps> = ({
  className = '',
  compact = false,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {/* ATR Geometric Shield / Clock Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-brand-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0`}
      >
        {/* SVG Emblem: Clock Dial + Punch Checkmark */}
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Dial circle arc */}
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
          {/* Dynamic clock hands / timing marker */}
          <polyline points="12 7 12 12 15 14" stroke="currentColor" strokeWidth="2.2" />
          {/* Verified punch check accent */}
          <path
            d="M17 9l-5 5-2-2"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Live timing pulse node */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-2xs" />
      </div>

      {/* Wordmark */}
      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${textSizes[size]} text-slate-900 dark:text-white leading-none`}
            >
              ATR
            </span>
            <span className="text-[9px] font-extrabold tracking-widest px-1.5 py-0.5 rounded uppercase bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              V1.0
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mt-0.5">
            ATTENDANCE TRACKER
          </span>
        </div>
      )}
    </div>
  );
};
