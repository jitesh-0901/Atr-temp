import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Mail, X, RefreshCw, CheckCircle2, Clock, Trash2, ArrowUpRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatTime, formatDate } from '../../utils/dateUtils';
import { EmailNotification } from '../../types/notification';

export const EmailOutboxDrawer: React.FC = () => {
  const {
    notifications,
    isOutboxOpen,
    closeOutbox,
    retryNotification,
    clearNotifications,
  } = useNotification();

  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  if (!isOutboxOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeOutbox}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Email Dispatch Outbox
                  <Badge variant="info" size="sm">
                    {notifications.length}
                  </Badge>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  MVP F03 Asynchronous Email Delivery Log
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                  title="Clear outbox history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeOutbox}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No emails dispatched yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Perform attendance punches, leave submissions/approvals, or trigger the automated absence engine to see email alerts recorded here.
                </p>
              </div>
            ) : selectedEmail ? (
              /* Email Detail Inspector */
              <div className="p-5 space-y-4">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 mb-2"
                >
                  &larr; Back to all emails
                </button>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Event:</span>
                    <Badge variant="neutral" size="sm">
                      {selectedEmail.eventType}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">To:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                      {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Dispatched:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatDate(selectedEmail.sentAt.split('T')[0])} at{' '}
                      {formatTime(selectedEmail.sentAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <Badge variant="success" size="sm" dot>
                      {selectedEmail.status} (Attempts: {selectedEmail.attemptCount})
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Subject Line
                  </label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    {selectedEmail.subject}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Email Body Content
                  </label>
                  <pre className="text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap p-3.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 leading-relaxed font-mono">
                    {selectedEmail.bodyText}
                  </pre>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => retryNotification(selectedEmail.id)}
                  >
                    Simulate Async Celery Retry
                  </Button>
                </div>
              </div>
            ) : (
              /* List of all emails */
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedEmail(n)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {n.recipientName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(n.sentAt)}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-1">
                      {n.subject}
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                      {n.bodyText}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dispatched to {n.recipientEmail}</span>
                      </div>
                      <span className="text-brand-600 dark:text-brand-400 flex items-center text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Per ATR Spec 2.1 F03: Notifications are email-only. No in-app alert banners.
          </div>
        </div>
      </div>
    </div>
  );
};
