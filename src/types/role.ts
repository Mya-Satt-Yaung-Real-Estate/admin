import { Permission } from './index';

// Role Types based on API Documentation
export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface CreateRoleData {
  name: string;
  description?: string;
  is_active?: boolean;
  permissions?: number[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  is_active?: boolean;
  permissions?: number[];
}

export interface RoleFilters {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
} 