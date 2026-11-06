import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditLog } from '../../types/correction';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Activity, ArrowRight } from 'lucide-react';

interface RecentActivityFeedProps {
  logs: AuditLog[];
  onViewAll?: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ logs, onViewAll }) => {
  const navigate = useNavigate();
  const recent = logs.slice(0, 5);

  const handleClickAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate('/corrections');
    }
  };

  return (
    <Card className="shadow-2xs">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Audit & System Activity Stream
          </span>
          <button
            onClick={handleClickAll}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            All Logs <ArrowRight className="w-3 h-3" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
        {recent.map(l => (
          <div key={l.id} className="py-3 first:pt-0 last:pb-0 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {l.actorName}{' '}
                  <span className="font-normal text-slate-500">
                    performed{' '}
                    <strong className="text-brand-700 dark:text-brand-300 font-mono text-[11px]">
                      {l.action}
                    </strong>
                  </span>
                </p>
                {l.affectedEmployeeName && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Target: {l.affectedEmployeeName}
                  </p>
                )}
                {l.reason && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-0.5">
                    "{l.reason}"
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-mono block">
                  {formatTime(l.timestamp)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {formatDate(l.timestamp.split('T')[0])}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
