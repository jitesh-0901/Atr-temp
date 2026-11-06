import React, { createContext, useContext, useState } from 'react';
import { LeaveRequest, LeaveBalance, LeaveType } from '../types/leave';
import { initialLeaves } from '../mock/mockLeaves';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useNotification } from './NotificationContext';
import { User } from '../types/auth';

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[];
  getLeaveBalance: (employeeId: string) => LeaveBalance;
  submitLeaveRequest: (params: {
    employee: User;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) => { success: boolean; error?: string; request?: LeaveRequest };
  approveLeaveRequest: (
    requestId: string,
    adminUser: User,
    remark?: string
  ) => { success: boolean; error?: string };
  rejectLeaveRequest: (
    requestId: string,
    adminUser: User,
    remark?: string
  ) => { success: boolean; error?: string };
  cancelLeaveRequest: (
    requestId: string,
    employeeUser: User,
    cancellationReason?: string
  ) => { success: boolean; error?: string };
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    return loadFromStorage<LeaveRequest[]>('leave_requests', initialLeaves);
  });

  const { sendEmailNotification } = useNotification();

  const getEmployeeLeaves = (employeeId: string): LeaveRequest[] => {
    return leaveRequests
      .filter(l => l.employeeId === employeeId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  };

  const getLeaveBalance = (employeeId: string): LeaveBalance => {
    // Standard quota: Annual: 18, Sick: 12, Casual: 10
    const approved = leaveRequests.filter(
      l => l.employeeId === employeeId && l.status === 'APPROVED'
    );

    const usedAnnual = approved
      .filter(l => l.leaveType === 'ANNUAL')
      .reduce((sum, l) => sum + l.daysCount, 0);

    const usedSick = approved
      .filter(l => l.leaveType === 'SICK')
      .reduce((sum, l) => sum + l.daysCount, 0);

    const usedCasual = approved
      .filter(l => l.leaveType === 'CASUAL')
      .reduce((sum, l) => sum + l.daysCount, 0);

    const usedUnpaid = approved
      .filter(l => l.leaveType === 'UNPAID')
      .reduce((sum, l) => sum + l.daysCount, 0);

    return {
      annual: Math.max(0, 18 - usedAnnual),
      annualTotal: 18,
      sick: Math.max(0, 12 - usedSick),
      sickTotal: 12,
      casual: Math.max(0, 10 - usedCasual),
      casualTotal: 10,
      unpaid: usedUnpaid,
    };
  };

  const submitLeaveRequest = (params: {
    employee: User;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }): { success: boolean; error?: string; request?: LeaveRequest } => {
    const { employee, leaveType, startDate, endDate, reason } = params;

    if (!startDate || !endDate) {
      return { success: false, error: 'Start date and end date are mandatory.' };
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return { success: false, error: 'End date cannot be earlier than start date.' };
    }

    if (!reason.trim()) {
      return { success: false, error: 'Please provide a reason for the leave request.' };
    }

    // Calculate days count
    const d1 = new Date(startDate).getTime();
    const d2 = new Date(endDate).getTime();
    const days = Math.round((d2 - d1) / (1000 * 3600 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: `lev_${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeDepartment: employee.department,
      leaveType,
      startDate,
      endDate,
      daysCount: Math.max(1, days),
      reason: reason.trim(),
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    setLeaveRequests(prev => {
      const updated = [newRequest, ...prev];
      saveToStorage('leave_requests', updated);
      return updated;
    });

    return { success: true, request: newRequest };
  };

  const approveLeaveRequest = (
    requestId: string,
    adminUser: User,
    remark?: string
  ): { success: boolean; error?: string } => {
    let target: LeaveRequest | undefined;

    setLeaveRequests(prev => {
      const updated = prev.map(l => {
        if (l.id === requestId) {
          target = {
            ...l,
            status: 'APPROVED' as const,
            decidedBy: adminUser.id,
            decidedByName: adminUser.name,
            decidedAt: new Date().toISOString(),
            decisionRemark: remark || 'Approved by Admin.',
          };
          return target;
        }
        return l;
      });
      saveToStorage('leave_requests', updated);
      return updated;
    });

    if (target) {
      sendEmailNotification({
        eventType: 'LEAVE_APPROVED',
        recipientEmail: `${(target as LeaveRequest).employeeName.toLowerCase().replace(/\s+/g, '.')}@genkit.io`,
        recipientName: (target as LeaveRequest).employeeName,
        subject: `[ATR] Leave Request Approved: ${(target as LeaveRequest).startDate} to ${(target as LeaveRequest).endDate}`,
        bodyText: `Hello ${(target as LeaveRequest).employeeName},\n\nYour ${(target as LeaveRequest).leaveType} leave request from ${(target as LeaveRequest).startDate} to ${(target as LeaveRequest).endDate} has been APPROVED by ${adminUser.name}.\n\nRemark: ${remark || 'Approved.'}`,
        relatedObjectType: 'LEAVE',
        relatedObjectId: requestId,
      });
    }

    return { success: true };
  };

  const rejectLeaveRequest = (
    requestId: string,
    adminUser: User,
    remark?: string
  ): { success: boolean; error?: string } => {
    let target: LeaveRequest | undefined;

    setLeaveRequests(prev => {
      const updated = prev.map(l => {
        if (l.id === requestId) {
          target = {
            ...l,
            status: 'REJECTED' as const,
            decidedBy: adminUser.id,
            decidedByName: adminUser.name,
            decidedAt: new Date().toISOString(),
            decisionRemark: remark || 'Rejected by Admin.',
          };
          return target;
        }
        return l;
      });
      saveToStorage('leave_requests', updated);
      return updated;
    });

    if (target) {
      sendEmailNotification({
        eventType: 'LEAVE_REJECTED',
        recipientEmail: `${(target as LeaveRequest).employeeName.toLowerCase().replace(/\s+/g, '.')}@genkit.io`,
        recipientName: (target as LeaveRequest).employeeName,
        subject: `[ATR] Leave Request Rejected: ${(target as LeaveRequest).startDate} to ${(target as LeaveRequest).endDate}`,
        bodyText: `Hello ${(target as LeaveRequest).employeeName},\n\nYour ${(target as LeaveRequest).leaveType} leave request has been REJECTED by ${adminUser.name}.\n\nReason/Remark: ${remark || 'Operational constraints.'}`,
        relatedObjectType: 'LEAVE',
        relatedObjectId: requestId,
      });
    }

    return { success: true };
  };

  const cancelLeaveRequest = (
    requestId: string,
    employeeUser: User,
    cancellationReason?: string
  ): { success: boolean; error?: string } => {
    let target: LeaveRequest | undefined;

    setLeaveRequests(prev => {
      const updated = prev.map(l => {
        if (l.id === requestId) {
          // Verify ownership
          if (l.employeeId !== employeeUser.id && employeeUser.role !== 'ADMIN') {
            return l;
          }
          target = {
            ...l,
            status: 'CANCELLED' as const,
            cancelledAt: new Date().toISOString(),
            cancellationReason: cancellationReason || 'Cancelled by employee.',
          };
          return target;
        }
        return l;
      });
      saveToStorage('leave_requests', updated);
      return updated;
    });

    if (target) {
      sendEmailNotification({
        eventType: 'LEAVE_CANCELLED',
        recipientEmail: 'admin@genkit.io',
        recipientName: 'Hari Krishna (Admin)',
        subject: `[ATR Notice] Leave Cancelled by ${(target as LeaveRequest).employeeName}`,
        bodyText: `Hello Admin,\n\nEmployee ${(target as LeaveRequest).employeeName} has cancelled their ${(target as LeaveRequest).status.toLowerCase()} leave request (${(target as LeaveRequest).startDate} to ${(target as LeaveRequest).endDate}).\n\nCancellation note: ${cancellationReason || 'Cancelled by employee.'}`,
        relatedObjectType: 'LEAVE',
        relatedObjectId: requestId,
      });
    }

    return { success: true };
  };

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        getEmployeeLeaves,
        getLeaveBalance,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        cancelLeaveRequest,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) throw new Error('useLeave must be used within LeaveProvider');
  return context;
};
