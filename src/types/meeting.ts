export interface WeeklyMeeting {
  id: string;
  title: string;
  description: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ... 5 = Friday
  dayName: string; // "Monday", "Wednesday", etc.
  startTime: string; // "10:00 AM"
  endTime: string; // "11:00 AM"
  locationOrLink: string; // "Google Meet: meet.genkit.io/all-hands" or "Conference Room Alpha"
  isMandatory: boolean;
  departmentScope: string; // "All Organization" or "Software Engineering"
  isActive: boolean;
}

export type MeetingAttendanceStatus = 'PRESENT' | 'LATE' | 'EXCUSED_LEAVE' | 'ABSENT';

export interface MeetingAttendanceRecord {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  employeeDepartment?: string;
  status: MeetingAttendanceStatus;
  joinedAt?: string; // ISO string
  notes?: string;
  markedBy: 'EMPLOYEE' | 'ADMIN' | 'SYSTEM';
}
