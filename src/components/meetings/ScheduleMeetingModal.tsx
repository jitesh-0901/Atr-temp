import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeeting } from '../../context/MeetingContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CalendarPlus, AlertCircle } from 'lucide-react';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { scheduleMeeting } = useMeeting();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [locationOrLink, setLocationOrLink] = useState('meet.genkit.io/team-sync');
  const [isMandatory, setIsMandatory] = useState(true);
  const [departmentScope, setDepartmentScope] = useState('All Organization');
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return null;

  const dayNames: Record<number, string> = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Meeting title is required.');
      return;
    }

    const res = scheduleMeeting(
      {
        title: title.trim(),
        description: description.trim(),
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        startTime,
        endTime,
        locationOrLink: locationOrLink.trim(),
        isMandatory,
        departmentScope,
      },
      currentUser
    );

    if (!res.success) {
      setError(res.error || 'Failed to schedule meeting.');
      return;
    }

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Recurring Weekly Meeting"
      description="Setup organizational attendance tracking for recurring team syncs and reviews"
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
            Create & Notify Staff
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Meeting Title"
          required
          placeholder="e.g. Weekly Sprint Architecture Review"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Day of Week"
            value={String(dayOfWeek)}
            onChange={e => setDayOfWeek(parseInt(e.target.value))}
            options={[
              { value: '1', label: 'Every Monday' },
              { value: '2', label: 'Every Tuesday' },
              { value: '3', label: 'Every Wednesday' },
              { value: '4', label: 'Every Thursday' },
              { value: '5', label: 'Every Friday' },
            ]}
          />

          <Select
            label="Target Department Scope"
            value={departmentScope}
            onChange={e => setDepartmentScope(e.target.value)}
            options={[
              { value: 'All Organization', label: 'All Organization' },
              { value: 'Software Engineering', label: 'Software Engineering' },
              { value: 'Product Design', label: 'Product Design' },
              { value: 'Quality Engineering', label: 'Quality Engineering' },
              { value: 'Infrastructure & SRE', label: 'Infrastructure & SRE' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time"
            required
            placeholder="10:00 AM"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />

          <Input
            label="End Time"
            required
            placeholder="11:00 AM"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>

        <Input
          label="Location / Virtual Join Link"
          required
          placeholder="meet.genkit.io/team-sync • Room 4B"
          value={locationOrLink}
          onChange={e => setLocationOrLink(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Meeting Agenda / Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Key discussion topics, demo goals, and expectations..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={e => setIsMandatory(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mandatory Meeting (Unexcused absences affect compliance score)
            </span>
          </label>
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
