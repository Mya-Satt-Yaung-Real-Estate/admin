export interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
  action: string;
  status: 'active' | 'inactive';
  createdAt: string;
  roleCount: number;
}

export interface PermissionFormData {
  name: string;
  description: string;
  module: string;
  action: string;
  status: 'active' | 'inactive';
}

export interface PermissionFilters {
  searchTerm: string;
  statusFilter: string;
  moduleFilter: string;
} 