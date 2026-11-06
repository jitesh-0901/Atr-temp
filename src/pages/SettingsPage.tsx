import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AttendanceRulesSettings, AutomationSimulator } from '../components/admin';
import { Settings, ShieldAlert } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          System Settings & Absence Automation (MVP F10 & F12)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {isAdmin
            ? 'Configure organization timezone, attendance cutoff deadline, working calendar, and test scheduled absence background tasks.'
            : 'View organization attendance rules and working calendar policies (Read-only for employees).'}
        </p>
      </div>

      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            You are viewing organization settings in employee mode (read-only). To modify parameters
            or trigger background jobs, switch to an Admin account in the header.
          </span>
        </div>
      )}

      {/* Rules configuration */}
      <AttendanceRulesSettings />

      {/* Background absence automation simulator */}
      <AutomationSimulator />
    </div>
  );
};
