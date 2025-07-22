import { BaseEntityWithNumberId, EntityStatus, SelectOption } from './index';

export interface Admin extends BaseEntityWithNumberId {
  name: string;
  email: string;
  role: AdminRole;
  status: EntityStatus;
  avatar: string;
  lastLogin: string;
  permissions: string[];
  phone?: string;
  department?: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminFormData {
  name: string;
  email: string;
  role: AdminRole;
  status: EntityStatus;
  avatar: string;
  password?: string;
  confirmPassword?: string;
  permissions: string[];
  phone?: string;
  department?: string;
}

export interface AdminFilters {
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
}

export const ADMIN_ROLE_OPTIONS: SelectOption[] = [
  { value: 'super_admin', label: 'Super Administrator' },
  { value: 'admin', label: 'Administrator' },
  { value: 'moderator', label: 'Moderator' },
];

export const ADMIN_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
]; 