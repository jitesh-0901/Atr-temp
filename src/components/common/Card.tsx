import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl shadow-xs transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <h3
      className={cn(
        'text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight',
        className
      )}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <p className={cn('text-xs text-slate-500 dark:text-slate-400 mt-0.5', className)}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 rounded-b-2xl flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
