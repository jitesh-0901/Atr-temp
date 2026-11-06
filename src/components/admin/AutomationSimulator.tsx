import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useSettings } from '../../context/SettingsContext';
import { useCorrection } from '../../context/CorrectionContext';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { getTodayLocalDate } from '../../utils/dateUtils';
import { Play, Terminal, ShieldCheck } from 'lucide-react';

export const AutomationSimulator: React.FC = () => {
  const { users, currentUser } = useAuth();
  const { runAutoAbsentTask } = useAttendance();
  const { settings, holidays } = useSettings();
  const { addAuditLog } = useCorrection();

  const [logs, setLogs] = useState<string[]>([
    '[Scheduler Ready] Celery Beat schedule configured for daily run post-deadline.',
    `[Policy Config] Timezone: ${settings.timezone} | Cutoff Deadline: ${settings.attendanceDeadline} IST`,
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTask = () => {
    setIsRunning(true);
    const today = getTodayLocalDate();
    const isHoliday = holidays.some(h => h.date === today && h.isActive);
    const activeEmployees = users.filter(u => u.isActive);

    const newLogs: string[] = [
      `[${new Date().toLocaleTimeString()}] Celery Task "tasks.process_daily_absences" triggered manually...`,
      `[Target Date] Evaluating local date: ${today}`,
    ];

    if (isHoliday) {
      newLogs.push(`[Skip Execution] Today is marked as an active Organization Holiday. Task terminating without absence marking.`);
      setLogs(prev => [...newLogs, ...prev]);
      setIsRunning(false);
      return;
    }

    const result = runAutoAbsentTask(
      activeEmployees,
      today,
      settings.attendanceDeadline,
      settings.workingDays,
      isHoliday
    );

    newLogs.push(result.logMessage);
    newLogs.push(`[Audit Record] Recorded task execution event in system AuditLog.`);

    if (currentUser) {
      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: 'ADMIN',
        action: 'AUTO_ABSENT_EXECUTED',
        objectType: 'SETTINGS',
        objectId: 'auto_absent_task',
        reason: `Manually invoked absence engine. Evaluated ${result.processedCount} employees; marked ${result.newlyMarkedCount} absent.`,
      });
    }

    setLogs(prev => [...newLogs, ...prev]);
    setIsRunning(false);
  };

  return (
    <Card className="shadow-2xs">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Automatic Absence Marking Engine (MVP F12 Simulation)
          </span>
          <Badge variant="info" size="sm">
            Celery / Redis Simulator
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Deterministic Absence Rules Enforced:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <li>Skips scheduled non-working days (weekends) and active organization holidays.</li>
            <li>Checks if employee has any recorded check-in before the cutoff deadline ({settings.attendanceDeadline} IST).</li>
            <li>Skips employees who are on approved leave for today.</li>
            <li>Dispatches async email alert to each marked absent employee and records entry in Audit Log.</li>
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunTask}
            isLoading={isRunning}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Execute Absence Engine Now
          </Button>

          <span className="text-[11px] text-slate-400">
            Check the Email Outbox in the header to view generated email alerts.
          </span>
        </div>

        {/* Console Log Terminal */}
        <div className="rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-800 text-[10px]">
            <span>ENGINE EXECUTION CONSOLE</span>
            <span>STATUS: ACTIVE</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-emerald-400 mr-1.5">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
