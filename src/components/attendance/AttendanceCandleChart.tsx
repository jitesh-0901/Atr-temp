import React, { useState } from 'react';
import { AttendanceDaySummary } from '../../types/attendance';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { formatDuration, formatDate, formatTime } from '../../utils/dateUtils';
import { BarChart3, Sparkles, Info } from 'lucide-react';

interface AttendanceCandleChartProps {
  summaries: AttendanceDaySummary[];
}

export const AttendanceCandleChart: React.FC<AttendanceCandleChartProps> = ({ summaries }) => {
  const [hoveredDay, setHoveredDay] = useState<AttendanceDaySummary | null>(null);

  // Take the last 7 to 14 days chronologically
  const sorted = [...summaries]
    .sort((a, b) => a.localDate.localeCompare(b.localDate))
    .slice(-10);

  // Map 08:00 AM (8.0) to 08:00 PM (20.0) on Y-axis
  const startHour = 8; // 8 AM
  const endHour = 20; // 8 PM
  const totalHoursSpan = endHour - startHour; // 12 hours

  const getHourDecimal = (iso: string | null): number | null => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return null;
      return d.getHours() + d.getMinutes() / 60;
    } catch {
      return null;
    }
  };

  return (
    <Card className="shadow-2xs overflow-hidden border-slate-200/90 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Attendance Candlestick & Work Span Visualizer
          </span>
          <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-600" /> Daily Punch Spans (8 AM – 8 PM)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visual candlestick representation of daily work intervals: the bottom of each candle represents your first check-in, the top marks your last check-out, and the wick shows peak activity.
        </p>

        {/* Chart Canvas */}
        <div className="relative pt-6 pb-2">
          {/* Y-axis guidelines */}
          <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-between pointer-events-none opacity-40 text-[10px] text-slate-400 font-mono">
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>08:00 PM (Close)</span>
              <span>20:00</span>
            </div>
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>05:00 PM (Shift End)</span>
              <span>17:00</span>
            </div>
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>01:00 PM (Lunch Break)</span>
              <span>13:00</span>
            </div>
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>09:00 AM (Shift Start)</span>
              <span>09:00</span>
            </div>
          </div>

          {/* Candlestick columns */}
          <div className="h-56 flex items-end justify-around gap-2 px-6 relative z-10">
            {sorted.map(day => {
              const inDec = getHourDecimal(day.firstCheckIn);
              const outDec = getHourDecimal(day.lastCheckOut) || (inDec ? inDec + 1 : null);

              const isPresent = day.status === 'PRESENT' && inDec !== null;
              const isAbsent = day.status === 'ABSENT';
              const isLeave = day.status === 'ON_LEAVE';
              const isWeekend = day.status === 'WEEKEND';

              // Calculate bottom % and height % relative to 8 AM - 8 PM
              let bottomPct = 0;
              let heightPct = 6; // default minimum pill height

              if (isPresent && inDec !== null && outDec !== null) {
                const clampedIn = Math.max(startHour, Math.min(endHour, inDec));
                const clampedOut = Math.max(startHour, Math.min(endHour, outDec));
                bottomPct = Math.max(0, ((clampedIn - startHour) / totalHoursSpan) * 100);
                const spanHeight = ((clampedOut - clampedIn) / totalHoursSpan) * 100;
                heightPct = Math.max(8, spanHeight);
              }

              // Color determination
              let candleColor = 'bg-emerald-500 border-emerald-600 dark:bg-emerald-400';
              let glowColor = 'shadow-emerald-500/30';
              if (day.totalWorkedSeconds < 28800 && isPresent) {
                // < 8 hours
                candleColor = 'bg-amber-500 border-amber-600 dark:bg-amber-400';
                glowColor = 'shadow-amber-500/30';
              }
              if (isAbsent) {
                candleColor = 'bg-rose-500 border-rose-600';
                glowColor = 'shadow-rose-500/30';
              }
              if (isLeave) {
                candleColor = 'bg-brand-500 border-brand-600';
                glowColor = 'shadow-brand-500/30';
              }
              if (isWeekend) {
                candleColor = 'bg-slate-300 dark:bg-slate-700 border-slate-400';
                glowColor = 'shadow-slate-500/10';
              }

              return (
                <div
                  key={day.id}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Candlestick Wick & Body wrapper */}
                  <div className="w-full max-w-[28px] h-full flex items-end justify-center relative">
                    {/* The Candlestick Wick (vertical line) */}
                    {isPresent && (
                      <div
                        className="absolute w-0.5 bg-slate-300 dark:bg-slate-600 z-0 transition-all duration-200 group-hover:bg-brand-500"
                        style={{
                          bottom: `${Math.max(0, bottomPct - 4)}%`,
                          height: `${Math.min(95, heightPct + 8)}%`,
                        }}
                      />
                    )}

                    {/* The Candlestick Real Body */}
                    <div
                      style={{
                        bottom: isPresent ? `${bottomPct}%` : '4%',
                        height: isPresent ? `${heightPct}%` : '10%',
                      }}
                      className={`absolute w-full rounded-md border shadow-md transition-all duration-200 group-hover:scale-110 group-hover:z-20 ${candleColor} ${glowColor}`}
                    />
                  </div>

                  {/* Day Label below column */}
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 font-mono group-hover:text-brand-600 transition-colors">
                    {day.localDate.slice(8)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tooltip / Inspector Card */}
        {hoveredDay ? (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-brand-300 dark:border-brand-700/80 shadow-md text-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatDate(hoveredDay.localDate)}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                {hoveredDay.status}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">CHECK-IN:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatTime(hoveredDay.firstCheckIn)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">CHECK-OUT:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatTime(hoveredDay.lastCheckOut)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">TOTAL WORKED:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatDuration(hoveredDay.totalWorkedSeconds)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Hover over any daily candle column above to inspect precise check-in, check-out, and worked intervals.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
