import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceCorrectionRequest } from '../../types/correction';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { getCorrectionStatusBadge } from '../../utils/formatters';
import { Button } from '../common/Button';
import { CheckCircle, Clock } from 'lucide-react';

interface CorrectionHistoryTableProps {
  requests: AttendanceCorrectionRequest[];
  onReview?: (req: AttendanceCorrectionRequest) => void;
}

export const CorrectionHistoryTable: React.FC<CorrectionHistoryTableProps> = ({
  requests,
  onReview,
}) => {
  const { isAdmin } = useAuth();

  if (!requests || requests.length === 0) {
    return (
      <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No attendance corrections recorded
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No pending or historical correction requests found.
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
              {isAdmin && <th className="py-3 px-4">Employee</th>}
              <th className="py-3 px-4">Target Date</th>
              <th className="py-3 px-4">Adjustment Field</th>
              <th className="py-3 px-4">Requested Times</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reviewer Remark</th>
              {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {requests.map(req => {
              const badge = getCorrectionStatusBadge(req.status);

              return (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {isAdmin && (
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                      {req.employeeName}
                    </td>
                  )}

                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(req.attendanceDate)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300 uppercase text-[11px]">
                    {req.field.replace(/_/g, ' ')}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                    {req.requestedFirstCheckIn && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold mr-2">
                        In: {formatTime(req.requestedFirstCheckIn)}
                      </span>
                    )}
                    {req.requestedLastCheckOut && (
                      <span className="text-brand-700 dark:text-brand-400 font-semibold">
                        Out: {formatTime(req.requestedLastCheckOut)}
                      </span>
                    )}
                    {!req.requestedFirstCheckIn && !req.requestedLastCheckOut && '—'}
                  </td>

                  <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                    {req.reason}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[11px] max-w-xs truncate text-slate-500 dark:text-slate-400">
                    {req.reviewRemark ? (
                      <span>
                        <strong className="text-slate-700 dark:text-slate-300 font-medium">
                          {req.reviewedByName || 'Admin'}:
                        </strong>{' '}
                        {req.reviewRemark}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {isAdmin && (
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {req.status === 'PENDING' && onReview && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onReview(req)}
                          leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Review
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
