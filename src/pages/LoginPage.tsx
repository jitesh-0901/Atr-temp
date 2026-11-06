import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { AtrLogo } from '../components/layout/AtrLogo';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LogIn, KeyRound, ShieldCheck, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { sendEmailNotification } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('priya.s@genkit.io');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    } else {
      navigate('/dashboard');
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password@123');
    setError(null);
    const res = login(userEmail, 'Password@123');
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    sendEmailNotification({
      eventType: 'PASSWORD_RESET',
      recipientEmail: resetEmail.trim(),
      recipientName: 'Valued Employee',
      subject: '[ATR Security] Password Reset Instructions',
      bodyText: `Hello,\n\nA password reset request was initiated for your ATR account (${resetEmail.trim()}).\n\nIf you requested this, click here to set a new password: https://atr.genkit.io/auth/reset?token=exp_${Date.now()}\n\nThis token will expire in 15 minutes.`,
    });

    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setIsForgotModalOpen(false);
      setResetEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in">
        <div className="flex justify-center mb-3">
          <AtrLogo size="lg" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Attendance Tracker (ATR)
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enterprise Workforce Attendance & Leave Governance System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 animate-slide-up">
        <Card className="shadow-xl border-slate-200/90 dark:border-slate-800 transition-all hover:shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <Input
                label="Corporate Email Address"
                type="email"
                required
                placeholder="name@genkit.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  leftIcon={<KeyRound className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full text-sm font-semibold shadow-sm"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Sign In to Workstation
              </Button>
            </form>

            {/* Quick-test evaluation pills */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                Evaluation Quick Sign-In
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@genkit.io')}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Hari Krishna</span>
                  </div>
                  <Badge variant="info" size="sm" className="mt-1">
                    ADMIN
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('priya.s@genkit.io')}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Priya Sharma</span>
                  </div>
                  <Badge variant="neutral" size="sm" className="mt-1">
                    EMPLOYEE
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('rahul.v@genkit.io')}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Rahul Verma</span>
                  </div>
                  <Badge variant="neutral" size="sm" className="mt-1">
                    EMPLOYEE
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('deepa.s@genkit.io')}
                  className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 text-left transition-colors"
                  title="Test deactivation authentication rejection rule (MVP F01)"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
                    <span>Deepa S.</span>
                  </div>
                  <Badge variant="danger" size="sm" className="mt-1">
                    DEACTIVATED
                  </Badge>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Reset Modal (F01 spec) */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Account Password"
        description="Enter your registered corporate email to receive a secure reset link."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePasswordReset}
            >
              Send Reset Link
            </Button>
          </div>
        }
      >
        <form onSubmit={handlePasswordReset} className="space-y-3 text-xs">
          <Input
            label="Corporate Email"
            type="email"
            required
            placeholder="your.name@genkit.io"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
          />

          {resetSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password reset instructions dispatched to your email!</span>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
