import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCorrection } from '../context/CorrectionContext';
import { CorrectionHistoryTable } from '../components/corrections/CorrectionHistoryTable';
import { CorrectionRequestModal } from '../components/corrections/CorrectionRequestModal';
import { AdminCorrectionReviewModal, AuditLogTable } from '../components/admin';
import { Button } from '../components/common/Button';
import { AttendanceCorrectionRequest } from '../types/correction';
import { FileEdit, Shield, Clock } from 'lucide-react';

export const CorrectionsPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { corrections, auditLogs, getEmployeeCorrections } = useCorrection();

  const [activeTab, setActiveTab] = useState<'requests' | 'audit'>('requests');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<AttendanceCorrectionRequest | null>(null);

  if (!currentUser) return null;

  const baseCorrections = isAdmin ? corrections : getEmployeeCorrections(currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {isAdmin
              ? 'Attendance Corrections & System Audit Ledger'
              : 'My Attendance Correction Requests'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdmin
              ? 'Review employee punch adjustments and inspect immutable administrative audit history.'
              : 'Submit corrections for missed check-ins, early exits, or clock-in discrepancies.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsRequestModalOpen(true)}
          leftIcon={<FileEdit className="w-4 h-4" />}
        >
          Request Correction
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          Correction Requests ({baseCorrections.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          Audit Trail Log ({auditLogs.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' ? (
        <CorrectionHistoryTable
          requests={baseCorrections}
          onReview={isAdmin ? req => setReviewRequest(req) : undefined}
        />
      ) : (
        <AuditLogTable logs={auditLogs} />
      )}

      {/* Modals */}
      <CorrectionRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      <AdminCorrectionReviewModal
        isOpen={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
        request={reviewRequest}
      />
    </div>
  );
};
