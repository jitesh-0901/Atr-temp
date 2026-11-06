import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LiveWorkTimer } from './LiveWorkTimer';
import { formatTime, formatDuration, getTodayLocalDate, formatDate } from '../../utils/dateUtils';
import { LogIn, LogOut, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const CheckInOutCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { getTodayState, checkIn, checkOut } = useAttendance();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!currentUser) return null;

  const todayState = getTodayState(currentUser.id);
  const { isActiveSession, activeCheckInTime, todaySummary } = todayState;

  const todayDateStr = getTodayLocalDate();

  const handleCheckIn = () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    const result = checkIn(currentUser.id, currentUser.name);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to check in.');
    } else {
      setSuccessNotice('Check-in registered successfully!');
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  const handleCheckOut = () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    const result = checkOut(currentUser.id);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to check out.');
    } else {
      setSuccessNotice('Check-out registered successfully! Session duration added.');
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  return (
    <Card className={`relative overflow-hidden border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-300 ${isActiveSession ? 'ring-2 ring-brand-500/30 shadow-brand-500/10' : ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Attendance • {formatDate(todayDateStr)}
              </span>
              <Badge
                variant={
                  isActiveSession
                    ? 'success'
                    : todaySummary && todaySummary.events.length > 0
                    ? 'default'
                    : 'warning'
                }
                dot
              >
                {isActiveSession
                  ? 'Currently Working'
                  : todaySummary && todaySummary.events.length > 0
                  ? 'Checked Out'
                  : 'Not Checked In Yet'}
              </Badge>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {currentUser.name}
            </h2>

            {/* Live timer or completed status */}
            {isActiveSession ? (
              <LiveWorkTimer
                activeCheckInTime={activeCheckInTime}
                baseAccumulatedSeconds={todaySummary?.totalWorkedSeconds || 0}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  Total Paired Worked Today:{' '}
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold font-mono">
                    {formatDuration(todaySummary?.totalWorkedSeconds || 0)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Action button column */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {!isActiveSession ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckIn}
                leftIcon={<LogIn className="w-5 h-5 transition-transform group-hover:scale-110" />}
                className="group px-7 py-3 text-sm font-bold shadow-md shadow-brand-600/30 hover:shadow-lg hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                {todaySummary && todaySummary.events.length > 0
                  ? 'Punch In Again (New Session)'
                  : 'Check In Now'}
              </Button>
            ) : (
              <Button
                variant="danger"
                size="lg"
                onClick={handleCheckOut}
                leftIcon={<LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />}
                className="group px-7 py-3 text-sm font-bold shadow-md shadow-rose-600/30 hover:shadow-lg hover:shadow-rose-600/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Check Out Session
              </Button>
            )}
          </div>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Daily Summary Metrics (F04: first check-in, last check-out, worked duration) */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              First Check-In
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
              {formatTime(todaySummary?.firstCheckIn)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Last Check-Out
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
              {formatTime(todaySummary?.lastCheckOut)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Paired Time
            </p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatDuration(todaySummary?.totalWorkedSeconds || 0)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Punches Recorded
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
              {todaySummary?.events.length || 0} events
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
