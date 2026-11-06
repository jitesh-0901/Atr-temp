import React, { createContext, useContext, useState } from 'react';
import {
  AttendanceDaySummary,
  AttendanceEvent,
  AttendanceDayStatus,
  TodayAttendanceState,
} from '../types/attendance';
import { initialAttendanceSummaries } from '../mock/mockAttendance';
import {
  getTodayLocalDate,
  calculateWorkedDurationFromEvents,
  getFirstAndLastPunches,
} from '../utils/dateUtils';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useNotification } from './NotificationContext';
import { User } from '../types/auth';

interface AttendanceContextType {
  summaries: AttendanceDaySummary[];
  getEmployeeSummaries: (employeeId: string) => AttendanceDaySummary[];
  getTodayState: (employeeId: string) => TodayAttendanceState;
  checkIn: (employeeId: string, employeeName?: string) => { success: boolean; error?: string };
  checkOut: (employeeId: string) => { success: boolean; error?: string };
  adminDirectEdit: (
    summaryId: string,
    updates: {
      firstCheckIn: string | null;
      lastCheckOut: string | null;
      status: AttendanceDayStatus;
    },
    reason: string,
    adminUser: User
  ) => { success: boolean; error?: string };
  runAutoAbsentTask: (
    activeEmployees: User[],
    todayDate: string,
    attendanceDeadline: string,
    workingDays: number[],
    isHoliday: boolean
  ) => { processedCount: number; newlyMarkedCount: number; logMessage: string };
  applyApprovedCorrection: (
    employeeId: string,
    date: string,
    requestedFirstIn: string | null,
    requestedLastOut: string | null,
    remark: string
  ) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summaries, setSummaries] = useState<AttendanceDaySummary[]>(() => {
    return loadFromStorage<AttendanceDaySummary[]>('attendance_summaries', initialAttendanceSummaries);
  });

  const { sendEmailNotification } = useNotification();

  const getEmployeeSummaries = (employeeId: string): AttendanceDaySummary[] => {
    return summaries
      .filter(s => s.employeeId === employeeId)
      .sort((a, b) => b.localDate.localeCompare(a.localDate));
  };

  const getTodayState = (employeeId: string): TodayAttendanceState => {
    const today = getTodayLocalDate();
    const todaySummary = summaries.find(
      s => s.employeeId === employeeId && s.localDate === today
    ) || null;

    if (!todaySummary || todaySummary.events.length === 0) {
      return {
        isActiveSession: false,
        activeCheckInTime: null,
        todaySummary,
        events: todaySummary?.events || [],
      };
    }

    // Sort events
    const sorted = [...todaySummary.events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const lastEvent = sorted[sorted.length - 1];
    const isActiveSession = lastEvent.eventType === 'CHECK_IN';

    return {
      isActiveSession,
      activeCheckInTime: isActiveSession ? lastEvent.timestamp : null,
      todaySummary,
      events: sorted,
    };
  };

  const checkIn = (employeeId: string, employeeName?: string): { success: boolean; error?: string } => {
    const today = getTodayLocalDate();
    const nowIso = new Date().toISOString();

    const existingSummary = summaries.find(
      s => s.employeeId === employeeId && s.localDate === today
    );

    if (existingSummary) {
      // Check if already in an active session
      const sortedEvents = [...existingSummary.events].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      if (sortedEvents.length > 0 && sortedEvents[sortedEvents.length - 1].eventType === 'CHECK_IN') {
        return {
          success: false,
          error: 'An active check-in session is already running. Please check out first.',
        };
      }
    }

    const newEvent: AttendanceEvent = {
      id: `evt_${Date.now()}_in`,
      employeeId,
      eventType: 'CHECK_IN',
      timestamp: nowIso,
      localDate: today,
      source: 'WEB',
    };

    setSummaries(prev => {
      let updated: AttendanceDaySummary[];
      const foundIndex = prev.findIndex(s => s.employeeId === employeeId && s.localDate === today);

      if (foundIndex >= 0) {
        const cur = prev[foundIndex];
        const updatedEvents = [...cur.events, newEvent];
        const { firstCheckIn, lastCheckOut } = getFirstAndLastPunches(updatedEvents);
        const workedSeconds = calculateWorkedDurationFromEvents(updatedEvents);

        const updatedSummary: AttendanceDaySummary = {
          ...cur,
          firstCheckIn: cur.firstCheckIn || firstCheckIn,
          lastCheckOut: lastCheckOut,
          totalWorkedSeconds: workedSeconds,
          status: 'PRESENT',
          events: updatedEvents,
        };

        updated = [...prev];
        updated[foundIndex] = updatedSummary;
      } else {
        const newSummary: AttendanceDaySummary = {
          id: `att_sum_${Date.now()}`,
          employeeId,
          employeeName: employeeName || 'Employee',
          localDate: today,
          firstCheckIn: nowIso,
          lastCheckOut: null,
          totalWorkedSeconds: 0,
          status: 'PRESENT',
          events: [newEvent],
        };
        updated = [newSummary, ...prev];
      }

      saveToStorage('attendance_summaries', updated);
      return updated;
    });

    return { success: true };
  };

  const checkOut = (employeeId: string): { success: boolean; error?: string } => {
    const today = getTodayLocalDate();
    const nowIso = new Date().toISOString();

    const existingSummary = summaries.find(
      s => s.employeeId === employeeId && s.localDate === today
    );

    if (!existingSummary || existingSummary.events.length === 0) {
      return {
        success: false,
        error: 'No active check-in found for today. You must check in before checking out.',
      };
    }

    const sortedEvents = [...existingSummary.events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (sortedEvents[sortedEvents.length - 1].eventType !== 'CHECK_IN') {
      return {
        success: false,
        error: 'You are already checked out. Please check in to start a new work session.',
      };
    }

    const newEvent: AttendanceEvent = {
      id: `evt_${Date.now()}_out`,
      employeeId,
      eventType: 'CHECK_OUT',
      timestamp: nowIso,
      localDate: today,
      source: 'WEB',
    };

    setSummaries(prev => {
      const foundIndex = prev.findIndex(s => s.employeeId === employeeId && s.localDate === today);
      if (foundIndex < 0) return prev;

      const cur = prev[foundIndex];
      const updatedEvents = [...cur.events, newEvent];
      const { firstCheckIn, lastCheckOut } = getFirstAndLastPunches(updatedEvents);
      const workedSeconds = calculateWorkedDurationFromEvents(updatedEvents);

      const updatedSummary: AttendanceDaySummary = {
        ...cur,
        firstCheckIn,
        lastCheckOut,
        totalWorkedSeconds: workedSeconds,
        status: 'PRESENT',
        events: updatedEvents,
      };

      const updated = [...prev];
      updated[foundIndex] = updatedSummary;
      saveToStorage('attendance_summaries', updated);
      return updated;
    });

    return { success: true };
  };

  const adminDirectEdit = (
    summaryId: string,
    updates: {
      firstCheckIn: string | null;
      lastCheckOut: string | null;
      status: AttendanceDayStatus;
    },
    reason: string,
    adminUser: User
  ): { success: boolean; error?: string } => {
    if (!reason.trim()) {
      return { success: false, error: 'A mandatory reason is required for direct Admin attendance edits.' };
    }

    setSummaries(prev => {
      const updated = prev.map(s => {
        if (s.id === summaryId) {
          // Re-estimate duration from punches if provided
          let newDuration = s.totalWorkedSeconds;
          if (updates.firstCheckIn && updates.lastCheckOut) {
            const t1 = new Date(updates.firstCheckIn).getTime();
            const t2 = new Date(updates.lastCheckOut).getTime();
            if (t2 > t1) {
              newDuration = Math.floor((t2 - t1) / 1000);
            }
          }

          return {
            ...s,
            firstCheckIn: updates.firstCheckIn,
            lastCheckOut: updates.lastCheckOut,
            status: updates.status,
            totalWorkedSeconds: newDuration,
            hasCorrection: true,
            adminRemark: `Direct Edit by Admin (${adminUser.name}): ${reason.trim()}`,
          };
        }
        return s;
      });
      saveToStorage('attendance_summaries', updated);
      return updated;
    });

    return { success: true };
  };

  const applyApprovedCorrection = (
    employeeId: string,
    date: string,
    requestedFirstIn: string | null,
    requestedLastOut: string | null,
    remark: string
  ) => {
    setSummaries(prev => {
      let updated: AttendanceDaySummary[];
      const foundIndex = prev.findIndex(s => s.employeeId === employeeId && s.localDate === date);

      let calcDuration = 0;
      if (requestedFirstIn && requestedLastOut) {
        const diff = new Date(requestedLastOut).getTime() - new Date(requestedFirstIn).getTime();
        calcDuration = Math.max(0, Math.floor(diff / 1000));
      }

      if (foundIndex >= 0) {
        const cur = prev[foundIndex];
        const updatedSummary: AttendanceDaySummary = {
          ...cur,
          firstCheckIn: requestedFirstIn || cur.firstCheckIn,
          lastCheckOut: requestedLastOut || cur.lastCheckOut,
          totalWorkedSeconds: calcDuration > 0 ? calcDuration : cur.totalWorkedSeconds,
          status: 'PRESENT',
          hasCorrection: true,
          correctionRemark: remark,
        };
        updated = [...prev];
        updated[foundIndex] = updatedSummary;
      } else {
        const newSummary: AttendanceDaySummary = {
          id: `att_sum_corr_${Date.now()}`,
          employeeId,
          localDate: date,
          firstCheckIn: requestedFirstIn,
          lastCheckOut: requestedLastOut,
          totalWorkedSeconds: calcDuration,
          status: 'PRESENT',
          events: [],
          hasCorrection: true,
          correctionRemark: remark,
        };
        updated = [newSummary, ...prev];
      }

      saveToStorage('attendance_summaries', updated);
      return updated;
    });
  };

  const runAutoAbsentTask = (
    activeEmployees: User[],
    todayDate: string,
    attendanceDeadline: string,
    workingDays: number[],
    isHoliday: boolean
  ): { processedCount: number; newlyMarkedCount: number; logMessage: string } => {
    // Check if weekend or holiday
    const d = new Date(todayDate);
    const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon, 7=Sun

    if (isHoliday) {
      return {
        processedCount: 0,
        newlyMarkedCount: 0,
        logMessage: `[Celery Task] Skipping ${todayDate}: Today is an active Organization Holiday.`,
      };
    }

    if (!workingDays.includes(dayOfWeek)) {
      return {
        processedCount: 0,
        newlyMarkedCount: 0,
        logMessage: `[Celery Task] Skipping ${todayDate}: Today is a scheduled non-working day.`,
      };
    }

    let newlyMarkedCount = 0;
    const currentSummaries = [...summaries];

    activeEmployees.forEach(emp => {
      const existing = currentSummaries.find(
        s => s.employeeId === emp.id && s.localDate === todayDate
      );

      // If no record or record without any check-in
      if (!existing || (!existing.firstCheckIn && existing.status !== 'ON_LEAVE')) {
        newlyMarkedCount++;
        if (existing) {
          existing.status = 'ABSENT';
        } else {
          currentSummaries.push({
            id: `att_sum_abs_${Date.now()}_${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.name,
            localDate: todayDate,
            firstCheckIn: null,
            lastCheckOut: null,
            totalWorkedSeconds: 0,
            status: 'ABSENT',
            events: [],
          });
        }

        // Trigger email notification per MVP F03 & F12
        sendEmailNotification({
          eventType: 'AUTO_ABSENT_MARKED',
          recipientEmail: emp.email,
          recipientName: emp.name,
          subject: `[ATR Alert] Automatic Absence Marked for ${todayDate}`,
          bodyText: `Hello ${emp.name},\n\nOur attendance automation task ran after the deadline (${attendanceDeadline} IST) and marked you absent for ${todayDate} due to no recorded check-in.\n\nIf this was an error, please submit an Attendance Correction request in ATR.`,
          relatedObjectType: 'ATTENDANCE',
          relatedObjectId: emp.id,
        });
      }
    });

    setSummaries(currentSummaries);
    saveToStorage('attendance_summaries', currentSummaries);

    return {
      processedCount: activeEmployees.length,
      newlyMarkedCount,
      logMessage: `[Celery Task Success] Evaluated ${activeEmployees.length} active employees against deadline (${attendanceDeadline} IST). Marked ${newlyMarkedCount} absent. Notifications dispatched.`,
    };
  };

  return (
    <AttendanceContext.Provider
      value={{
        summaries,
        getEmployeeSummaries,
        getTodayState,
        checkIn,
        checkOut,
        adminDirectEdit,
        runAutoAbsentTask,
        applyApprovedCorrection,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used within AttendanceProvider');
  return context;
};
