import { BaseEntityWithNumberId, EntityStatus, SelectOption } from './index';

export interface Role extends BaseEntityWithNumberId {
  name: string;
  permissions: string[];
  status: EntityStatus;
  description?: string;
}

export interface RoleFormData {
  name: string;
  permissions: string[];
  status: EntityStatus;
  description?: string;
}

export interface RoleFilters {
  searchTerm: string;
  statusFilter: string;
}

export const ROLE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]; 