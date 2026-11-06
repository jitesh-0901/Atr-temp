import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${className}`}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 transition-transform hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45 text-amber-400" />
      )}
    </button>
  );
};
