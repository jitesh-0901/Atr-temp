import React, { useEffect, useState } from 'react';
import { formatDurationDetailed } from '../../utils/dateUtils';
import { Flame } from 'lucide-react';

interface LiveWorkTimerProps {
  activeCheckInTime: string | null;
  baseAccumulatedSeconds?: number;
}

export const LiveWorkTimer: React.FC<LiveWorkTimerProps> = ({
  activeCheckInTime,
  baseAccumulatedSeconds = 0,
}) => {
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  useEffect(() => {
    if (!activeCheckInTime) {
      setSessionSeconds(0);
      return;
    }

    const checkInMs = new Date(activeCheckInTime).getTime();

    const update = () => {
      const nowMs = Date.now();
      const elapsed = Math.max(0, Math.floor((nowMs - checkInMs) / 1000));
      setSessionSeconds(elapsed);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeCheckInTime]);

  const totalEffectiveSeconds = baseAccumulatedSeconds + sessionSeconds;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider">Active Session</span>
      </div>

      <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
        <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{formatDurationDetailed(totalEffectiveSeconds)}</span>
      </div>
    </div>
  );
};
