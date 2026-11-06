import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useLeave } from '../../context/LeaveContext';
import { useCorrection } from '../../context/CorrectionContext';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AttendanceRateChart } from '../dashboard/AttendanceRateChart';
import { RecentActivityFeed } from '../dashboard/RecentActivityFeed';
import { LeaveDecisionModal } from '../leave/LeaveDecisionModal';
import { AdminCorrectionReviewModal } from './AdminCorrectionReviewModal';
import { LeaveRequest } from '../../types/leave';
import { AttendanceCorrectionRequest } from '../../types/correction';
import { getTodayLocalDate, formatDate } from '../../utils/dateUtils';
import {
  Users,
  CheckCircle2,
  CalendarDays,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { users } = useAuth();
  const { summaries } = useAttendance();
  const { leaveRequests } = useLeave();
  const { corrections, auditLogs } = useCorrection();

  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [selectedCorrection, setSelectedCorrection] = useState<AttendanceCorrectionRequest | null>(
    null
  );

  const today = getTodayLocalDate();
  const activeEmployees = users.filter(u => u.isActive);

  // Today's attendance aggregates
  const todaySummaries = summaries.filter(s => s.localDate === today);
  const presentCount = todaySummaries.filter(s => s.status === 'PRESENT').length;
  const absentCount = todaySummaries.filter(s => s.status === 'ABSENT').length;
  const onLeaveCount = todaySummaries.filter(s => s.status === 'ON_LEAVE').length;

  // Pending approval queues
  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING');
  const pendingCorrections = corrections.filter(c => c.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Top Aggregates Grid (Per F07 spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Employees"
          value={activeEmployees.length}
          subtitle="Provisioned active accounts"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-brand-50 dark:bg-brand-950/40"
          iconColor="text-brand-600 dark:text-brand-400"
          onClick={() => navigate('/employees')}
        />

        <StatCard
          title="Today Present"
          value={presentCount}
          subtitle={`Out of ${activeEmployees.length} staff today`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => navigate('/attendance-logs')}
        />

        <StatCard
          title="Pending Leave Applications"
          value={pendingLeaves.length}
          subtitle="Awaiting administrative review"
          icon={<CalendarDays className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-600 dark:text-amber-400"
          onClick={() => navigate('/leave')}
        />

        <StatCard
          title="Pending Corrections"
          value={pendingCorrections.length}
          subtitle="Punch adjustments awaiting audit"
          icon={<FileCheck2 className="w-5 h-5" />}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600 dark:text-purple-400"
          onClick={() => navigate('/corrections')}
        />
      </div>

      {/* Attendance Distribution Visual */}
      <AttendanceRateChart
        presentCount={presentCount}
        absentCount={absentCount}
        onLeaveCount={onLeaveCount}
        totalActive={activeEmployees.length}
      />

      {/* Approval Queues: Pending Leaves & Corrections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leaves Queue */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Leave Approvals Queue ({pendingLeaves.length})
              </span>
              <button
                onClick={() => navigate('/leave')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                All Requests <ArrowRight className="w-3 h-3" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No leave requests pending administrative review.
              </div>
            ) : (
              pendingLeaves.map(l => (
                <div
                  key={l.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {l.employeeName}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {l.leaveType}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatDate(l.startDate)} to {formatDate(l.endDate)} ({l.daysCount}d)
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic truncate max-w-xs mt-0.5">
                      "{l.reason}"
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedLeave(l)}
                  >
                    Review
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Corrections Queue */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Correction Requests Queue ({pendingCorrections.length})
              </span>
              <button
                onClick={() => navigate('/corrections')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                All Corrections <ArrowRight className="w-3 h-3" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingCorrections.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No attendance corrections pending review.
              </div>
            ) : (
              pendingCorrections.map(c => (
                <div
                  key={c.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {c.employeeName}
                      </span>
                      <Badge variant="warning" size="sm">
                        {c.field.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Target: {formatDate(c.attendanceDate)}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic truncate max-w-xs mt-0.5">
                      "{c.reason}"
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedCorrection(c)}
                  >
                    Inspect
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Trail Stream */}
      <RecentActivityFeed
        logs={auditLogs}
        onViewAll={() => navigate('/corrections')}
      />

      {/* Review Modals */}
      <LeaveDecisionModal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        request={selectedLeave}
      />
      <AdminCorrectionReviewModal
        isOpen={!!selectedCorrection}
        onClose={() => setSelectedCorrection(null)}
        request={selectedCorrection}
      />
    </div>
  );
};
