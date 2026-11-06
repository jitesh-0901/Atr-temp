import { WorkingCalendarSettings } from '../types/settings';

export const initialSettings: WorkingCalendarSettings = {
  timezone: 'Asia/Kolkata (IST, UTC+5:30)',
  workingDays: [1, 2, 3, 4, 5], // Monday through Friday
  attendanceDeadline: '10:30', // 10:30 AM IST
  autoAbsentEnabled: true,
  minHoursForFullDay: 8,
  minHoursForHalfDay: 4,
  allowEmployeeDirectCancelApprovedLeave: true,
};
