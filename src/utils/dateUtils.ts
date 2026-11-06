import { AttendanceEvent } from '../types/attendance';

export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '—';
  }
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0h 00m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  }
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

export function formatDurationDetailed(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Calculate total worked seconds from paired CHECK_IN -> CHECK_OUT events.
 * Per ATR Spec Section 5.4:
 * "Calculate worked duration as the sum of valid check-in/check-out intervals for that day.
 * Do not count time outside a paired interval. Do not invent worked time for an unmatched interval."
 */
export function calculateWorkedDurationFromEvents(events: AttendanceEvent[]): number {
  if (!events || events.length === 0) return 0;

  // Sort events chronologically
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let totalSeconds = 0;
  let currentCheckInTime: number | null = null;

  for (const event of sorted) {
    const eventTime = new Date(event.timestamp).getTime();
    if (event.eventType === 'CHECK_IN') {
      if (currentCheckInTime === null) {
        currentCheckInTime = eventTime;
      }
    } else if (event.eventType === 'CHECK_OUT') {
      if (currentCheckInTime !== null) {
        const intervalSeconds = Math.max(0, Math.floor((eventTime - currentCheckInTime) / 1000));
        totalSeconds += intervalSeconds;
        currentCheckInTime = null;
      }
    }
  }

  return totalSeconds;
}

export function getFirstAndLastPunches(events: AttendanceEvent[]): {
  firstCheckIn: string | null;
  lastCheckOut: string | null;
} {
  if (!events || events.length === 0) {
    return { firstCheckIn: null, lastCheckOut: null };
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const checkIns = sorted.filter(e => e.eventType === 'CHECK_IN');
  const checkOuts = sorted.filter(e => e.eventType === 'CHECK_OUT');

  const firstCheckIn = checkIns.length > 0 ? checkIns[0].timestamp : null;
  const lastCheckOut = checkOuts.length > 0 ? checkOuts[checkOuts.length - 1].timestamp : null;

  return { firstCheckIn, lastCheckOut };
}
