import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-brand-50 dark:bg-brand-950/40',
  iconColor = 'text-brand-600 dark:text-brand-400',
  trend,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        'p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
        onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 tracking-tight">
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded',
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50'
                    : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50'
                )}
              >
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl shrink-0', iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
