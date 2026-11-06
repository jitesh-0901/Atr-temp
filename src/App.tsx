import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { LeaveProvider } from './context/LeaveContext';
import { CorrectionProvider } from './context/CorrectionContext';
import { SettingsProvider } from './context/SettingsContext';
import { MeetingProvider } from './context/MeetingContext';

import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { AttendanceLogsPage } from './pages/AttendanceLogsPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { LeaveRequestsPage } from './pages/LeaveRequestsPage';
import { CorrectionsPage } from './pages/CorrectionsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { HolidaysPage } from './pages/HolidaysPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

const AuthenticatedRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance-logs" element={<AttendanceLogsPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/leave" element={<LeaveRequestsPage />} />
        <Route path="/corrections" element={<CorrectionsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/holidays" element={<HolidaysPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <AttendanceProvider>
              <LeaveProvider>
                <CorrectionProvider>
                  <SettingsProvider>
                    <MeetingProvider>
                      <AuthenticatedRoutes />
                    </MeetingProvider>
                  </SettingsProvider>
                </CorrectionProvider>
              </LeaveProvider>
            </AttendanceProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
