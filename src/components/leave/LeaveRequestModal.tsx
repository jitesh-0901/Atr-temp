import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { LeaveType } from '../../types/leave';
import { CalendarPlus } from 'lucide-react';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { submitLeaveRequest } = useLeave();

  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = submitLeaveRequest({
      employee: currentUser,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    if (!res.success) {
      setError(res.error || 'Failed to submit leave request.');
      return;
    }

    // Reset and close
    setStartDate('');
    setEndDate('');
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      description="Submit a formal leave application for administrative approval"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            leftIcon={<CalendarPlus className="w-4 h-4" />}
          >
            Submit Leave Application
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Select
          label="Leave Type / Category"
          value={leaveType}
          onChange={e => setLeaveType(e.target.value as LeaveType)}
          options={[
            { value: 'CASUAL', label: 'Casual Leave (CL)' },
            { value: 'SICK', label: 'Sick / Medical Leave (SL)' },
            { value: 'ANNUAL', label: 'Annual / Privilege Leave (PL)' },
            { value: 'UNPAID', label: 'Leave Without Pay (LWP)' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            required
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Reason for Leave <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Please detail reason for absence and any emergency contact info..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
        )}
      </form>
    </Modal>
  );
};
