import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EmailOutboxDrawer } from '../notifications/EmailOutboxDrawer';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return isAdmin ? 'Admin Management Dashboard' : 'Employee Attendance Dashboard';
      case '/attendance':
        return 'Today Punch & Active Work Session';
      case '/attendance-logs':
        return isAdmin ? 'Organisation Attendance History' : 'Personal Attendance History';
      case '/meetings':
        return 'Weekly Team Meetings & Standup Syncs';
      case '/leave':
        return isAdmin ? 'Leave Management & Approvals' : 'My Leave Applications & Balance';
      case '/corrections':
        return isAdmin ? 'Correction Requests & Audit Trail' : 'Attendance Corrections & Logs';
      case '/employees':
        return 'Employee Directory & Account Governance';
      case '/holidays':
        return 'Calendar Holidays & Working Policy';
      case '/settings':
        return 'Attendance Rules & Automation Settings';
      case '/profile':
        return 'Employee Profile & Contact Details';
      default:
        return 'Attendance Tracker';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(prev => !prev)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in transition-all">
          {children}
        </main>
      </div>

      {/* Slide-out Email Inspector (MVP F03) */}
      <EmailOutboxDrawer />
    </div>
  );
};
