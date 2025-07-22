import { Permission } from '../types/permission';

export const mockPermissions: Permission[] = [
  {
    id: 1,
    name: 'Manage Admins',
    description: 'Create, edit, and delete admin users',
    module: 'Admin Management',
    action: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 2
  },
  {
    id: 2,
    name: 'Manage Roles',
    description: 'Create, edit, and delete user roles',
    module: 'Role Management',
    action: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 2
  },
  {
    id: 3,
    name: 'View Dashboard',
    description: 'Access to main dashboard',
    module: 'Dashboard',
    action: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 5
  },
  {
    id: 4,
    name: 'View Users',
    description: 'View user information',
    module: 'User Management',
    action: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 5
  },
  {
    id: 5,
    name: 'Manage Users',
    description: 'Create, edit, and delete users',
    module: 'User Management',
    action: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 4
  },
  {
    id: 6,
    name: 'View Analytics',
    description: 'Access to analytics and reports',
    module: 'Analytics',
    action: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 4
  },
  {
    id: 7,
    name: 'Manage Locations',
    description: 'Create, edit, and delete locations',
    module: 'Location Management',
    action: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 4
  },
  {
    id: 8,
    name: 'View Locations',
    description: 'View location information',
    module: 'Location Management',
    action: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 5
  },
  {
    id: 9,
    name: 'Manage Settings',
    description: 'Modify system settings',
    module: 'System Settings',
    action: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 2
  },
  {
    id: 10,
    name: 'View Settings',
    description: 'View system settings',
    module: 'System Settings',
    action: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 4
  },
  {
    id: 11,
    name: 'Manage Permissions',
    description: 'Create, edit, and delete permissions',
    module: 'Permission Management',
    action: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 2
  },
  {
    id: 12,
    name: 'View Permissions',
    description: 'View permission information',
    module: 'Permission Management',
    action: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 2
  },
  {
    id: 13,
    name: 'Export Data',
    description: 'Export data to various formats',
    module: 'Data Export',
    action: 'export',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 2
  },
  {
    id: 14,
    name: 'System Backup',
    description: 'Create and manage system backups',
    module: 'System Maintenance',
    action: 'backup',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 1
  },
  {
    id: 15,
    name: 'System Restore',
    description: 'Restore system from backups',
    module: 'System Maintenance',
    action: 'restore',
    status: 'active',
    createdAt: '2023-01-01',
    roleCount: 1
  }
];

// Helper function to get permission by ID
export const getPermissionById = (id: number) => mockPermissions.find(permission => permission.id === id);

// Helper function to get active permissions only
export const getActivePermissions = () => mockPermissions.filter(permission => permission.status === 'active');

// Helper function to get permissions by module
export const getPermissionsByModule = (module: string) => 
  mockPermissions.filter(permission => permission.module === module);

// Helper function to get unique modules
export const getUniqueModules = () => 
  [...new Set(mockPermissions.map(permission => permission.module))]; 