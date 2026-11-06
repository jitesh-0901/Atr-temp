import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCorrection } from '../../context/CorrectionContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CorrectionField } from '../../types/correction';
import { FileEdit } from 'lucide-react';

interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillDate?: string;
}

export const CorrectionRequestModal: React.FC<CorrectionRequestModalProps> = ({
  isOpen,
  onClose,
  prefillDate = '',
}) => {
  const { currentUser } = useAuth();
  const { submitCorrectionRequest } = useCorrection();

  const [date, setDate] = useState<string>(prefillDate || '');
  const [field, setField] = useState<CorrectionField>('LAST_CHECK_OUT');
  const [firstInTime, setFirstInTime] = useState<string>('');
  const [lastOutTime, setLastOutTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (prefillDate) setDate(prefillDate);
  }, [prefillDate]);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Please select an attendance date.');
      return;
    }

    if (!reason.trim()) {
      setError('A detailed reason is mandatory for correction requests.');
      return;
    }

    const toIso = (timeStr: string) => (timeStr ? `${date}T${timeStr}:00Z` : null);

    const res = submitCorrectionRequest({
      employee: currentUser,
      attendanceDate: date,
      field,
      originalFirstCheckIn: null,
      originalLastCheckOut: null,
      requestedFirstCheckIn: toIso(firstInTime),
      requestedLastCheckOut: toIso(lastOutTime),
      reason,
    });

    if (!res.success) {
      setError(res.error || 'Failed to submit correction request.');
      return;
    }

    // Reset and close
    setReason('');
    setFirstInTime('');
    setLastOutTime('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Attendance Correction"
      description="Submit a correction for missed punches or timing adjustments"
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
            leftIcon={<FileEdit className="w-4 h-4" />}
          >
            Submit for Admin Review
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Attendance Date"
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <Select
          label="Adjustment Type / Target Field"
          value={field}
          onChange={e => setField(e.target.value as CorrectionField)}
          options={[
            { value: 'LAST_CHECK_OUT', label: 'Missing / Incorrect Last Check-Out' },
            { value: 'FIRST_CHECK_IN', label: 'Missing / Incorrect First Check-In' },
            { value: 'BOTH', label: 'Both Check-In & Check-Out Times' },
            { value: 'MISSING_DAY', label: 'Entire Unrecorded Day' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Correct First In (HH:MM)"
            type="time"
            value={firstInTime}
            onChange={e => setFirstInTime(e.target.value)}
          />

          <Input
            label="Correct Last Out (HH:MM)"
            type="time"
            value={lastOutTime}
            onChange={e => setLastOutTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Explanation / Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Card reader hardware malfunction at Gate 2, biometric team noted manual entry..."
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
