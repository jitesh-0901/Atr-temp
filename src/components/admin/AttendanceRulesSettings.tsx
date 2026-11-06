import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Save, Sliders, CheckCircle2 } from 'lucide-react';

export const AttendanceRulesSettings: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [timezone, setTimezone] = useState(settings.timezone);
  const [deadline, setDeadline] = useState(settings.attendanceDeadline);
  const [workingDays, setWorkingDays] = useState<number[]>(settings.workingDays);
  const [autoAbsentEnabled, setAutoAbsentEnabled] = useState(settings.autoAbsentEnabled);
  const [success, setSuccess] = useState(false);

  if (!currentUser) return null;

  const handleToggleDay = (dayId: number) => {
    if (!isAdmin) return;
    setWorkingDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    updateSettings(
      {
        timezone,
        attendanceDeadline: deadline,
        workingDays,
        autoAbsentEnabled,
      },
      currentUser
    );

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const days = [
    { id: 1, label: 'Monday' },
    { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' },
    { id: 4, label: 'Thursday' },
    { id: 5, label: 'Friday' },
    { id: 6, label: 'Saturday' },
    { id: 7, label: 'Sunday' },
  ];

  return (
    <Card className="shadow-2xs">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Attendance Rules & Organization Parameters (MVP F10)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Organisation Canonical Timezone"
              disabled={!isAdmin}
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              options={[
                { value: 'Asia/Kolkata (IST, UTC+5:30)', label: 'Asia/Kolkata (IST, UTC+5:30)' },
                { value: 'UTC (UTC+0:00)', label: 'UTC (UTC+0:00)' },
                { value: 'America/New_York (EST, UTC-5:00)', label: 'America/New_York (EST, UTC-5:00)' },
                { value: 'Europe/London (GMT, UTC+0:00)', label: 'Europe/London (GMT, UTC+0:00)' },
                { value: 'Asia/Singapore (SGT, UTC+8:00)', label: 'Asia/Singapore (SGT, UTC+8:00)' },
              ]}
              helperText="Determines official local workday boundaries and punch reconciliation."
            />

            <Input
              label="Attendance Cutoff Deadline (24h)"
              disabled={!isAdmin}
              type="time"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              helperText="Employees without check-in by this cutoff will be processed for absence."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Configured Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {days.map(d => {
                const isSelected = workingDays.includes(d.id);
                return (
                  <button
                    type="button"
                    key={d.id}
                    disabled={!isAdmin}
                    onClick={() => handleToggleDay(d.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={autoAbsentEnabled}
                onChange={e => setAutoAbsentEnabled(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enable Scheduled Celery Automatic Absence Marking Engine
              </span>
            </label>

            {isAdmin && (
              <div className="flex items-center gap-2">
                {success && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
                <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Settings
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
