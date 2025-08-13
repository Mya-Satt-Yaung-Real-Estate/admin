import { Role, Permission } from './index';

// Authentication Types based on API Documentation
export interface User {
  id: number;
  name: string;
  slug: string;
  email: string;
  user_type: string;
  member_level: string;
  is_active: boolean;
  last_login_at?: string;
  last_active_at?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  roles?: Role[];
  permissions?: Permission[];
}

// Authentication State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export type AuthStore = AuthState & AuthActions;

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// API Response Types
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  data: null;
}

// Login Credentials for API
export interface LoginCredentials {
  email: string;
  password: string;
} 