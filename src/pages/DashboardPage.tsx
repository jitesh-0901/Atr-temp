import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/admin';
import { EmployeeDashboard } from '../components/dashboard/EmployeeDashboard';

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();

  return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
};

