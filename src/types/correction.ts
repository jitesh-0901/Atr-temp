export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CorrectionField = 'FIRST_CHECK_IN' | 'LAST_CHECK_OUT' | 'BOTH' | 'MISSING_DAY';

export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string; // YYYY-MM-DD
  field: CorrectionField;
  originalFirstCheckIn: string | null;
  originalLastCheckOut: string | null;
  requestedFirstCheckIn: string | null;
  requestedLastCheckOut: string | null;
  reason: string;
  status: CorrectionStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewRemark?: string;
  submittedAt: string;
}

export type AuditActionType =
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'DIRECT_EDIT'
  | 'CORRECTION_REQUESTED'
  | 'CORRECTION_APPROVED'
  | 'CORRECTION_REJECTED'
  | 'LEAVE_REQUESTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_CANCELLED'
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_DEACTIVATED'
  | 'HOLIDAY_CREATED'
  | 'HOLIDAY_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'AUTO_ABSENT_EXECUTED';

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: 'ADMIN' | 'USER' | 'SYSTEM';
  action: AuditActionType;
  objectType: 'ATTENDANCE' | 'LEAVE' | 'CORRECTION' | 'EMPLOYEE' | 'SETTINGS' | 'HOLIDAY';
  objectId: string;
  affectedEmployeeId?: string;
  affectedEmployeeName?: string;
  beforeValue?: string;
  afterValue?: string;
  reason?: string;
  timestamp: string;
}
