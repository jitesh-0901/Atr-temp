import React, { createContext, useContext, useState } from 'react';
import { EmailNotification, EmailEventType } from '../types/notification';
import { initialNotifications } from '../mock/mockNotifications';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface NotificationContextType {
  notifications: EmailNotification[];
  isOutboxOpen: boolean;
  toggleOutbox: () => void;
  openOutbox: () => void;
  closeOutbox: () => void;
  sendEmailNotification: (params: {
    eventType: EmailEventType;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    bodyText: string;
    relatedObjectType?: string;
    relatedObjectId?: string;
  }) => EmailNotification;
  retryNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<EmailNotification[]>(() => {
    return loadFromStorage<EmailNotification[]>('notifications', initialNotifications);
  });
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);

  const sendEmailNotification = (params: {
    eventType: EmailEventType;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    bodyText: string;
    relatedObjectType?: string;
    relatedObjectId?: string;
  }): EmailNotification => {
    const newEmail: EmailNotification = {
      id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventType: params.eventType,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      subject: params.subject,
      bodyText: params.bodyText,
      status: 'SENT',
      attemptCount: 1,
      sentAt: new Date().toISOString(),
      relatedObjectType: params.relatedObjectType,
      relatedObjectId: params.relatedObjectId,
    };

    setNotifications(prev => {
      const updated = [newEmail, ...prev];
      saveToStorage('notifications', updated);
      return updated;
    });

    return newEmail;
  };

  const retryNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            status: 'SENT' as const,
            attemptCount: n.attemptCount + 1,
            sentAt: new Date().toISOString(),
          };
        }
        return n;
      });
      saveToStorage('notifications', updated);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveToStorage('notifications', []);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isOutboxOpen,
        toggleOutbox: () => setIsOutboxOpen(prev => !prev),
        openOutbox: () => setIsOutboxOpen(true),
        closeOutbox: () => setIsOutboxOpen(false),
        sendEmailNotification,
        retryNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
