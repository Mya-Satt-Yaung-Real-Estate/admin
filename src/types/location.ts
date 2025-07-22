import { BaseEntityWithNumberId, EntityStatus, SelectOption } from './index';

export interface Region extends BaseEntityWithNumberId {
  name: string;
  description: string;
  status: EntityStatus;
  townships: Township[];
}

export interface Township extends BaseEntityWithNumberId {
  name: string;
  regionId: number;
  description: string;
  status: EntityStatus;
}

export interface RegionFormData {
  name: string;
  description: string;
  status: EntityStatus;
}

export interface TownshipFormData {
  name: string;
  regionId: number;
  description: string;
  status: EntityStatus;
}

export interface LocationFilters {
  searchTerm: string;
  statusFilter: string;
}

export const LOCATION_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]; 