import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

interface AttendanceFilterBarProps {
  selectedEmployeeId: string;
  onSelectEmployeeId: (id: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onResetFilters: () => void;
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  selectedEmployeeId,
  onSelectEmployeeId,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchQueryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onResetFilters,
}) => {
  const { users, isAdmin } = useAuth();

  const employeeOptions = [
    { value: 'ALL', label: 'All Employees' },
    ...users
      .filter(u => u.isActive)
      .map(u => ({ value: u.id, label: `${u.name} (${u.employeeId})` })),
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'ON_LEAVE', label: 'On Leave' },
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'WEEKEND', label: 'Weekend' },
  ];

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search query */}
        <Input
          placeholder="Search by name, ID or note..."
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        {/* Employee selector (if Admin) */}
        {isAdmin && (
          <Select
            value={selectedEmployeeId}
            onChange={e => onSelectEmployeeId(e.target.value)}
            options={employeeOptions}
          />
        )}

        {/* Status filter */}
        <Select
          value={selectedStatus}
          onChange={e => onSelectStatus(e.target.value)}
          options={statusOptions}
        />

        {/* Date Filter Range */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={e => onStartDateChange(e.target.value)}
            className="text-xs"
          />
          <span className="text-slate-400 text-xs">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={e => onEndDateChange(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter results apply instantaneously to local state
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
