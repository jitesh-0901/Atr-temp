import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Globe, Clock, CalendarDays, Check } from 'lucide-react';

export const WorkingCalendarCard: React.FC = () => {
  const { settings } = useSettings();

  const daysOfWeek = [
    { id: 1, label: 'Mon', full: 'Monday' },
    { id: 2, label: 'Tue', full: 'Tuesday' },
    { id: 3, label: 'Wed', full: 'Wednesday' },
    { id: 4, label: 'Thu', full: 'Thursday' },
    { id: 5, label: 'Fri', full: 'Friday' },
    { id: 6, label: 'Sat', full: 'Saturday' },
    { id: 7, label: 'Sun', full: 'Sunday' },
  ];

  return (
    <Card className="shadow-2xs">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Standard Working Calendar & Policy
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Weekly days pill matrix */}
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Weekly Working Days Schedule
          </label>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(d => {
              const isWorkDay = settings.workingDays.includes(d.id);
              return (
                <div
                  key={d.id}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isWorkDay
                      ? 'bg-brand-50/70 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800 text-brand-900 dark:text-brand-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <p className="text-xs font-bold">{d.label}</p>
                  <p className="text-[10px] mt-0.5">
                    {isWorkDay ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Check className="w-3 h-3" /> Work
                      </span>
                    ) : (
                      'Off'
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timezone and Deadline parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Organisation Timezone:
            </span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1 font-mono">
              {settings.timezone}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Attendance Cutoff Deadline:
            </span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1 font-mono">
              {settings.attendanceDeadline} IST
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
