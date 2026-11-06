export interface WorkingCalendarSettings {
  timezone: string; // e.g. "Asia/Kolkata (IST, UTC+5:30)"
  workingDays: number[]; // 1 = Monday, 2 = Tuesday, ... 7 = Sunday
  attendanceDeadline: string; // "10:30" (24h format)
  autoAbsentEnabled: boolean;
  minHoursForFullDay: number; // 8
  minHoursForHalfDay: number; // 4
  allowEmployeeDirectCancelApprovedLeave: boolean;
}
