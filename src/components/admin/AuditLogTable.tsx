import React, { useState } from 'react';
import { AuditLog } from '../../types/correction';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { ShieldCheck, Search, Shield, Cpu, User } from 'lucide-react';

interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q) ||
      (l.affectedEmployeeName && l.affectedEmployeeName.toLowerCase().includes(q)) ||
      (l.reason && l.reason.toLowerCase().includes(q))
    );
  });

  const getActorIcon = (role: 'ADMIN' | 'USER' | 'SYSTEM') => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />;
      case 'SYSTEM':
        return <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Immutable Audit Chronology ({filtered.length} entries)
          </h4>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="text-xs py-1.5"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/90 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Affected Employee</th>
                <th className="py-3 px-4">Before / After Changes</th>
                <th className="py-3 px-4">Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map(l => (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDate(l.timestamp.split('T')[0])} {formatTime(l.timestamp)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      {getActorIcon(l.actorRole)}
                      <span>{l.actorName}</span>
                      <span className="text-[10px] text-slate-400">({l.actorRole})</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                      {l.action}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                    {l.affectedEmployeeName || '—'}
                  </td>

                  <td className="py-3 px-4 text-[11px] max-w-xs truncate font-mono">
                    {l.afterValue ? (
                      <span title={`Before: ${l.beforeValue || 'None'} -> After: ${l.afterValue}`}>
                        {l.afterValue}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3 px-4 text-[11px] max-w-sm truncate text-slate-600 dark:text-slate-400">
                    {l.reason || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
