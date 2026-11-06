import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CalendarPlus, AlertCircle } from 'lucide-react';

interface AddHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHolidayModal: React.FC<AddHolidayModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { addHoliday } = useSettings();

  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PUBLIC' | 'OPTIONAL'>('PUBLIC');
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !name.trim()) {
      setError('Date and holiday name are mandatory.');
      return;
    }

    const res = addHoliday(
      {
        date,
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        isActive: true,
      },
      currentUser
    );

    if (!res.success) {
      setError(res.error || 'Failed to add holiday.');
      return;
    }

    setDate('');
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Calendar Holiday"
      description="Schedule an organizational holiday used by attendance automation rules"
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
            leftIcon={<CalendarPlus className="w-4 h-4" />}
          >
            Add Holiday
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Holiday Date"
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <Input
          label="Holiday Name"
          required
          placeholder="e.g. Republic Day"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <Select
          label="Holiday Classification"
          value={type}
          onChange={e => setType(e.target.value as 'PUBLIC' | 'OPTIONAL')}
          options={[
            { value: 'PUBLIC', label: 'Mandatory Public / Organization Holiday' },
            { value: 'OPTIONAL', label: 'Optional / Floating Holiday' },
          ]}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description or Notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. National holiday celebration, office premises will remain closed..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
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
