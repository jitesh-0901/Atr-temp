import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}) => {
  const variantStyles = {
    default:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success:
      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    danger:
      'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    info:
      'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-700/80 font-semibold',
    neutral:
      'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-brand-600',
    neutral: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] font-medium px-2 py-0.5 rounded-md border',
    md: 'text-xs font-medium px-2.5 py-1 rounded-md border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
