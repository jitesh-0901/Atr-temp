export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId: string;
  department: string;
  jobTitle: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
