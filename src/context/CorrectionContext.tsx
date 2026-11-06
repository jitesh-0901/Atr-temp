import React, { createContext, useContext, useState } from 'react';
import {
  AttendanceCorrectionRequest,
  CorrectionField,
  AuditLog,
  AuditActionType,
} from '../types/correction';
import { initialCorrections } from '../mock/mockCorrections';
import { initialAuditLogs } from '../mock/mockAuditLogs';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useNotification } from './NotificationContext';
import { useAttendance } from './AttendanceContext';
import { User } from '../types/auth';

interface CorrectionContextType {
  corrections: AttendanceCorrectionRequest[];
  auditLogs: AuditLog[];
  getEmployeeCorrections: (employeeId: string) => AttendanceCorrectionRequest[];
  submitCorrectionRequest: (params: {
    employee: User;
    attendanceDate: string;
    field: CorrectionField;
    originalFirstCheckIn: string | null;
    originalLastCheckOut: string | null;
    requestedFirstCheckIn: string | null;
    requestedLastCheckOut: string | null;
    reason: string;
  }) => { success: boolean; error?: string };
  approveCorrectionRequest: (
    requestId: string,
    adminUser: User,
    remark?: string
  ) => { success: boolean; error?: string };
  rejectCorrectionRequest: (
    requestId: string,
    adminUser: User,
    remark?: string
  ) => { success: boolean; error?: string };
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

const CorrectionContext = createContext<CorrectionContextType | undefined>(undefined);

export const CorrectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [corrections, setCorrections] = useState<AttendanceCorrectionRequest[]>(() => {
    return loadFromStorage<AttendanceCorrectionRequest[]>('corrections', initialCorrections);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return loadFromStorage<AuditLog[]>('audit_logs', initialAuditLogs);
  });

  const { sendEmailNotification } = useNotification();
  const { applyApprovedCorrection } = useAttendance();

  const getEmployeeCorrections = (employeeId: string): AttendanceCorrectionRequest[] => {
    return corrections
      .filter(c => c.employeeId === employeeId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  };

  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      saveToStorage('audit_logs', updated);
      return updated;
    });
  };

  const submitCorrectionRequest = (params: {
    employee: User;
    attendanceDate: string;
    field: CorrectionField;
    originalFirstCheckIn: string | null;
    originalLastCheckOut: string | null;
    requestedFirstCheckIn: string | null;
    requestedLastCheckOut: string | null;
    reason: string;
  }): { success: boolean; error?: string } => {
    const {
      employee,
      attendanceDate,
      field,
      originalFirstCheckIn,
      originalLastCheckOut,
      requestedFirstCheckIn,
      requestedLastCheckOut,
      reason,
    } = params;

    if (!attendanceDate) {
      return { success: false, error: 'Attendance date is required.' };
    }

    if (!reason.trim()) {
      return { success: false, error: 'Please explain the reason for the attendance correction.' };
    }

    const newRequest: AttendanceCorrectionRequest = {
      id: `cor_${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      attendanceDate,
      field,
      originalFirstCheckIn,
      originalLastCheckOut,
      requestedFirstCheckIn,
      requestedLastCheckOut,
      reason: reason.trim(),
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    setCorrections(prev => {
      const updated = [newRequest, ...prev];
      saveToStorage('corrections', updated);
      return updated;
    });

    addAuditLog({
      actorId: employee.id,
      actorName: employee.name,
      actorRole: 'USER',
      action: 'CORRECTION_REQUESTED' as AuditActionType,
      objectType: 'CORRECTION',
      objectId: newRequest.id,
      affectedEmployeeId: employee.id,
      affectedEmployeeName: employee.name,
      reason: reason.trim(),
      beforeValue: `First: ${originalFirstCheckIn || 'None'}, Last: ${originalLastCheckOut || 'None'}`,
      afterValue: `Requested: First: ${requestedFirstCheckIn || 'None'}, Last: ${requestedLastCheckOut || 'None'}`,
    });

    return { success: true };
  };

  const approveCorrectionRequest = (
    requestId: string,
    adminUser: User,
    remark?: string
  ): { success: boolean; error?: string } => {
    let target: AttendanceCorrectionRequest | undefined;

    setCorrections(prev => {
      const updated = prev.map(c => {
        if (c.id === requestId) {
          target = {
            ...c,
            status: 'APPROVED' as const,
            reviewedBy: adminUser.id,
            reviewedByName: adminUser.name,
            reviewedAt: new Date().toISOString(),
            reviewRemark: remark || 'Approved by Admin.',
          };
          return target;
        }
        return c;
      });
      saveToStorage('corrections', updated);
      return updated;
    });

    if (target) {
      // Apply change to Attendance
      applyApprovedCorrection(
        (target as AttendanceCorrectionRequest).employeeId,
        (target as AttendanceCorrectionRequest).attendanceDate,
        (target as AttendanceCorrectionRequest).requestedFirstCheckIn,
        (target as AttendanceCorrectionRequest).requestedLastCheckOut,
        remark || 'Correction Approved'
      );

      // Audit Log
      addAuditLog({
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: 'CORRECTION_APPROVED',
        objectType: 'CORRECTION',
        objectId: requestId,
        affectedEmployeeId: (target as AttendanceCorrectionRequest).employeeId,
        affectedEmployeeName: (target as AttendanceCorrectionRequest).employeeName,
        reason: remark || 'Admin approved correction',
        beforeValue: `Original First: ${(target as AttendanceCorrectionRequest).originalFirstCheckIn || 'None'}`,
        afterValue: `Approved First: ${(target as AttendanceCorrectionRequest).requestedFirstCheckIn || 'None'}, Last: ${(target as AttendanceCorrectionRequest).requestedLastCheckOut || 'None'}`,
      });

      // Email Notification per MVP F03
      sendEmailNotification({
        eventType: 'CORRECTION_APPROVED',
        recipientEmail: `${(target as AttendanceCorrectionRequest).employeeName.toLowerCase().replace(/\s+/g, '.')}@genkit.io`,
        recipientName: (target as AttendanceCorrectionRequest).employeeName,
        subject: `[ATR] Attendance Correction Approved - ${(target as AttendanceCorrectionRequest).attendanceDate}`,
        bodyText: `Hello ${(target as AttendanceCorrectionRequest).employeeName},\n\nYour attendance correction request for date ${(target as AttendanceCorrectionRequest).attendanceDate} has been APPROVED by ${adminUser.name}.\n\nRemark: ${remark || 'Approved'}\n\nYour attendance records have been recalculated.`,
        relatedObjectType: 'CORRECTION',
        relatedObjectId: requestId,
      });
    }

    return { success: true };
  };

  const rejectCorrectionRequest = (
    requestId: string,
    adminUser: User,
    remark?: string
  ): { success: boolean; error?: string } => {
    let target: AttendanceCorrectionRequest | undefined;

    setCorrections(prev => {
      const updated = prev.map(c => {
        if (c.id === requestId) {
          target = {
            ...c,
            status: 'REJECTED' as const,
            reviewedBy: adminUser.id,
            reviewedByName: adminUser.name,
            reviewedAt: new Date().toISOString(),
            reviewRemark: remark || 'Rejected by Admin.',
          };
          return target;
        }
        return c;
      });
      saveToStorage('corrections', updated);
      return updated;
    });

    if (target) {
      addAuditLog({
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: 'CORRECTION_REJECTED',
        objectType: 'CORRECTION',
        objectId: requestId,
        affectedEmployeeId: (target as AttendanceCorrectionRequest).employeeId,
        affectedEmployeeName: (target as AttendanceCorrectionRequest).employeeName,
        reason: remark || 'Admin rejected correction',
      });

      sendEmailNotification({
        eventType: 'CORRECTION_REJECTED',
        recipientEmail: `${(target as AttendanceCorrectionRequest).employeeName.toLowerCase().replace(/\s+/g, '.')}@genkit.io`,
        recipientName: (target as AttendanceCorrectionRequest).employeeName,
        subject: `[ATR] Attendance Correction Rejected - ${(target as AttendanceCorrectionRequest).attendanceDate}`,
        bodyText: `Hello ${(target as AttendanceCorrectionRequest).employeeName},\n\nYour attendance correction request for ${(target as AttendanceCorrectionRequest).attendanceDate} has been REJECTED by ${adminUser.name}.\n\nReview Remark: ${remark || 'Insufficient verification evidence.'}`,
        relatedObjectType: 'CORRECTION',
        relatedObjectId: requestId,
      });
    }

    return { success: true };
  };

  return (
    <CorrectionContext.Provider
      value={{
        corrections,
        auditLogs,
        getEmployeeCorrections,
        submitCorrectionRequest,
        approveCorrectionRequest,
        rejectCorrectionRequest,
        addAuditLog,
      }}
    >
      {children}
    </CorrectionContext.Provider>
  );
};

export const useCorrection = () => {
  const context = useContext(CorrectionContext);
  if (!context) throw new Error('useCorrection must be used within CorrectionProvider');
  return context;
};
