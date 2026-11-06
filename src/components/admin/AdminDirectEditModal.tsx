import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useCorrection } from '../../context/CorrectionContext';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { AttendanceDaySummary, AttendanceDayStatus } from '../../types/attendance';
import { formatDate } from '../../utils/dateUtils';
import { ShieldAlert } from 'lucide-react';

interface AdminDirectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AttendanceDaySummary | null;
}

export const AdminDirectEditModal: React.FC<AdminDirectEditModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const { currentUser } = useAuth();
  const { adminDirectEdit } = useAttendance();
  const { addAuditLog } = useCorrection();
  const { sendEmailNotification } = useNotification();

  const [firstCheckInTime, setFirstCheckInTime] = useState<string>('');
  const [lastCheckOutTime, setLastCheckOutTime] = useState<string>('');
  const [status, setStatus] = useState<AttendanceDayStatus>('PRESENT');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form when summary changes
  React.useEffect(() => {
    if (summary) {
      const getHhMm = (iso: string | null) => {
        if (!iso) return '';
        try {
          const d = new Date(iso);
          return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch {
          return '';
        }
      };
      setFirstCheckInTime(getHhMm(summary.firstCheckIn));
      setLastCheckOutTime(getHhMm(summary.lastCheckOut));
      setStatus(summary.status);
      setReason('');
      setError(null);
    }
  }, [summary]);

  if (!summary || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A mandatory reason is required for direct Admin attendance edits.');
      return;
    }

    const dateStr = summary.localDate;
    const makeIso = (hhmm: string) => {
      if (!hhmm) return null;
      return `${dateStr}T${hhmm}:00Z`;
    };

    const newFirstIn = firstCheckInTime ? makeIso(firstCheckInTime) : summary.firstCheckIn;
    const newLastOut = lastCheckOutTime ? makeIso(lastCheckOutTime) : summary.lastCheckOut;

    const res = adminDirectEdit(
      summary.id,
      {
        firstCheckIn: newFirstIn,
        lastCheckOut: newLastOut,
        status,
      },
      reason,
      currentUser
    );

    if (!res.success) {
      setError(res.error || 'Failed to update attendance.');
      return;
    }

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'ADMIN',
      action: 'DIRECT_EDIT',
      objectType: 'ATTENDANCE',
      objectId: summary.id,
      affectedEmployeeId: summary.employeeId,
      affectedEmployeeName: summary.employeeName,
      beforeValue: `First: ${summary.firstCheckIn || 'None'}, Last: ${summary.lastCheckOut || 'None'}, Status: ${summary.status}`,
      afterValue: `First: ${newFirstIn || 'None'}, Last: ${newLastOut || 'None'}, Status: ${status}`,
      reason: reason.trim(),
    });

    sendEmailNotification({
      eventType: 'ADMIN_DIRECT_EDIT',
      recipientEmail: `${(summary.employeeName || 'employee').toLowerCase().replace(/\s+/g, '.')}@genkit.io`,
      recipientName: summary.employeeName || 'Employee',
      subject: `[ATR Audit] Attendance Record Directly Edited for ${formatDate(summary.localDate)}`,
      bodyText: `Hello ${summary.employeeName},\n\nAn administrator (${currentUser.name}) has directly updated your attendance record for ${formatDate(summary.localDate)}.\n\nNew Values: First Check-In: ${firstCheckInTime || 'None'}, Last Check-Out: ${lastCheckOutTime || 'None'}, Status: ${status}.\nMandatory Reason Provided: "${reason.trim()}"\n\nThis administrative action has been permanently logged in the ATR audit trail.`,
      relatedObjectType: 'ATTENDANCE',
      relatedObjectId: summary.id,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Direct Attendance Edit"
      description={`Editing attendance record for ${summary.employeeName} on ${formatDate(summary.localDate)}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSubmit}
            leftIcon={<ShieldAlert className="w-4 h-4" />}
          >
            Apply Audited Edit
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-semibold">Audited Administrative Action</p>
            <p className="text-[11px] mt-0.5">
              Per ATR MVP F11: Direct edits bypass normal employee request workflows.
              Actor, timestamp, and reason will be immutably recorded in the Audit Log and an email alert will be dispatched to the employee.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Check-In (HH:MM)"
            type="time"
            value={firstCheckInTime}
            onChange={e => setFirstCheckInTime(e.target.value)}
          />

          <Input
            label="Last Check-Out (HH:MM)"
            type="time"
            value={lastCheckOutTime}
            onChange={e => setLastCheckOutTime(e.target.value)}
          />
        </div>

        <Select
          label="Attendance Day Status"
          value={status}
          onChange={e => setStatus(e.target.value as AttendanceDayStatus)}
          options={[
            { value: 'PRESENT', label: 'Present' },
            { value: 'ABSENT', label: 'Absent' },
            { value: 'ON_LEAVE', label: 'On Leave' },
            { value: 'HOLIDAY', label: 'Holiday' },
            { value: 'WEEKEND', label: 'Weekend' },
          ]}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mandatory Justification / Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Employee attended emergency client dispatch at secondary datacenter without biometric terminal..."
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
