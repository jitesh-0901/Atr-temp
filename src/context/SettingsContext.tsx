import React, { createContext, useContext, useState } from 'react';
import { Holiday } from '../types/holiday';
import { WorkingCalendarSettings } from '../types/settings';
import { initialHolidays } from '../mock/mockHolidays';
import { initialSettings } from '../mock/mockSettings';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { User } from '../types/auth';
import { useCorrection } from './CorrectionContext';

interface SettingsContextType {
  holidays: Holiday[];
  settings: WorkingCalendarSettings;
  addHoliday: (
    holidayData: Omit<Holiday, 'id' | 'createdAt'>,
    adminUser: User
  ) => { success: boolean; error?: string };
  updateHoliday: (id: string, holidayData: Partial<Holiday>, adminUser: User) => void;
  deleteHoliday: (id: string, adminUser: User) => void;
  toggleHolidayStatus: (id: string) => void;
  updateSettings: (newSettings: Partial<WorkingCalendarSettings>, adminUser: User) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    return loadFromStorage<Holiday[]>('holidays', initialHolidays);
  });

  const [settings, setSettings] = useState<WorkingCalendarSettings>(() => {
    return loadFromStorage<WorkingCalendarSettings>('settings', initialSettings);
  });

  const { addAuditLog } = useCorrection();

  const addHoliday = (
    holidayData: Omit<Holiday, 'id' | 'createdAt'>,
    adminUser: User
  ): { success: boolean; error?: string } => {
    // Uniqueness rule for active holiday dates (Per F09 spec)
    const existing = holidays.find(h => h.date === holidayData.date && h.isActive);
    if (existing) {
      return {
        success: false,
        error: `A holiday (${existing.name}) is already scheduled for ${holidayData.date}.`,
      };
    }

    const newHoliday: Holiday = {
      id: `hol_${Date.now()}`,
      ...holidayData,
      createdAt: new Date().toISOString(),
    };

    setHolidays(prev => {
      const updated = [...prev, newHoliday].sort((a, b) => a.date.localeCompare(b.date));
      saveToStorage('holidays', updated);
      return updated;
    });

    addAuditLog({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: 'HOLIDAY_CREATED',
      objectType: 'HOLIDAY',
      objectId: newHoliday.id,
      reason: `Added holiday: ${newHoliday.name} on ${newHoliday.date}`,
      afterValue: JSON.stringify({ name: newHoliday.name, date: newHoliday.date }),
    });

    return { success: true };
  };

  const updateHoliday = (id: string, holidayData: Partial<Holiday>, adminUser: User) => {
    setHolidays(prev => {
      const updated = prev.map(h => (h.id === id ? { ...h, ...holidayData } : h));
      saveToStorage('holidays', updated);
      return updated;
    });

    addAuditLog({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: 'HOLIDAY_UPDATED',
      objectType: 'HOLIDAY',
      objectId: id,
      reason: 'Admin updated holiday parameters',
    });
  };

  const deleteHoliday = (id: string, adminUser: User) => {
    const target = holidays.find(h => h.id === id);
    setHolidays(prev => {
      const updated = prev.filter(h => h.id !== id);
      saveToStorage('holidays', updated);
      return updated;
    });

    if (target) {
      addAuditLog({
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: 'HOLIDAY_UPDATED',
        objectType: 'HOLIDAY',
        objectId: id,
        reason: `Removed holiday: ${target.name} (${target.date})`,
      });
    }
  };

  const toggleHolidayStatus = (id: string) => {
    setHolidays(prev => {
      const updated = prev.map(h => (h.id === id ? { ...h, isActive: !h.isActive } : h));
      saveToStorage('holidays', updated);
      return updated;
    });
  };

  const updateSettings = (newSettings: Partial<WorkingCalendarSettings>, adminUser: User) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveToStorage('settings', updated);
      return updated;
    });

    addAuditLog({
      actorId: adminUser.id,
      actorName: adminUser.name,
      actorRole: 'ADMIN',
      action: 'SETTINGS_UPDATED',
      objectType: 'SETTINGS',
      objectId: 'org_settings',
      reason: 'Admin updated working calendar or attendance deadline configuration',
      afterValue: JSON.stringify(newSettings),
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        holidays,
        settings,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        toggleHolidayStatus,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
