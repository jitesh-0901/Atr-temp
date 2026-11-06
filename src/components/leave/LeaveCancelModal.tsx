import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LeaveRequest } from '../../types/leave';
import { formatDate } from '../../utils/dateUtils';
import { AlertTriangle } from 'lucide-react';

interface LeaveCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
}

export const LeaveCancelModal: React.FC<LeaveCancelModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { currentUser } = useAuth();
  const { cancelLeaveRequest } = useLeave();
  const [reason, setReason] = useState('');

  if (!request || !currentUser) return null;

  const handleCancel = () => {
    cancelLeaveRequest(request.id, currentUser, reason);
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Leave Request"
      description={`Are you sure you want to cancel your ${request.leaveType} leave for ${formatDate(request.startDate)}?`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Keep Request
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancel}
            leftIcon={<AlertTriangle className="w-4 h-4" />}
          >
            Confirm Cancellation
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Note on Leave Cancellation</p>
          <p className="text-[11px] mt-0.5">
            Per ATR Spec F06: You can cancel both PENDING and APPROVED leave. Cancelling will
            re-credit your leave balance and notify the Administrator via email.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Optional Reason for Cancellation
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Travel plans called off, will attend office normally..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>
    </Modal>
  );
};
