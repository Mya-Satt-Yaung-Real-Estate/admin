import { Role, Permission } from './index';

// Admin User Types based on API Documentation
export interface AdminUser {
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

export interface CreateAdminUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type?: string;
  is_active: boolean;
  role_ids: number[];
  member_level?: string;
}

export interface UpdateAdminUserData {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  user_type?: string;
  is_active?: boolean;
  role_ids?: number[];
  member_level?: string;
}

export interface AdminUserFilters {
  search?: string;
  status?: 'active' | 'inactive';
  sort_by?: 'name' | 'email' | 'created_at' | 'last_login_at';
  sort_direction?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
} 