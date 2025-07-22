import { Role } from '../types/role';

export const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    status: 'active',
    createdAt: '2023-01-01',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    adminCount: 1
  },
  {
    id: 2,
    name: 'System Manager',
    description: 'Manages system configuration and user administration',
    status: 'active',
    createdAt: '2023-01-15',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    adminCount: 2
  },
  {
    id: 3,
    name: 'Content Supervisor',
    description: 'Supervises content creation and moderation',
    status: 'active',
    createdAt: '2023-02-01',
    permissions: [3, 4, 5, 6, 7, 8, 9, 10],
    adminCount: 1
  },
  {
    id: 4,
    name: 'Data Operator',
    description: 'Handles data entry and basic operations',
    status: 'active',
    createdAt: '2023-02-15',
    permissions: [3, 4, 5, 6, 7, 8],
    adminCount: 1
  },
  {
    id: 5,
    name: 'Viewer',
    description: 'Read-only access to system data',
    status: 'active',
    createdAt: '2023-03-01',
    permissions: [3, 4, 5, 6],
    adminCount: 1
  },
  {
    id: 6,
    name: 'Inactive Role',
    description: 'This role is no longer in use',
    status: 'inactive',
    createdAt: '2023-03-15',
    permissions: [3, 4],
    adminCount: 0
  }
];

// Helper function to get role by ID
export const getRoleById = (id: number) => mockRoles.find(role => role.id === id);

// Helper function to get active roles only
export const getActiveRoles = () => mockRoles.filter(role => role.status === 'active');

// Helper function to get roles by permission
export const getRolesByPermission = (permissionId: number) => 
  mockRoles.filter(role => role.permissions.includes(permissionId)); 