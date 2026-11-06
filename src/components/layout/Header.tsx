import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { ThemeToggle } from './ThemeToggle';
import { RoleSwitcher } from './RoleSwitcher';
import { Mail, Menu, Clock, LogOut } from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, pageTitle }) => {
  const { currentUser, logout } = useAuth();
  const { notifications, openOutbox } = useNotification();
  const { settings } = useSettings();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 transition-colors shadow-2xs">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {pageTitle}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-brand-600 dark:text-brand-400" />
              {currentTime}
            </span>
            <span>•</span>
            <span className="truncate">{settings.timezone.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Email Outbox Drawer Trigger (MVP F03) */}
        <button
          onClick={openOutbox}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-brand-50/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95"
          title="Open Email Notification Outbox (MVP F03)"
          aria-label="Email outbox"
        >
          <Mail className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
              {notifications.length}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Evaluation Role Switcher */}
        <RoleSwitcher />

        {/* User logout */}
        {currentUser && (
          <button
            onClick={logout}
            className="hidden sm:flex p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign out of current account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
