import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HolidayList } from '../components/holidays/HolidayList';
import { WorkingCalendarCard } from '../components/holidays/WorkingCalendarCard';
import { AddHolidayModal } from '../components/admin';

export const HolidaysPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          Holidays & Working Calendar (MVP F09)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Corporate holiday schedule and weekly operating hours used by automatic absence marking rules.
        </p>
      </div>

      <WorkingCalendarCard />

      <HolidayList onAddNew={isAdmin ? () => setIsAddModalOpen(true) : undefined} />

      <AddHolidayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
