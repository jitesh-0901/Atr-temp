import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { useSettings } from '../context/SettingsContext';
import { CheckInOutCard } from '../components/attendance/CheckInOutCard';
import { PunchHistoryTimeline } from '../components/attendance/PunchHistoryTimeline';
import { AttendanceCandleChart } from '../components/attendance/AttendanceCandleChart';
import { AttendanceCalendarView } from '../components/attendance/AttendanceCalendarView';
import { CorrectionRequestModal } from '../components/corrections/CorrectionRequestModal';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Clock, FileEdit, ShieldCheck, BarChart3, Calendar } from 'lucide-react';
import { getTodayLocalDate } from '../utils/dateUtils';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { getTodayState, getEmployeeSummaries } = useAttendance();
  const { holidays } = useSettings();
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [activeView, setActiveView] = useState<'timeline' | 'candle' | 'calendar'>('timeline');

  if (!currentUser) return null;

  const todayState = getTodayState(currentUser.id);
  const summaries = getEmployeeSummaries(currentUser.id);
  const todayDate = getTodayLocalDate();

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining Spec F04 Rules */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            ATR Specification F04: Real-Time Attendance & Multi-Cycle Event Engine
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Employees can check in and check out multiple times per local workday. The engine maintains
            raw event chronology, tracks your earliest first check-in and latest check-out, and calculates
            worked duration strictly from valid paired intervals without inventing unworked time.
          </p>
        </div>
      </div>

      {/* Main Punch Card with live timer & check-in/out button */}
      <CheckInOutCard />

      {/* View Switcher Tabs (Timeline, Candlestick Chart, Calendar Matrix) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'timeline'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Today's Timeline
          </button>

          <button
            onClick={() => setActiveView('candle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'candle'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Candlestick Spans
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'calendar'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar Matrix
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCorrectionOpen(true)}
          leftIcon={<FileEdit className="w-3.5 h-3.5" />}
        >
          Missed a Punch? Request Correction
        </Button>
      </div>

      {/* Render Selected View */}
      {activeView === 'timeline' && (
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Today's Session Intervals & Punch Chronology
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PunchHistoryTimeline events={todayState.events} />
          </CardContent>
        </Card>
      )}

      {activeView === 'candle' && (
        <AttendanceCandleChart summaries={summaries} />
      )}

      {activeView === 'calendar' && (
        <AttendanceCalendarView summaries={summaries} holidays={holidays} />
      )}

      {/* Correction modal */}
      <CorrectionRequestModal
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        prefillDate={todayDate}
      />
    </div>
  );
};
