import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCorrection } from '../../context/CorrectionContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AttendanceCorrectionRequest } from '../../types/correction';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Check, XCircle } from 'lucide-react';

interface AdminCorrectionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AttendanceCorrectionRequest | null;
}

export const AdminCorrectionReviewModal: React.FC<AdminCorrectionReviewModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { currentUser } = useAuth();
  const { approveCorrectionRequest, rejectCorrectionRequest } = useCorrection();
  const [remark, setRemark] = useState('');

  if (!request || !currentUser) return null;

  const handleApprove = () => {
    approveCorrectionRequest(request.id, currentUser, remark);
    setRemark('');
    onClose();
  };

  const handleReject = () => {
    rejectCorrectionRequest(request.id, currentUser, remark);
    setRemark('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Correction Request"
      description={`Submitted by ${request.employeeName} for date ${formatDate(request.attendanceDate)}`}
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
              Reject Correction
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleApprove}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Approve & Recalculate
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Comparison card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center text-slate-500 font-medium">
            <span>Target Correction Field:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 uppercase">
              {request.field.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Original Punches
              </span>
              <p className="mt-1 font-mono font-medium text-slate-700 dark:text-slate-300">
                In: {formatTime(request.originalFirstCheckIn)}
              </p>
              <p className="font-mono font-medium text-slate-700 dark:text-slate-300">
                Out: {formatTime(request.originalLastCheckOut)}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                Requested Values
              </span>
              <p className="mt-1 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                In: {formatTime(request.requestedFirstCheckIn)}
              </p>
              <p className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                Out: {formatTime(request.requestedLastCheckOut)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Employee Justification
          </label>
          <p className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            "{request.reason}"
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Admin Review Remark
          </label>
          <textarea
            rows={2}
            value={remark}
            onChange={e => setRemark(e.target.value)}
            placeholder="e.g. Cross-referenced with facility gate access log. Approved..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>
    </Modal>
  );
};
