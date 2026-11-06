import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCorrection } from '../../context/CorrectionContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { User, UserRole } from '../../types/auth';
import { Save } from 'lucide-react';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const { currentUser, updateEmployee } = useAuth();
  const { addAuditLog } = useCorrection();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [role, setRole] = useState<UserRole>('USER');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setDepartment(employee.department);
      setJobTitle(employee.jobTitle);
      setPhone(employee.phone || '');
      setAddress(employee.address || '');
      setEmergencyContact(employee.emergencyContact || '');
      setRole(employee.role);
    }
  }, [employee]);

  if (!employee || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateEmployee(employee.id, {
      name,
      department,
      jobTitle,
      phone,
      address,
      emergencyContact,
      role,
    });

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: 'ADMIN',
      action: 'EMPLOYEE_UPDATED',
      objectType: 'EMPLOYEE',
      objectId: employee.id,
      affectedEmployeeId: employee.id,
      affectedEmployeeName: name,
      reason: 'Admin updated employee profile metadata',
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Employee Information"
      description={`Editing ${employee.name} (${employee.employeeId})`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Department"
            required
            value={department}
            onChange={e => setDepartment(e.target.value)}
          />

          <Input
            label="Job Title"
            required
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <Input
            label="Emergency Contact"
            value={emergencyContact}
            onChange={e => setEmergencyContact(e.target.value)}
          />
        </div>

        <Input
          label="Residential Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </form>
    </Modal>
  );
};
