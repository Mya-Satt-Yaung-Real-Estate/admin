import { Permission, PermissionCategory, EntityStatus } from '../types';

export const mockPermissions: Permission[] = [
  {
    id: 1,
    name: 'manage users',
    description: 'Create, edit, and delete user accounts',
    category: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'manage roles',
    description: 'Create, edit, and delete user roles',
    category: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 3,
    name: 'manage permissions',
    description: 'Create, edit, and delete system permissions',
    category: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 4,
    name: 'manage admins',
    description: 'Create, edit, and delete admin accounts',
    category: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 5,
    name: 'view analytics',
    description: 'Access to analytics and reporting data',
    category: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 6,
    name: 'edit content',
    description: 'Edit system content and configurations',
    category: 'edit',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 7,
    name: 'view reports',
    description: 'Access to system reports',
    category: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 8,
    name: 'moderate content',
    description: 'Moderate user-generated content',
    category: 'edit',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 9,
    name: 'export data',
    description: 'Export system data to external formats',
    category: 'other',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 10,
    name: 'manage content',
    description: 'Create, edit, and delete system content',
    category: 'manage',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 11,
    name: 'approve content',
    description: 'Approve or reject content submissions',
    category: 'edit',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 12,
    name: 'view users',
    description: 'View user account information',
    category: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 13,
    name: 'view content',
    description: 'View system content',
    category: 'view',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 14,
    name: 'system backup',
    description: 'Create and manage system backups',
    category: 'other',
    status: 'inactive',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-10',
  },
  {
    id: 15,
    name: 'api access',
    description: 'Access to system API endpoints',
    category: 'other',
    status: 'active',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
  },
];

// Helper functions
export const getActivePermissions = (): Permission[] => {
  return mockPermissions.filter(permission => permission.status === 'active');
};

export const getInactivePermissions = (): Permission[] => {
  return mockPermissions.filter(permission => permission.status === 'inactive');
};

export const getPermissionsByStatus = (status: EntityStatus): Permission[] => {
  return mockPermissions.filter(permission => permission.status === status);
};

export const getPermissionsByCategory = (category: PermissionCategory): Permission[] => {
  return mockPermissions.filter(permission => permission.category === category);
};

export const searchPermissions = (searchTerm: string): Permission[] => {
  const term = searchTerm.toLowerCase();
  return mockPermissions.filter(permission =>
    permission.name.toLowerCase().includes(term) ||
    permission.description.toLowerCase().includes(term) ||
    permission.category.toLowerCase().includes(term)
  );
};

export const getPermissionById = (id: number): Permission | undefined => {
  return mockPermissions.find(permission => permission.id === id);
};

export const getPermissionByName = (name: string): Permission | undefined => {
  return mockPermissions.find(permission => permission.name === name);
};

export const getPermissionStats = () => {
  return {
    totalPermissions: mockPermissions.length,
    activePermissions: getActivePermissions().length,
    inactivePermissions: getInactivePermissions().length,
    managePermissions: getPermissionsByCategory('manage').length,
    viewPermissions: getPermissionsByCategory('view').length,
    editPermissions: getPermissionsByCategory('edit').length,
    otherPermissions: getPermissionsByCategory('other').length,
  };
}; 