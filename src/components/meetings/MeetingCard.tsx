import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeeting } from '../../context/MeetingContext';
import { WeeklyMeeting, MeetingAttendanceStatus } from '../../types/meeting';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { getTodayLocalDate, formatTime } from '../../utils/dateUtils';
import { Video, Clock, MapPin, CheckCircle, ChevronRight } from 'lucide-react';

interface MeetingCardProps {
  meeting: WeeklyMeeting;
  onViewRoster: (meeting: WeeklyMeeting) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onViewRoster }) => {
  const { currentUser, isAdmin } = useAuth();
  const { getEmployeeMeetingRecords, markMyAttendance } = useMeeting();

  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<MeetingAttendanceStatus>('PRESENT');

  if (!currentUser) return null;

  const today = getTodayLocalDate();
  const myRecords = getEmployeeMeetingRecords(currentUser.id);
  const currentRecord = myRecords.find(r => r.meetingId === meeting.id && r.meetingDate === today);

  const handleMark = (status: MeetingAttendanceStatus) => {
    setSelectedStatus(status);
    if (status === 'LATE' || status === 'EXCUSED_LEAVE') {
      setShowNotesInput(true);
    } else {
      markMyAttendance(meeting.id, currentUser, status);
    }
  };

  const handleConfirmWithNotes = () => {
    markMyAttendance(meeting.id, currentUser, selectedStatus, notes);
    setShowNotesInput(false);
    setNotes('');
  };

  const getStatusBadge = (status: MeetingAttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success" size="md" dot>Attended (Present)</Badge>;
      case 'LATE':
        return <Badge variant="warning" size="md" dot>Attended Late</Badge>;
      case 'EXCUSED_LEAVE':
        return <Badge variant="info" size="md" dot>Excused (On Leave)</Badge>;
      case 'ABSENT':
        return <Badge variant="danger" size="md" dot>Marked Absent</Badge>;
    }
  };

  return (
    <Card className="shadow-2xs hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600 transition-all duration-200 overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {meeting.title}
              </span>
              <Badge variant={meeting.isMandatory ? 'danger' : 'neutral'} size="sm">
                {meeting.isMandatory ? 'Mandatory Sync' : 'Optional'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {meeting.description}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 shrink-0 shadow-xs">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Schedule & Room info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{meeting.dayName}:</span>{' '}
            {meeting.startTime} – {meeting.endTime}
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{meeting.locationOrLink}</span>
          </div>
        </div>

        {/* Current user's attendance status row */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">My Sync Status:</span>
            {currentRecord ? (
              getStatusBadge(currentRecord.status)
            ) : (
              <Badge variant="warning" size="sm">
                Not Marked Yet Today
              </Badge>
            )}
          </div>

          {currentRecord?.joinedAt && (
            <span className="text-[11px] font-mono text-slate-500">
              Logged: {formatTime(currentRecord.joinedAt)}
            </span>
          )}
        </div>

        {/* Action Controls for Employee to Mark Meeting Attendance */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={currentRecord?.status === 'PRESENT' ? 'success' : 'outline'}
              size="sm"
              onClick={() => handleMark('PRESENT')}
              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              {currentRecord?.status === 'PRESENT' ? 'Present (Verified)' : 'Mark Present'}
            </Button>

            <Button
              variant={currentRecord?.status === 'LATE' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleMark('LATE')}
            >
              Mark Late
            </Button>

            <Button
              variant={currentRecord?.status === 'EXCUSED_LEAVE' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleMark('EXCUSED_LEAVE')}
            >
              Excuse (On Leave)
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewRoster(meeting)}
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            {isAdmin ? 'Manage Meeting Roster' : 'View Attendance Roster'}
          </Button>
        </div>

        {/* Notes input accordion when marking late or excuse */}
        {showNotesInput && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs animate-slide-down">
            <label className="font-semibold text-amber-900 dark:text-amber-200 block">
              Provide justification for marking {selectedStatus.replace('_', ' ')}:
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Approved medical leave / Onsite client call..."
              className="w-full p-2 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNotesInput(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmWithNotes}>
                Confirm Attendance
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
