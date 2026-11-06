import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LeaveRequest } from '../../types/leave';
import { formatDate } from '../../utils/dateUtils';
import { getLeaveTypeLabel } from '../../utils/formatters';
import { Check, XCircle } from 'lucide-react';

interface LeaveDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
}

export const LeaveDecisionModal: React.FC<LeaveDecisionModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { currentUser } = useAuth();
  const { approveLeaveRequest, rejectLeaveRequest } = useLeave();
  const [remark, setRemark] = useState('');

  if (!request || !currentUser) return null;

  const handleApprove = () => {
    approveLeaveRequest(request.id, currentUser, remark);
    setRemark('');
    onClose();
  };

  const handleReject = () => {
    rejectLeaveRequest(request.id, currentUser, remark);
    setRemark('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Application"
      description={`Application from ${request.employeeName} (${request.employeeDepartment || 'Engineering'})`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Reject Request
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleApprove}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Approve Leave
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Leave Category:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {getLeaveTypeLabel(request.leaveType)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Requested Period:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatDate(request.startDate)} to {formatDate(request.endDate)} ({request.daysCount}{' '}
              days)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Submitted At:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatDate(request.submittedAt.split('T')[0])}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Employee Reason
          </label>
          <p className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            "{request.reason}"
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Admin Decision Remark / Notes
          </label>
          <textarea
            rows={2}
            value={remark}
            onChange={e => setRemark(e.target.value)}
            placeholder="e.g. Approved. Please ensure handover to peer before departure..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>
    </Modal>
  );
};
