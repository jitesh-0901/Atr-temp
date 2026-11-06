import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types/auth';
import { initialEmployees } from '../mock/mockEmployees';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  createEmployee: (data: Omit<User, 'id' | 'createdAt' | 'isActive'> & { tempPassword?: string }) => { success: boolean; user?: User; error?: string };
  updateEmployee: (id: string, data: Partial<User>) => void;
  toggleEmployeeActive: (id: string) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    return loadFromStorage<User[]>('users', initialEmployees);
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    // Default to Priya Sharma (USER) or Admin for easy testing
    const saved = loadFromStorage<string | null>('current_user_id', 'usr_emp_1');
    return saved;
  });

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || null;

  const login = (email: string, _password?: string): { success: boolean; error?: string } => {
    const normalized = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === normalized);

    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (!found.isActive) {
      return {
        success: false,
        error: 'This account has been deactivated by the Administrator. Please contact HR.',
      };
    }

    setCurrentUserId(found.id);
    saveToStorage('current_user_id', found.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    saveToStorage('current_user_id', null);
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target && target.isActive) {
      setCurrentUserId(target.id);
      saveToStorage('current_user_id', target.id);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    // Disallow employee from modifying role, employeeId, isActive
    const safeUpdates: Partial<User> = {
      phone: updates.phone,
      address: updates.address,
      emergencyContact: updates.emergencyContact,
      bio: updates.bio,
      name: updates.name || currentUser.name,
    };

    setUsers(prev => {
      const updated = prev.map(u => (u.id === currentUser.id ? { ...u, ...safeUpdates } : u));
      saveToStorage('users', updated);
      return updated;
    });
  };

  const createEmployee = (
    data: Omit<User, 'id' | 'createdAt' | 'isActive'> & { tempPassword?: string }
  ): { success: boolean; user?: User; error?: string } => {
    // Check if duplicate email
    const duplicate = users.find(u => u.email.toLowerCase() === data.email.toLowerCase().trim());
    if (duplicate) {
      return { success: false, error: 'An employee with this email already exists.' };
    }

    const newEmp: User = {
      id: `usr_emp_${Date.now()}`,
      email: data.email.trim(),
      name: data.name.trim(),
      role: (data.role || 'USER') as UserRole,
      employeeId: data.employeeId.trim(),
      department: data.department.trim(),
      jobTitle: data.jobTitle.trim(),
      phone: data.phone,
      address: data.address,
      emergencyContact: data.emergencyContact,
      bio: data.bio,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => {
      const updated = [...prev, newEmp];
      saveToStorage('users', updated);
      return updated;
    });

    return { success: true, user: newEmp };
  };

  const updateEmployee = (id: string, data: Partial<User>) => {
    setUsers(prev => {
      const updated = prev.map(u => (u.id === id ? { ...u, ...data } : u));
      saveToStorage('users', updated);
      return updated;
    });
  };

  const toggleEmployeeActive = (id: string) => {
    setUsers(prev => {
      const updated = prev.map(u => (u.id === id ? { ...u, ...dataActiveToggle(u) } : u));
      saveToStorage('users', updated);
      return updated;
    });
  };

  function dataActiveToggle(u: User) {
    return { isActive: !u.isActive };
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUser,
        updateProfile,
        createEmployee,
        updateEmployee,
        toggleEmployeeActive,
        isAdmin: currentUser?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
