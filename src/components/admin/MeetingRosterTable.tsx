import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeeting } from '../../context/MeetingContext';
import { WeeklyMeeting, MeetingAttendanceStatus } from '../../types/meeting';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';
import { formatTime, formatDate } from '../../utils/dateUtils';

interface MeetingRosterTableProps {
  meeting: WeeklyMeeting;
  date: string;
  onBack: () => void;
}

export const MeetingRosterTable: React.FC<MeetingRosterTableProps> = ({
  meeting,
  date,
  onBack,
}) => {
  const { users, isAdmin, currentUser } = useAuth();
  const { attendanceRecords, adminUpdateAttendance } = useMeeting();

  const [editingRecord, setEditingRecord] = useState<{
    id: string;
    employeeName: string;
    currentStatus: MeetingAttendanceStatus;
    notes: string;
  } | null>(null);

  const [newStatus, setNewStatus] = useState<MeetingAttendanceStatus>('PRESENT');
  const [adminNotes, setAdminNotes] = useState('');

  // Get records for this meeting and date
  const records = attendanceRecords.filter(
    r => r.meetingId === meeting.id && r.meetingDate === date
  );

  // Map over active users
  const activeEmployees = users.filter(u => u.isActive);

  const rosterList = activeEmployees.map(emp => {
    const record = records.find(r => r.employeeId === emp.id);
    return {
      employee: emp,
      record: record || null,
    };
  });

  const handleOpenEdit = (empName: string, recId: string, status: MeetingAttendanceStatus, existingNotes: string) => {
    setEditingRecord({
      id: recId,
      employeeName: empName,
      currentStatus: status,
      notes: existingNotes,
    });
    setNewStatus(status);
    setAdminNotes(existingNotes || '');
  };

  const handleSaveAdminUpdate = () => {
    if (!editingRecord || !currentUser) return;
    adminUpdateAttendance(editingRecord.id, newStatus, adminNotes, currentUser);
    setEditingRecord(null);
  };

  const getStatusBadge = (status: MeetingAttendanceStatus | 'NOT_MARKED') => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success" size="sm" dot>Present</Badge>;
      case 'LATE':
        return <Badge variant="warning" size="sm" dot>Late</Badge>;
      case 'EXCUSED_LEAVE':
        return <Badge variant="info" size="sm" dot>Excused (On Leave)</Badge>;
      case 'ABSENT':
        return <Badge variant="danger" size="sm" dot>Absent</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Pending Punch</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 mb-1"
          >
            &larr; Back to Meetings Overview
          </button>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Attendance Roster: {meeting.title}
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Session Date: {formatDate(date)} • {meeting.startTime} – {meeting.endTime}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={meeting.isMandatory ? 'danger' : 'neutral'} size="md">
            {meeting.isMandatory ? 'Mandatory Roster' : 'Optional Sync'}
          </Badge>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/90 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Meeting Status</th>
                <th className="py-3 px-4">Joined Timestamp</th>
                <th className="py-3 px-4">Attendance Notes / Excuse</th>
                {isAdmin && <th className="py-3 px-4 text-right">Admin Override</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {rosterList.map(({ employee, record }) => {
                const status = record ? record.status : 'NOT_MARKED';
                return (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {employee.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </div>
                        <div>
                          <span>{employee.name}</span>
                          <span className="block text-[10px] font-mono text-slate-400">
                            {employee.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {employee.department}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(status)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                      {record?.joinedAt ? formatTime(record.joinedAt) : '—'}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400 italic">
                      {record?.notes || '—'}
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {record ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenEdit(
                                employee.name,
                                record.id,
                                record.status,
                                record.notes || ''
                              )
                            }
                          >
                            Adjust Status
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unmarked</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Adjust Modal */}
      {editingRecord && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          title="Admin Meeting Attendance Override"
          description={`Manually adjusting attendance for ${editingRecord.employeeName}`}
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAdminUpdate}>
                Save Adjustment
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <Select
              label="Attendance Status"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as MeetingAttendanceStatus)}
              options={[
                { value: 'PRESENT', label: 'Present' },
                { value: 'LATE', label: 'Late' },
                { value: 'EXCUSED_LEAVE', label: 'Excused (On Leave)' },
                { value: 'ABSENT', label: 'Absent' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Reason / Justification
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Reason for manual adjustment..."
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
