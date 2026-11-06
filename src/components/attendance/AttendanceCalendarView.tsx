import React, { useState } from 'react';
import { AttendanceDaySummary } from '../../types/attendance';
import { Holiday } from '../../types/holiday';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { formatDuration } from '../../utils/dateUtils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceCalendarViewProps {
  summaries: AttendanceDaySummary[];
  holidays: Holiday[];
  onSelectDate?: (date: string) => void;
}

export const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({
  summaries,
  holidays,
  onSelectDate,
}) => {
  // Current view date (November 2026 as per ATR project timeline)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed: 10 = November

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // 0=Mon, 6=Sun

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const dayCells = [];
  // Pad previous month days
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(null);
  }
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayCells.push({ day, dayStr });
  }

  const weekHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="shadow-2xs overflow-hidden border-slate-200/90 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Monthly Attendance & Meeting Calendar Matrix
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono px-2 text-slate-800 dark:text-slate-200">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1 border-b border-slate-100 dark:border-slate-800">
          {weekHeaders.map(w => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {dayCells.map((item, idx) => {
            if (!item) {
              return (
                <div
                  key={`pad_${idx}`}
                  className="h-20 sm:h-24 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 border border-transparent opacity-30"
                />
              );
            }

            const { day, dayStr } = item;
            const summary = summaries.find(s => s.localDate === dayStr);
            const holiday = holidays.find(h => h.date === dayStr && h.isActive);
            const isToday = dayStr === '2026-11-06';

            let cellBg = 'bg-white dark:bg-slate-900/80 hover:border-brand-400 dark:hover:border-brand-600';
            let dotColor = '';

            if (summary?.status === 'PRESENT') {
              dotColor = 'bg-emerald-500';
            } else if (summary?.status === 'ABSENT') {
              dotColor = 'bg-rose-500';
            } else if (summary?.status === 'ON_LEAVE') {
              dotColor = 'bg-amber-500';
            }

            return (
              <div
                key={dayStr}
                onClick={() => onSelectDate && onSelectDate(dayStr)}
                className={`h-20 sm:h-24 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-left transition-all duration-150 flex flex-col justify-between cursor-pointer group shadow-2xs ${cellBg} ${
                  isToday ? 'ring-2 ring-brand-500/50 bg-brand-50/30 dark:bg-brand-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {day}
                  </span>
                  {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor} shadow-xs`} />}
                </div>

                {/* Day metadata preview */}
                <div className="space-y-1">
                  {holiday ? (
                    <span className="block truncate text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {holiday.name}
                    </span>
                  ) : summary?.totalWorkedSeconds ? (
                    <span className="block font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 px-1 py-0.5 rounded truncate">
                      {formatDuration(summary.totalWorkedSeconds)}
                    </span>
                  ) : summary?.status === 'ABSENT' ? (
                    <span className="block text-[9px] font-bold text-rose-600 dark:text-rose-400">
                      Absent
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present & Worked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Approved Leave
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent (Missed Deadline)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Organization Holiday
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
