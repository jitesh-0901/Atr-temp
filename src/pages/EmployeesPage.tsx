import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EmployeeListTable, CreateEmployeeModal, EditEmployeeModal } from '../components/admin';
import { User } from '../types/auth';
import { Users, ShieldAlert } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<User | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 max-w-lg mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Access Restricted — Admin Authorization Required
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Per ATR MVP F02: Employee roster creation, editing, and account status management are
          restricted exclusively to Administrators. Please switch role in the header to evaluate this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Employee Directory & Account Governance (MVP F01 & F08)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Provision employee credentials, assign organizational roles, and manage active account states.
        </p>
      </div>

      <EmployeeListTable
        onAddNew={() => setIsCreateOpen(true)}
        onEdit={emp => setEditEmployee(emp)}
      />

      <CreateEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditEmployeeModal
        isOpen={!!editEmployee}
        onClose={() => setEditEmployee(null)}
        employee={editEmployee}
      />
    </div>
  );
};
