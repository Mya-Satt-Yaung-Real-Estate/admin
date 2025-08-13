import { Role } from './index';

// Permission Types based on API Documentation
export interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
  description?: string;
  is_active: boolean;
  roles?: Role[];
}

export interface CreatePermissionData {
  name: string;
  module: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePermissionData {
  name?: string;
  module?: string;
  description?: string;
  is_active?: boolean;
}

export interface PermissionFilters {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
} 