import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User as UserIcon, ChevronDown, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, users, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-brand-50/40 dark:hover:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-800 transition-all shadow-2xs"
      >
        <span className="flex items-center gap-1.5">
          {currentUser.role === 'ADMIN' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          ) : (
            <UserIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          )}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {currentUser.name}
          </span>
        </span>
        <Badge
          variant={currentUser.role === 'ADMIN' ? 'info' : 'neutral'}
          size="sm"
          className="ml-0.5"
        >
          {currentUser.role}
        </Badge>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-[11px] font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
              Quick Role Switcher (Evaluation)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch role to test Admin vs Employee perspectives
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {users.map(u => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  disabled={!u.isActive}
                  onClick={() => {
                    if (u.isActive) {
                      switchUser(u.id);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-brand-50/90 dark:bg-brand-950/60 text-brand-950 dark:text-brand-100 font-semibold'
                      : u.isActive
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      : 'opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        u.role === 'ADMIN'
                          ? 'bg-brand-600 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {u.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </span>
                        {!u.isActive && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 px-1 py-0.2 rounded font-bold">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {u.jobTitle} • {u.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Badge variant={u.role === 'ADMIN' ? 'info' : 'neutral'} size="sm">
                      {u.role}
                    </Badge>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
