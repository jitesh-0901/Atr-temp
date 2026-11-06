import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceDaySummary } from '../../types/attendance';
import { formatDate, formatTime, formatDuration } from '../../utils/dateUtils';
import { getAttendanceStatusBadge } from '../../utils/formatters';
import { Button } from '../common/Button';
import { ChevronDown, ChevronRight, Edit3, ShieldAlert, Clock } from 'lucide-react';

interface AttendanceTableProps {
  summaries: AttendanceDaySummary[];
  onDirectEdit?: (summary: AttendanceDaySummary) => void;
  onRequestCorrection?: (summary: AttendanceDaySummary) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  summaries,
  onDirectEdit,
  onRequestCorrection,
}) => {
  const { isAdmin } = useAuth();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!summaries || summaries.length === 0) {
    return (
      <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No attendance records found
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No attendance summaries match the current filter or date range criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/90 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 w-8"></th>
              <th className="py-3 px-4">Date</th>
              {isAdmin && <th className="py-3 px-4">Employee</th>}
              <th className="py-3 px-4">First In</th>
              <th className="py-3 px-4">Last Out</th>
              <th className="py-3 px-4">Worked Duration</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Audit / Note</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {summaries.map(s => {
              const isExpanded = !!expandedRows[s.id];
              const badge = getAttendanceStatusBadge(s.status);
              const hasPunches = s.events && s.events.length > 0;

              return (
                <React.Fragment key={s.id}>
                  <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center">
                      {hasPunches ? (
                        <button
                          onClick={() => toggleExpand(s.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                          title="View paired session punches"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatDate(s.localDate)}
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                        {s.employeeName || s.employeeId}
                      </td>
                    )}

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatTime(s.firstCheckIn)}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatTime(s.lastCheckOut)}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {s.totalWorkedSeconds > 0 ? (
                        formatDuration(s.totalWorkedSeconds)
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-normal">0h 00m</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[11px] max-w-xs truncate">
                      {s.hasCorrection && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium mr-1.5">
                          Adjusted
                        </span>
                      )}
                      <span className="text-slate-500 dark:text-slate-400">
                        {s.adminRemark || s.correctionRemark || '—'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && onDirectEdit ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDirectEdit(s)}
                            leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
                          >
                            Direct Edit
                          </Button>
                        ) : !isAdmin && onRequestCorrection ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRequestCorrection(s)}
                            leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                          >
                            Correct
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded punch session timeline */}
                  {isExpanded && hasPunches && (
                    <tr className="bg-slate-50/50 dark:bg-slate-950/40">
                      <td colSpan={isAdmin ? 9 : 8} className="py-3 px-6">
                        <div className="pl-6 border-l-2 border-brand-500/50 space-y-2 py-1">
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Raw Punch Chronology ({s.events.length} events)
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {s.events.map(ev => (
                              <div
                                key={ev.id}
                                className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center gap-1.5"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    ev.eventType === 'CHECK_IN'
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {ev.eventType === 'CHECK_IN' ? 'Punch In' : 'Punch Out'}:
                                </span>
                                <span className="font-mono text-slate-600 dark:text-slate-400">
                                  {formatTime(ev.timestamp)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
