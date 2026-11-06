import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AtrLogo } from './AtrLogo';
import {
  LayoutDashboard,
  Clock,
  CalendarCheck,
  CalendarDays,
  FileCheck2,
  Users,
  Settings,
  Calendar,
  UserCheck,
  ShieldCheck,
  X,
  LogOut,
  ChevronRight,
  Video,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = () => {
    onCloseMobile();
  };

  const employeeNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/attendance', label: 'Today Punch', icon: Clock },
    { path: '/attendance-logs', label: 'Attendance History', icon: CalendarCheck },
    { path: '/meetings', label: 'Weekly Meetings', icon: Video },
    { path: '/leave', label: 'Leave Requests', icon: CalendarDays },
    { path: '/corrections', label: 'Corrections & Audit', icon: FileCheck2 },
    { path: '/holidays', label: 'Holidays Calendar', icon: Calendar },
    { path: '/profile', label: 'My Profile', icon: UserCheck },
  ];

  const adminNavItems = [
    { path: '/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { path: '/attendance', label: 'Today Punch', icon: Clock },
    { path: '/attendance-logs', label: 'All Attendance', icon: CalendarCheck },
    { path: '/meetings', label: 'Weekly Meetings', icon: Video },
    { path: '/leave', label: 'Leave Queue', icon: CalendarDays },
    { path: '/corrections', label: 'Corrections & Audit', icon: FileCheck2 },
    { path: '/employees', label: 'Employee Directory', icon: Users },
    { path: '/holidays', label: 'Holiday Management', icon: Calendar },
    { path: '/settings', label: 'Rules & Automation', icon: Settings },
    { path: '/profile', label: 'Admin Profile', icon: ShieldCheck },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* 1. Brand Header with Custom ATR Logo */}
        <div className="h-16 px-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <AtrLogo />
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Navigation List (Scrollable Main Section) */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 mb-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {isAdmin ? 'Administration' : 'Self Service'}
            </p>
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold translate-x-0.5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-brand-50/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-brand-600 dark:text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* 3. User Profile Section - POSITIONED AT THE BOTTOM */}
        {currentUser && (
          <div className="p-3 mx-3 my-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 shadow-2xs shrink-0 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  navigate('/profile');
                  handleNavClick();
                }}
                className="flex items-center gap-2.5 min-w-0 text-left group flex-1"
                title="View your profile"
              >
                <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-brand-600/30 ring-2 ring-brand-500/20 group-hover:scale-105 transition-transform">
                  {currentUser.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-brand-700 dark:text-brand-400 font-mono">
                      {currentUser.employeeId}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 4. Bottom System Status Bar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ATR Attendance Engine
                </span>
              </span>
              <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                v1.0-MVP
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
