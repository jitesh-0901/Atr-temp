import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LeaveRequest } from '../../types/leave';
import { formatDate } from '../../utils/dateUtils';
import { getLeaveStatusBadge, getLeaveTypeLabel } from '../../utils/formatters';
import { Button } from '../common/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface LeaveHistoryTableProps {
  requests: LeaveRequest[];
  onReview?: (req: LeaveRequest) => void;
  onCancel?: (req: LeaveRequest) => void;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  requests,
  onReview,
  onCancel,
}) => {
  const { currentUser, isAdmin } = useAuth();

  if (!requests || requests.length === 0) {
    return (
      <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No leave requests recorded
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No pending, approved, or historic leave applications found.
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
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Decision / Remarks</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {requests.map(req => {
              const badge = getLeaveStatusBadge(req.status);
              const canEmployeeCancel =
                (req.status === 'PENDING' || req.status === 'APPROVED') &&
                (req.employeeId === currentUser?.id || isAdmin);

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

                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                    {getLeaveTypeLabel(req.leaveType)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(req.startDate)}
                    {req.startDate !== req.endDate && ` – ${formatDate(req.endDate)}`}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono">
                    {req.daysCount} {req.daysCount === 1 ? 'day' : 'days'}
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
                    {req.status === 'CANCELLED' ? (
                      <span className="italic text-slate-400">
                        Cancelled: {req.cancellationReason || 'By user'}
                      </span>
                    ) : req.decisionRemark ? (
                      <span>
                        <strong className="text-slate-700 dark:text-slate-300 font-medium">
                          {req.decidedByName || 'Admin'}:
                        </strong>{' '}
                        {req.decisionRemark}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {isAdmin && req.status === 'PENDING' && onReview && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onReview(req)}
                          leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Review
                        </Button>
                      )}

                      {canEmployeeCancel && onCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancel(req)}
                          leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
