import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { PieChart, Users, CheckCircle2, UserX, CalendarOff } from 'lucide-react';

interface AttendanceRateChartProps {
  presentCount: number;
  absentCount: number;
  onLeaveCount: number;
  totalActive: number;
}

export const AttendanceRateChart: React.FC<AttendanceRateChartProps> = ({
  presentCount,
  absentCount,
  onLeaveCount,
  totalActive,
}) => {
  const presentPct = totalActive > 0 ? Math.round((presentCount / totalActive) * 100) : 0;
  const absentPct = totalActive > 0 ? Math.round((absentCount / totalActive) * 100) : 0;
  const onLeavePct = totalActive > 0 ? Math.round((onLeaveCount / totalActive) * 100) : 0;
  const notRecordedPct = Math.max(0, 100 - (presentPct + absentPct + onLeavePct));

  return (
    <Card className="shadow-2xs">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <PieChart className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Today's Organization Attendance Distribution
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Progress Bar Segmented */}
        <div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${presentPct}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Present: ${presentPct}%`}
            />
            <div
              style={{ width: `${onLeavePct}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`On Leave: ${onLeavePct}%`}
            />
            <div
              style={{ width: `${absentPct}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`Absent: ${absentPct}%`}
            />
            <div
              style={{ width: `${notRecordedPct}%` }}
              className="bg-slate-300 dark:bg-slate-700 h-full transition-all duration-500"
              title={`Pending / Not Marked: ${notRecordedPct}%`}
            />
          </div>
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Present</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {presentCount}
            </p>
            <p className="text-[11px] text-slate-500">{presentPct}% of staff</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold mb-1">
              <CalendarOff className="w-3.5 h-3.5" />
              <span>On Leave</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {onLeaveCount}
            </p>
            <p className="text-[11px] text-slate-500">{onLeavePct}% of staff</p>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold mb-1">
              <UserX className="w-3.5 h-3.5" />
              <span>Marked Absent</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {absentCount}
            </p>
            <p className="text-[11px] text-slate-500">{absentPct}% of staff</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Total Active</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {totalActive}
            </p>
            <p className="text-[11px] text-slate-500">Active roster</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
