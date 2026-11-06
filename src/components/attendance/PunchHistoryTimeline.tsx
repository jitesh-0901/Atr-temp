import React from 'react';
import { AttendanceEvent } from '../../types/attendance';
import { formatTime, formatDuration } from '../../utils/dateUtils';
import { LogIn, LogOut, Clock, ArrowRight } from 'lucide-react';

interface PunchHistoryTimelineProps {
  events: AttendanceEvent[];
}

export const PunchHistoryTimeline: React.FC<PunchHistoryTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No attendance events recorded today yet.
        </p>
      </div>
    );
  }

  // Sort chronological
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group into pairs for session duration
  const sessions: {
    checkIn: AttendanceEvent;
    checkOut?: AttendanceEvent;
    durationSeconds?: number;
  }[] = [];

  let currentIn: AttendanceEvent | null = null;
  for (const ev of sorted) {
    if (ev.eventType === 'CHECK_IN') {
      currentIn = ev;
    } else if (ev.eventType === 'CHECK_OUT' && currentIn) {
      const dur = Math.max(
        0,
        Math.floor(
          (new Date(ev.timestamp).getTime() - new Date(currentIn.timestamp).getTime()) / 1000
        )
      );
      sessions.push({ checkIn: currentIn, checkOut: ev, durationSeconds: dur });
      currentIn = null;
    }
  }

  if (currentIn) {
    sessions.push({ checkIn: currentIn });
  }

  return (
    <div className="space-y-4">
      {/* Paired Sessions Overview */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Today's Work Intervals ({sessions.length})
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {sessions.map((sess, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-[10px] flex items-center justify-center text-slate-700 dark:text-slate-300">
                  {idx + 1}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatTime(sess.checkIn.timestamp)}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {sess.checkOut ? formatTime(sess.checkOut.timestamp) : 'In Progress'}
                </span>
              </div>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  sess.durationSeconds !== undefined
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 animate-pulse'
                }`}
              >
                {sess.durationSeconds !== undefined
                  ? formatDuration(sess.durationSeconds)
                  : 'Live'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Event Punch Log */}
      <div>
        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Punch Chronology
        </h5>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {sorted.map(e => (
            <div
              key={e.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md ${
                    e.eventType === 'CHECK_IN'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                  }`}
                >
                  {e.eventType === 'CHECK_IN' ? (
                    <LogIn className="w-3.5 h-3.5" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {e.eventType === 'CHECK_IN' ? 'Checked In' : 'Checked Out'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2">
                    Source: {e.source}
                  </span>
                </div>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                {formatTime(e.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
