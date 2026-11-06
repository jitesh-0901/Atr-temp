export type EmailEventType =
  | 'ACCOUNT_CREATED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_CANCELLED'
  | 'CORRECTION_APPROVED'
  | 'CORRECTION_REJECTED'
  | 'ADMIN_DIRECT_EDIT'
  | 'AUTO_ABSENT_MARKED'
  | 'PASSWORD_RESET';

export interface EmailNotification {
  id: string;
  eventType: EmailEventType;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyText: string;
  status: 'SENT' | 'QUEUED' | 'FAILED';
  attemptCount: number;
  sentAt: string;
  relatedObjectType?: string;
  relatedObjectId?: string;
}
