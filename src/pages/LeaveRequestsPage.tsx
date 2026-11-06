import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { LeaveBalanceCards } from '../components/leave/LeaveBalanceCards';
import { LeaveHistoryTable } from '../components/leave/LeaveHistoryTable';
import { LeaveRequestModal } from '../components/leave/LeaveRequestModal';
import { LeaveDecisionModal } from '../components/leave/LeaveDecisionModal';
import { LeaveCancelModal } from '../components/leave/LeaveCancelModal';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { LeaveRequest } from '../types/leave';
import { CalendarPlus } from 'lucide-react';

export const LeaveRequestsPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { leaveRequests, getEmployeeLeaves, getLeaveBalance } = useLeave();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);
  const [cancelRequest, setCancelRequest] = useState<LeaveRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!currentUser) return null;

  const baseLeaves = isAdmin ? leaveRequests : getEmployeeLeaves(currentUser.id);
  const leaveBalance = getLeaveBalance(currentUser.id);

  const filteredLeaves = baseLeaves.filter(l => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Apply Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {isAdmin ? 'Organisation Leave Approvals & History' : 'My Leave Applications & Balance'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdmin
              ? 'Review pending time-off applications, record decision remarks, and audit cancellation trails.'
              : 'Submit new leave requests, monitor approval status, or cancel pending/approved applications.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsApplyModalOpen(true)}
          leftIcon={<CalendarPlus className="w-4 h-4" />}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Quota balance cards (for employee) */}
      {!isAdmin && <LeaveBalanceCards balance={leaveBalance} />}

      {/* Filter and Table Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending Review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredLeaves.length} applications
          </span>
        </div>

        <LeaveHistoryTable
          requests={filteredLeaves}
          onReview={isAdmin ? req => setReviewRequest(req) : undefined}
          onCancel={req => setCancelRequest(req)}
        />
      </div>

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      <LeaveDecisionModal
        isOpen={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
        request={reviewRequest}
      />

      <LeaveCancelModal
        isOpen={!!cancelRequest}
        onClose={() => setCancelRequest(null)}
        request={cancelRequest}
      />
    </div>
  );
};
