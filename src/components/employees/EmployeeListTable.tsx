import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCorrection } from '../../context/CorrectionContext';
import { User } from '../../types/auth';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatDate } from '../../utils/dateUtils';
import { Edit2, UserCheck, UserX, Search, ShieldCheck } from 'lucide-react';

interface EmployeeListTableProps {
  onEdit: (emp: User) => void;
  onAddNew: () => void;
}

export const EmployeeListTable: React.FC<EmployeeListTableProps> = ({ onEdit, onAddNew }) => {
  const { users, currentUser, toggleEmployeeActive } = useAuth();
  const { addAuditLog } = useCorrection();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.employeeId.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.jobTitle.toLowerCase().includes(q)
    );
  });

  const handleToggleActive = (target: User) => {
    toggleEmployeeActive(target.id);
    if (currentUser) {
      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: 'ADMIN',
        action: 'EMPLOYEE_DEACTIVATED',
        objectType: 'EMPLOYEE',
        objectId: target.id,
        affectedEmployeeId: target.id,
        affectedEmployeeName: target.name,
        reason: target.isActive
          ? `Admin deactivated employee ${target.name}. Authentication disabled.`
          : `Admin reactivated employee ${target.name}.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search employees by name, ID or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Button variant="primary" size="sm" onClick={onAddNew}>
          + Provision New Employee
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/90 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department & Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map(emp => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                        {emp.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {emp.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-slate-700 dark:text-slate-300">
                    {emp.employeeId}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant={emp.role === 'ADMIN' ? 'info' : 'neutral'} size="sm">
                      {emp.role === 'ADMIN' ? (
                        <ShieldCheck className="w-3 h-3 inline mr-1 text-brand-600 dark:text-brand-400" />
                      ) : null}
                      {emp.role}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{emp.jobTitle}</p>
                    <p className="text-[11px] text-slate-400">{emp.department}</p>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant={emp.isActive ? 'success' : 'danger'} size="sm" dot>
                      {emp.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {formatDate(emp.createdAt.split('T')[0])}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(emp)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(emp)}
                        className={
                          emp.isActive
                            ? 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
                            : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                        }
                        leftIcon={
                          emp.isActive ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {emp.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </div>
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
