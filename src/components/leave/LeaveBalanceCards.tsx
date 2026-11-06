import React from 'react';
import { LeaveBalance } from '../../types/leave';
import { Card } from '../common/Card';
import { Calendar, HeartPulse, Sparkles, Briefcase } from 'lucide-react';

interface LeaveBalanceCardsProps {
  balance: LeaveBalance;
}

export const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({ balance }) => {
  const cards = [
    {
      title: 'Annual / Privilege Leave',
      available: balance.annual,
      total: balance.annualTotal,
      icon: Sparkles,
      iconBg: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
    },
    {
      title: 'Sick / Medical Leave',
      available: balance.sick,
      total: balance.sickTotal,
      icon: HeartPulse,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      title: 'Casual Leave',
      available: balance.casual,
      total: balance.casualTotal,
      icon: Calendar,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    },
    {
      title: 'Unpaid Leave (Taken)',
      available: balance.unpaid,
      total: 'No Limit',
      icon: Briefcase,
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <Card key={idx} className="p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {c.title}
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {c.available}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {c.total} {typeof c.total === 'number' ? 'days' : ''}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-xl shrink-0 ${c.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
