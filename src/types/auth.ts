// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
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
  rememberMe: boolean;
}

// API Response Types
export interface LoginResponse {
  user: User;
  token: string;
  message?: string;
} 