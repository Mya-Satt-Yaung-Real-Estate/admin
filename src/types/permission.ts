import { BaseEntityWithNumberId, EntityStatus, SelectOption } from './index';

export interface Permission extends BaseEntityWithNumberId {
  name: string;
  description: string;
  category: PermissionCategory;
  status: EntityStatus;
}

export type PermissionCategory = 'manage' | 'view' | 'edit' | 'other';

export interface PermissionFormData {
  name: string;
  description: string;
  category: PermissionCategory;
  status: EntityStatus;
}

export interface PermissionFilters {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
}

export const PERMISSION_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'manage', label: 'Manage' },
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
  { value: 'other', label: 'Other' },
];

export const PERMISSION_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]; 