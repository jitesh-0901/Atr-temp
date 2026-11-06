export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type LeaveType = 'CASUAL' | 'SICK' | 'ANNUAL' | 'UNPAID';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment?: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string; // ISO string
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  decisionRemark?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface LeaveBalance {
  annual: number;
  annualTotal: number;
  sick: number;
  sickTotal: number;
  casual: number;
  casualTotal: number;
  unpaid: number;
}
