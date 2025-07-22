export interface Role {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  permissions: number[];
  adminCount: number;
}

export interface RoleFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  permissions: number[];
}

export interface RoleFilters {
  searchTerm: string;
  statusFilter: string;
} 