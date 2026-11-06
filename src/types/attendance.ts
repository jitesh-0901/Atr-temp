export type AttendanceEventType = 'CHECK_IN' | 'CHECK_OUT';

export interface AttendanceEvent {
  id: string;
  employeeId: string;
  eventType: AttendanceEventType;
  timestamp: string; // ISO string
  localDate: string; // YYYY-MM-DD
  source: 'WEB' | 'ADMIN_EDIT' | 'CORRECTION_APPROVED';
}

export type AttendanceDayStatus = 
  | 'PRESENT' 
  | 'ABSENT' 
  | 'ON_LEAVE' 
  | 'HOLIDAY' 
  | 'WEEKEND';

export interface AttendanceDaySummary {
  id: string;
  employeeId: string;
  employeeName?: string;
  localDate: string; // YYYY-MM-DD
  firstCheckIn: string | null; // ISO string or null
  lastCheckOut: string | null; // ISO string or null
  totalWorkedSeconds: number;
  status: AttendanceDayStatus;
  events: AttendanceEvent[];
  hasCorrection?: boolean;
  correctionRemark?: string;
  adminRemark?: string;
}

export interface TodayAttendanceState {
  isActiveSession: boolean;
  activeCheckInTime: string | null; // ISO string
  todaySummary: AttendanceDaySummary | null;
  events: AttendanceEvent[];
}
