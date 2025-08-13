// Authentication API functions
import { apiRequest } from './base';
import { User } from '../../types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface LoginErrorResponse {
  success: false;
  message: string;
  errors: {
    email?: string[];
    password?: string[];
    [key: string]: string[] | undefined;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const authAPI = {
  // Login user
  login: (credentials: LoginCredentials) =>
    apiRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // Logout user
  logout: () =>
    apiRequest<LogoutResponse>('/logout', { method: 'POST' }),
};
