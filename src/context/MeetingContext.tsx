import React, { createContext, useContext, useState } from 'react';
import {
  WeeklyMeeting,
  MeetingAttendanceRecord,
  MeetingAttendanceStatus,
} from '../types/meeting';
import { initialWeeklyMeetings, initialMeetingAttendance } from '../mock/mockMeetings';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { User } from '../types/auth';
import { getTodayLocalDate } from '../utils/dateUtils';
import { useCorrection } from './CorrectionContext';
import { useNotification } from './NotificationContext';

interface MeetingContextType {
  meetings: WeeklyMeeting[];
  attendanceRecords: MeetingAttendanceRecord[];
  getEmployeeMeetingRecords: (employeeId: string) => MeetingAttendanceRecord[];
  getMeetingRecordsForDate: (meetingId: string, date: string) => MeetingAttendanceRecord[];
  markMyAttendance: (
    meetingId: string,
    employee: User,
    status: MeetingAttendanceStatus,
    notes?: string
  ) => { success: boolean; error?: string };
  adminUpdateAttendance: (
    recordId: string,
    status: MeetingAttendanceStatus,
    notes: string,
    adminUser: User
  ) => void;
  scheduleMeeting: (
    data: Omit<WeeklyMeeting, 'id' | 'isActive'>,
    adminUser: User
  ) => { success: boolean; error?: string };
  toggleMeetingActive: (id: string, adminUser: User) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<WeeklyMeeting[]>(() => {
    return loadFromStorage<WeeklyMeeting[]>('weekly_meetings', initialWeeklyMeetings);
  });

  const [attendanceRecords, setAttendanceRecords] = useState<MeetingAttendanceRecord[]>(() => {
    return loadFromStorage<MeetingAttendanceRecord[]>('meeting_attendance', initialMeetingAttendance);
  });

  const { addAuditLog } = useCorrection();
  const { sendEmailNotification } = useNotification();

  const getEmployeeMeetingRecords = (employeeId: string): MeetingAttendanceRecord[] => {
    return attendanceRecords
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
  };

  const getMeetingRecordsForDate = (meetingId: string, date: string): MeetingAttendanceRecord[] => {
    return attendanceRecords.filter(r => r.meetingId === meetingId && r.meetingDate === date);
  };

  const markMyAttendance = (
    meetingId: string,
    employee: User,
    status: MeetingAttendanceStatus,
    notes?: string
  ): { success: boolean; error?: string } => {
    const today = getTodayLocalDate();
    const meeting = meetings.find(m => m.id === meetingId);

    if (!meeting) {
      return { success: false, error: 'Meeting not found.' };
    }

    const existingIndex = attendanceRecords.findIndex(
      r => r.meetingId === meetingId && r.employeeId === employee.id && r.meetingDate === today
    );

    const newRecord: MeetingAttendanceRecord = {
      id: existingIndex >= 0 ? attendanceRecords[existingIndex].id : `mrec_${Date.now()}`,
      meetingId,
      meetingTitle: meeting.title,
      meetingDate: today,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeDepartment: employee.department,
      status,
      joinedAt: new Date().toISOString(),
      notes: notes || undefined,
      markedBy: 'EMPLOYEE',
    };

    setAttendanceRecords(prev => {
      let updated: MeetingAttendanceRecord[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = newRecord;
      } else {
        updated = [newRecord, ...prev];
      }
      saveToStorage('meeting_attendance', updated);
      return updated;
    });

    return { success: true };
  };

  const adminUpdateAttendance = (
    recordId: string,
    status: MeetingAttendanceStatus,
    notes: string,
    adminUser: User
  ) => {
    let affected: MeetingAttendanceRecord | undefined;

    setAttendanceRecords(prev => {
      const updated = prev.map(r => {
        if (r.id === recordId) {
          affected = { ...r, status, notes: notes || r.notes, markedBy: 'ADMIN' as const };
          return affected;
        }
        return r;
      });
      saveToStorage('meeting_attendance', updated);
      return updated;
    });

    if (affected) {
      addAuditLog({
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: 'DIRECT_EDIT',
        objectType: 'ATTENDANCE',
        objectId: recordId,
        affectedEmployeeId: (affected as MeetingAttendanceRecord).employeeId,
        affectedEmployeeName: (affected as MeetingAttendanceRecord).employeeName,
        reason: `Admin updated meeting attendance for ${(affected as MeetingAttendanceRecord).meetingTitle} to ${status}. Note: ${notes}`,
      });
    }
  };

  const scheduleMeeting = (
    data: Omit<WeeklyMeeting, 'id' | 'isActive'>,
    adminUser: User
  ): { success: boolean; error?: string } => {
    const newMeeting: WeeklyMeeting = {
      id: `meet_${Date.now()}`,
      ...data,
      isActive: true,
    };

    setMeetings(prev => {
      const updated = [...prev, newMeeting];
      saveToStorage('weekly_meetings', updated);
      return updated;
    });

    addAuditLog({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: 'SETTINGS_UPDATED',
      objectType: 'SETTINGS',
      objectId: newMeeting.id,
      reason: `Admin scheduled new recurring weekly sync: ${newMeeting.title} on ${newMeeting.dayName}`,
    });

    // Notify all staff
    sendEmailNotification({
      eventType: 'ACCOUNT_CREATED',
      recipientEmail: 'team@genkit.io',
      recipientName: 'All Team Members',
      subject: `[ATR Sync] New Recurring Weekly Meeting: ${newMeeting.title}`,
      bodyText: `Hello Team,\n\nA new weekly recurring meeting has been scheduled by ${adminUser.name}.\n\nMeeting: ${newMeeting.title}\nSchedule: Every ${newMeeting.dayName} from ${newMeeting.startTime} to ${newMeeting.endTime}\nLocation / Join Link: ${newMeeting.locationOrLink}\nMandatory: ${newMeeting.isMandatory ? 'Yes' : 'Optional'}\n\nPlease mark your attendance weekly on the ATR portal.`,
    });

    return { success: true };
  };

  const toggleMeetingActive = (id: string, adminUser: User) => {
    setMeetings(prev => {
      const updated = prev.map(m => (m.id === id ? { ...m, isActive: !m.isActive } : m));
      saveToStorage('weekly_meetings', updated);
      return updated;
    });

    addAuditLog({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: 'SETTINGS_UPDATED',
      objectType: 'SETTINGS',
      objectId: id,
      reason: 'Admin toggled recurring meeting active state',
    });
  };

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        attendanceRecords,
        getEmployeeMeetingRecords,
        getMeetingRecordsForDate,
        markMyAttendance,
        adminUpdateAttendance,
        scheduleMeeting,
        toggleMeetingActive,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error('useMeeting must be used within MeetingProvider');
  return context;
};
