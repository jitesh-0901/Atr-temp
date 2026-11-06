import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeeting } from '../context/MeetingContext';
import { MeetingCard } from '../components/meetings/MeetingCard';
import { ScheduleMeetingModal, MeetingRosterTable } from '../components/admin';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { WeeklyMeeting } from '../types/meeting';
import { getTodayLocalDate } from '../utils/dateUtils';
import { Video, Users, CheckCircle2, CalendarPlus, Sparkles } from 'lucide-react';

export const MeetingsPage: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const { meetings, getEmployeeMeetingRecords } = useMeeting();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedRosterMeeting, setSelectedRosterMeeting] = useState<WeeklyMeeting | null>(null);

  if (!currentUser) return null;

  const today = getTodayLocalDate();
  const myRecords = getEmployeeMeetingRecords(currentUser.id);

  // Compute metrics
  const totalMeetings = meetings.filter(m => m.isActive).length;
  const attendedCount = myRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const syncRate = myRecords.length > 0 ? Math.round((attendedCount / myRecords.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Weekly Team Meetings & Standup Attendance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdmin
              ? 'Schedule recurring organization syncs, monitor team attendance, and manage attendance rosters.'
              : 'Track upcoming weekly team meetings, check-in to verify attendance, or request leave excuses.'}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsScheduleOpen(true)}
            leftIcon={<CalendarPlus className="w-4 h-4" />}
          >
            + Schedule Weekly Meeting
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Weekly Syncs"
          value={totalMeetings}
          subtitle="Recurring weekly team meetings"
          icon={<Video className="w-5 h-5" />}
          iconBgColor="bg-brand-50 dark:bg-brand-950/40"
          iconColor="text-brand-600 dark:text-brand-400"
        />

        <StatCard
          title="My Meeting Sync Rate"
          value={`${syncRate}%`}
          subtitle="Punctuality & presence score"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Syncs Attended"
          value={attendedCount}
          subtitle={`Out of ${myRecords.length} meeting sessions`}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Main View: Either Meeting Cards or Specific Roster Table */}
      {selectedRosterMeeting ? (
        <MeetingRosterTable
          meeting={selectedRosterMeeting}
          date={today}
          onBack={() => setSelectedRosterMeeting(null)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Weekly Recurring Meetings Schedule ({meetings.length})
            </h4>
            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Check-in opens on meeting day
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map(m => (
              <MeetingCard
                key={m.id}
                meeting={m}
                onViewRoster={meeting => setSelectedRosterMeeting(meeting)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Schedule Modal for Admin */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />
    </div>
  );
};
