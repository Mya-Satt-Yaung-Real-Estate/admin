import { Role, EntityStatus } from '../types';

export const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Super Admin',
    permissions: ['manage users', 'manage roles', 'manage permissions', 'manage admins', 'view analytics'],
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    description: 'Full system access with all permissions',
  },
  {
    id: 2,
    name: 'Admin',
    permissions: ['manage users', 'view analytics'],
    status: 'active',
    createdAt: '2023-03-12',
    updatedAt: '2024-01-14',
    description: 'Administrative access with user management capabilities',
  },
  {
    id: 3,
    name: 'Editor',
    permissions: ['edit content', 'view reports'],
    status: 'active',
    createdAt: '2023-05-20',
    updatedAt: '2024-01-13',
    description: 'Content editing and report viewing permissions',
  },
  {
    id: 4,
    name: 'Viewer',
    permissions: ['view content', 'view reports'],
    status: 'active',
    createdAt: '2023-06-15',
    updatedAt: '2024-01-12',
    description: 'Read-only access to content and reports',
  },
  {
    id: 5,
    name: 'Moderator',
    permissions: ['moderate content', 'view reports'],
    status: 'inactive',
    createdAt: '2023-07-22',
    updatedAt: '2024-01-10',
    description: 'Content moderation and report viewing permissions',
  },
  {
    id: 6,
    name: 'Analyst',
    permissions: ['view analytics', 'export data'],
    status: 'active',
    createdAt: '2023-08-10',
    updatedAt: '2024-01-11',
    description: 'Analytics and data export permissions',
  },
  {
    id: 7,
    name: 'Manager',
    permissions: ['manage content', 'approve content', 'view reports'],
    status: 'active',
    createdAt: '2023-09-05',
    updatedAt: '2024-01-09',
    description: 'Content management and approval permissions',
  },
  {
    id: 8,
    name: 'Support',
    permissions: ['view users', 'view reports'],
    status: 'active',
    createdAt: '2023-10-18',
    updatedAt: '2024-01-08',
    description: 'Support team permissions for user and report access',
  },
];

// Helper functions
export const getActiveRoles = (): Role[] => {
  return mockRoles.filter(role => role.status === 'active');
};

export const getInactiveRoles = (): Role[] => {
  return mockRoles.filter(role => role.status === 'inactive');
};

export const getRolesByStatus = (status: EntityStatus): Role[] => {
  return mockRoles.filter(role => role.status === status);
};

export const searchRoles = (searchTerm: string): Role[] => {
  const term = searchTerm.toLowerCase();
  return mockRoles.filter(role =>
    role.name.toLowerCase().includes(term) ||
    role.description?.toLowerCase().includes(term) ||
    role.permissions.some(permission => permission.toLowerCase().includes(term))
  );
};

export const getRoleById = (id: number): Role | undefined => {
  return mockRoles.find(role => role.id === id);
};

export const getRolesByPermission = (permission: string): Role[] => {
  return mockRoles.filter(role => role.permissions.includes(permission));
};

export const getRoleStats = () => {
  return {
    totalRoles: mockRoles.length,
    activeRoles: getActiveRoles().length,
    inactiveRoles: getInactiveRoles().length,
    adminRoles: mockRoles.filter(role => role.name.toLowerCase().includes('admin')).length,
    averagePermissions: Math.round(mockRoles.reduce((acc, role) => acc + role.permissions.length, 0) / mockRoles.length),
  };
}; 