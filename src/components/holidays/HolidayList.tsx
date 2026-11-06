import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatDate } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Trash2, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface HolidayListProps {
  onAddNew?: () => void;
}

export const HolidayList: React.FC<HolidayListProps> = ({ onAddNew }) => {
  const { currentUser, isAdmin } = useAuth();
  const { holidays, toggleHolidayStatus, deleteHoliday } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Configured Organization Holidays ({holidays.length})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active holidays are automatically skipped by the Celery absence automation task.
          </p>
        </div>

        {isAdmin && onAddNew && (
          <Button variant="primary" size="sm" onClick={onAddNew}>
            + Add Holiday
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {holidays.map(h => (
          <div
            key={h.id}
            className={`p-4 rounded-xl border transition-all ${
              h.isActive
                ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {h.name}
                  </span>
                  <Badge variant={h.type === 'PUBLIC' ? 'info' : 'neutral'} size="sm">
                    {h.type}
                  </Badge>
                </div>
                <p className="text-xs font-mono font-medium text-brand-700 dark:text-brand-400 mt-1">
                  {formatDate(h.date)}
                </p>
                {h.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {h.description}
                  </p>
                )}
              </div>

              {isAdmin && currentUser && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleHolidayStatus(h.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={h.isActive ? 'Deactivate holiday' : 'Activate holiday'}
                  >
                    {h.isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={() => deleteHoliday(h.id, currentUser)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
