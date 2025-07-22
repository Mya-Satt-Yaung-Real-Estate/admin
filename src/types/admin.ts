export interface Admin {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export interface AdminFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  status: 'active' | 'inactive';
  password?: string;
  confirmPassword?: string;
}

export interface AdminFilters {
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
} 