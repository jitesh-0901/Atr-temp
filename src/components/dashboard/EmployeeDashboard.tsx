import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useLeave } from '../../context/LeaveContext';
import { useSettings } from '../../context/SettingsContext';
import { CheckInOutCard } from '../attendance/CheckInOutCard';
import { PunchHistoryTimeline } from '../attendance/PunchHistoryTimeline';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { LeaveBalanceCards } from '../leave/LeaveBalanceCards';
import { LeaveRequestModal } from '../leave/LeaveRequestModal';
import { CorrectionRequestModal } from '../corrections/CorrectionRequestModal';
import { formatDuration, formatDate } from '../../utils/dateUtils';
import { getLeaveStatusBadge, getLeaveTypeLabel } from '../../utils/formatters';
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Sparkles,
  ArrowRight,
  FileEdit,
  Calendar,
} from 'lucide-react';
import { Button } from '../common/Button';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getEmployeeSummaries, getTodayState } = useAttendance();
  const { getEmployeeLeaves, getLeaveBalance } = useLeave();
  const { holidays } = useSettings();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  if (!currentUser) return null;

  const todayState = getTodayState(currentUser.id);
  const mySummaries = getEmployeeSummaries(currentUser.id);
  const myLeaves = getEmployeeLeaves(currentUser.id);
  const leaveBalance = getLeaveBalance(currentUser.id);

  // Derive monthly metrics from real records (F07 spec)
  const presentDays = mySummaries.filter(s => s.status === 'PRESENT').length;
  const absentDays = mySummaries.filter(s => s.status === 'ABSENT').length;
  const totalWorkedSecs = mySummaries.reduce((sum, s) => sum + s.totalWorkedSeconds, 0);
  const avgSecsPerDay = presentDays > 0 ? Math.floor(totalWorkedSecs / presentDays) : 0;

  const upcomingHolidays = holidays.filter(h => h.isActive).slice(0, 3);
  const recentLeaves = myLeaves.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Punch & Active State Card */}
      <CheckInOutCard />

      {/* Monthly Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Days Present"
          value={presentDays}
          subtitle="Recorded attendance this cycle"
          icon={<CalendarCheck className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => navigate('/attendance-logs')}
        />

        <StatCard
          title="Total Worked Time"
          value={formatDuration(totalWorkedSecs)}
          subtitle="Accumulated paired intervals"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-brand-50 dark:bg-brand-950/40"
          iconColor="text-brand-600 dark:text-brand-400"
          onClick={() => navigate('/attendance')}
        />

        <StatCard
          title="Avg Daily Working Hours"
          value={formatDuration(avgSecsPerDay)}
          subtitle="Across active work days"
          icon={<Sparkles className="w-5 h-5" />}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          title="Absences Marked"
          value={absentDays}
          subtitle="Unresolved missed days"
          icon={<CalendarDays className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/40"
          iconColor="text-rose-600 dark:text-rose-400"
          onClick={() => navigate('/attendance-logs')}
        />
      </div>

      {/* Leave Balances Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available Leave Quota
          </h4>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsLeaveModalOpen(true)}
            leftIcon={<CalendarDays className="w-3.5 h-3.5" />}
          >
            Apply Leave
          </Button>
        </div>
        <LeaveBalanceCards balance={leaveBalance} />
      </div>

      {/* Two-column layout for Today's Punches & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Punches */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Today's Punch Events & Session Intervals
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCorrectionModalOpen(true)}
                  leftIcon={<FileEdit className="w-3.5 h-3.5" />}
                >
                  Request Correction
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PunchHistoryTimeline events={todayState.events} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Upcoming Holidays & Recent Leaves */}
        <div className="space-y-6">
          {/* Upcoming Holidays */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Upcoming Holidays
                </span>
                <button
                  onClick={() => navigate('/holidays')}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingHolidays.map(h => (
                <div key={h.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {h.name}
                    </span>
                    <span className="font-mono text-brand-600 dark:text-brand-400 text-[11px]">
                      {formatDate(h.date)}
                    </span>
                  </div>
                  {h.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {h.description}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Leave Status */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  My Recent Leave Requests
                </span>
                <button
                  onClick={() => navigate('/leave')}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  History <ArrowRight className="w-3 h-3" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No leave applications submitted.</p>
              ) : (
                recentLeaves.map(l => {
                  const badge = getLeaveStatusBadge(l.status);
                  return (
                    <div key={l.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {getLeaveTypeLabel(l.leaveType)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {formatDate(l.startDate)} • {l.daysCount}d
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
      <CorrectionRequestModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
      />
    </div>
  );
};
