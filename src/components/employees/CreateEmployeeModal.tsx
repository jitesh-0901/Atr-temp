import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCorrection } from '../../context/CorrectionContext';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { UserRole } from '../../types/auth';
import { UserPlus, KeyRound, AlertCircle } from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, createEmployee } = useAuth();
  const { addAuditLog } = useCorrection();
  const { sendEmailNotification } = useNotification();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [tempPassword, setTempPassword] = useState('Genkit@2026!');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !employeeId.trim() || !jobTitle.trim()) {
      setError('Please fill in all mandatory employee fields.');
      return;
    }

    const res = createEmployee({
      name,
      email,
      employeeId,
      department,
      jobTitle,
      role,
      phone,
      tempPassword,
    });

    if (!res.success || !res.user) {
      setError(res.error || 'Failed to create employee account.');
      return;
    }

    const newEmp = res.user;

    // Audit Log per Table 7
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'ADMIN',
      action: 'EMPLOYEE_CREATED',
      objectType: 'EMPLOYEE',
      objectId: newEmp.id,
      affectedEmployeeId: newEmp.id,
      affectedEmployeeName: newEmp.name,
      reason: `Admin created new employee account: ${newEmp.name} (${newEmp.employeeId})`,
      afterValue: JSON.stringify({ email: newEmp.email, role: newEmp.role }),
    });

    // Email Notification for Account Creation / Setup (F01 & F03)
    sendEmailNotification({
      eventType: 'ACCOUNT_CREATED',
      recipientEmail: newEmp.email,
      recipientName: newEmp.name,
      subject: 'Welcome to Genkit — Your ATR Attendance Account Setup',
      bodyText: `Hello ${newEmp.name},\n\nAn employee account has been created for you on the Genkit Attendance Tracker (ATR) system by Admin ${currentUser.name}.\n\nYour Employee ID: ${newEmp.employeeId}\nRole: ${newEmp.role}\nTemporary Setup Password: ${tempPassword}\n\nPlease log in to ATR and review your profile and working calendar schedule.`,
      relatedObjectType: 'EMPLOYEE',
      relatedObjectId: newEmp.id,
    });

    // Reset and close
    setName('');
    setEmail('');
    setEmployeeId('');
    setJobTitle('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Employee Account"
      description="Admin provisions employee credentials and baseline organization role"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create & Dispatch Setup Email
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Input
            label="Work Email Address"
            type="email"
            required
            placeholder="ramesh.k@genkit.io"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Employee ID"
            required
            placeholder="GEN-107"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
          />

          <Select
            label="Department"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            options={[
              { value: 'Software Engineering', label: 'Software Engineering' },
              { value: 'Product Design', label: 'Product Design' },
              { value: 'Quality Engineering', label: 'Quality Engineering' },
              { value: 'Infrastructure', label: 'Infrastructure & SRE' },
              { value: 'Operations & HR', label: 'Operations & HR' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Job Title"
            required
            placeholder="e.g. Backend Engineer"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />

          <Select
            label="System Role"
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            options={[
              { value: 'USER', label: 'User (Standard Employee)' },
              { value: 'ADMIN', label: 'Admin (System Administrator)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Contact Phone"
            placeholder="+91 98400 12345"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <Input
            label="Temporary Setup Password"
            type="text"
            required
            value={tempPassword}
            onChange={e => setTempPassword(e.target.value)}
            leftIcon={<KeyRound className="w-3.5 h-3.5 text-slate-400" />}
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </Modal>
  );
};
