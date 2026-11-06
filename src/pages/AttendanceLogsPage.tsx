import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceFilterBar } from '../components/attendance/AttendanceFilterBar';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import { AdminDirectEditModal } from '../components/admin';
import { CorrectionRequestModal } from '../components/corrections/CorrectionRequestModal';
import { AttendanceDaySummary } from '../types/attendance';

export const AttendanceLogsPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { summaries, getEmployeeSummaries } = useAttendance();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [directEditSummary, setDirectEditSummary] = useState<AttendanceDaySummary | null>(null);
  const [correctionPrefillDate, setCorrectionPrefillDate] = useState<string | null>(null);

  if (!currentUser) return null;

  // Base list depending on role (F05: Employees see their own logs; Admin sees all)
  const baseSummaries = isAdmin ? summaries : getEmployeeSummaries(currentUser.id);

  // Apply filters
  const filteredSummaries = baseSummaries.filter(s => {
    // Employee filter (Admin only)
    if (isAdmin && selectedEmployeeId !== 'ALL' && s.employeeId !== selectedEmployeeId) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && s.status !== selectedStatus) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.employeeName && s.employeeName.toLowerCase().includes(q);
      const matchDate = s.localDate.includes(q);
      const matchRemark =
        (s.adminRemark && s.adminRemark.toLowerCase().includes(q)) ||
        (s.correctionRemark && s.correctionRemark.toLowerCase().includes(q));
      if (!matchName && !matchDate && !matchRemark) return false;
    }

    // Date range
    if (startDate && s.localDate < startDate) return false;
    if (endDate && s.localDate > endDate) return false;

    return true;
  });

  const handleResetFilters = () => {
    setSelectedEmployeeId('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          {isAdmin ? 'Organisation Attendance History' : 'My Attendance Logs & History'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {isAdmin
            ? 'Complete audited attendance ledger across all employees with direct administrative override capabilities.'
            : 'Personal attendance records, daily first/last punches, and calculated worked duration.'}
        </p>
      </div>

      {/* Filter Bar */}
      <AttendanceFilterBar
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployeeId={setSelectedEmployeeId}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onResetFilters={handleResetFilters}
      />

      {/* Table */}
      <AttendanceTable
        summaries={filteredSummaries}
        onDirectEdit={isAdmin ? s => setDirectEditSummary(s) : undefined}
        onRequestCorrection={!isAdmin ? s => setCorrectionPrefillDate(s.localDate) : undefined}
      />

      {/* Admin Direct Edit Modal (F11) */}
      <AdminDirectEditModal
        isOpen={!!directEditSummary}
        onClose={() => setDirectEditSummary(null)}
        summary={directEditSummary}
      />

      {/* Employee Correction Modal */}
      <CorrectionRequestModal
        isOpen={!!correctionPrefillDate}
        onClose={() => setCorrectionPrefillDate(null)}
        prefillDate={correctionPrefillDate || ''}
      />
    </div>
  );
};
