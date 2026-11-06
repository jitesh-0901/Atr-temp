import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { formatDate } from '../utils/dateUtils';
import { UserCheck, Save, CheckCircle2, Lock } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, isAdmin } = useAuth();

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.emergencyContact || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setEmergencyContact(currentUser.emergencyContact || '');
      setBio(currentUser.bio || '');
      setName(currentUser.name || '');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      address,
      emergencyContact,
      bio,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Employee Profile & Account Information (MVP F08)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View your administrative corporate details and update permitted contact fields.
        </p>
      </div>

      {/* Account Overview Header Card */}
      <Card className="p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {currentUser.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {currentUser.name}
                </h4>
                <Badge variant={isAdmin ? 'info' : 'neutral'} size="sm">
                  {currentUser.role}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {currentUser.jobTitle} • {currentUser.department}
              </p>
              <p className="text-xs font-mono text-slate-400 mt-1">
                ID: {currentUser.employeeId} • Joined {formatDate(currentUser.createdAt.split('T')[0])}
              </p>
            </div>
          </div>

          <Badge variant="success" size="md" dot>
            Account Active & Verified
          </Badge>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="shadow-2xs">
        <CardHeader>
          <CardTitle className="text-sm">Personal & Emergency Contact Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Read-Only Administrative Fields */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <Lock className="w-3 h-3 text-slate-400" />
                Administrative Invariant Fields (Managed by Admin)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Corporate Email:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {currentUser.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.department}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">System Role:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Display Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <Input
                label="Mobile / Contact Number"
                placeholder="+91 98400 12345"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Person & Number"
                placeholder="e.g. S. Kumar (+91 98401 99999)"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
              />

              <Input
                label="Residential Address"
                placeholder="City, District, State"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Professional Bio / Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Brief summary of your roles and focus..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Changes persist to your browser's local state.
              </span>

              <div className="flex items-center gap-2">
                {saved && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Profile Updated!
                  </span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
