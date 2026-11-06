import { AttendanceDayStatus } from '../types/attendance';
import { LeaveStatus, LeaveType } from '../types/leave';
import { CorrectionStatus } from '../types/correction';

export function getAttendanceStatusBadge(status: AttendanceDayStatus) {
  switch (status) {
    case 'PRESENT':
      return {
        label: 'Present',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
      };
    case 'ABSENT':
      return {
        label: 'Absent',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/60',
        dot: 'bg-rose-500',
      };
    case 'ON_LEAVE':
      return {
        label: 'On Leave',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      };
    case 'HOLIDAY':
      return {
        label: 'Holiday',
        bg: 'bg-indigo-50 dark:bg-indigo-950/40',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800/60',
        dot: 'bg-indigo-500',
      };
    case 'WEEKEND':
      return {
        label: 'Weekend',
        bg: 'bg-slate-100 dark:bg-slate-800/60',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function getLeaveStatusBadge(status: LeaveStatus) {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Approved',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
      };
    case 'PENDING':
      return {
        label: 'Pending Review',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/60',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/60',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-slate-100 dark:bg-slate-800/60',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
      };
  }
}

export function getCorrectionStatusBadge(status: CorrectionStatus) {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Approved',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
      };
    case 'PENDING':
      return {
        label: 'Pending Review',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/60',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/60',
      };
  }
}

export function getLeaveTypeLabel(type: LeaveType): string {
  switch (type) {
    case 'CASUAL': return 'Casual Leave';
    case 'SICK': return 'Sick Leave';
    case 'ANNUAL': return 'Annual / Privilege';
    case 'UNPAID': return 'Leave Without Pay';
  }
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}
