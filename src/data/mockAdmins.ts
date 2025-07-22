import { Admin, AdminRole, EntityStatus } from '../types';

export const mockAdmins: Admin[] = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'super_admin',
    status: 'active',
    avatar: 'SA',
    lastLogin: '2024-01-15 10:30',
    createdAt: '2023-01-01',
    updatedAt: '2024-01-15',
    permissions: ['manage users', 'manage roles', 'manage permissions', 'manage admins', 'view analytics'],
    phone: '+1 (555) 111-1111',
    department: 'IT',
  },
  {
    id: 2,
    name: 'John Admin',
    email: 'john.admin@example.com',
    role: 'admin',
    status: 'active',
    avatar: 'JA',
    lastLogin: '2024-01-14 15:45',
    createdAt: '2023-03-12',
    updatedAt: '2024-01-14',
    permissions: ['manage users', 'view analytics'],
    phone: '+1 (555) 222-2222',
    department: 'Operations',
  },
  {
    id: 3,
    name: 'Sarah Moderator',
    email: 'sarah.moderator@example.com',
    role: 'moderator',
    status: 'active',
    avatar: 'SM',
    lastLogin: '2024-01-13 12:20',
    createdAt: '2023-05-20',
    updatedAt: '2024-01-13',
    permissions: ['moderate content', 'view reports'],
    phone: '+1 (555) 333-3333',
    department: 'Content',
  },
  {
    id: 4,
    name: 'Mike Manager',
    email: 'mike.manager@example.com',
    role: 'admin',
    status: 'inactive',
    avatar: 'MM',
    lastLogin: '2024-01-10 09:15',
    createdAt: '2023-06-15',
    updatedAt: '2024-01-10',
    permissions: ['manage content', 'approve content', 'view reports'],
    phone: '+1 (555) 444-4444',
    department: 'Marketing',
  },
  {
    id: 5,
    name: 'Lisa Support',
    email: 'lisa.support@example.com',
    role: 'moderator',
    status: 'active',
    avatar: 'LS',
    lastLogin: '2024-01-14 16:30',
    createdAt: '2023-07-22',
    updatedAt: '2024-01-14',
    permissions: ['view users', 'view reports'],
    phone: '+1 (555) 555-5555',
    department: 'Support',
  },
];

// Helper functions
export const getActiveAdmins = (): Admin[] => {
  return mockAdmins.filter(admin => admin.status === 'active');
};

export const getInactiveAdmins = (): Admin[] => {
  return mockAdmins.filter(admin => admin.status === 'inactive');
};

export const getAdminsByRole = (role: AdminRole): Admin[] => {
  return mockAdmins.filter(admin => admin.role === role);
};

export const getAdminsByStatus = (status: EntityStatus): Admin[] => {
  return mockAdmins.filter(admin => admin.status === status);
};

export const searchAdmins = (searchTerm: string): Admin[] => {
  const term = searchTerm.toLowerCase();
  return mockAdmins.filter(admin =>
    admin.name.toLowerCase().includes(term) ||
    admin.email.toLowerCase().includes(term) ||
    admin.department?.toLowerCase().includes(term) ||
    admin.permissions.some(permission => permission.toLowerCase().includes(term))
  );
};

export const getAdminById = (id: number): Admin | undefined => {
  return mockAdmins.find(admin => admin.id === id);
};

export const getAdminStats = () => {
  return {
    totalAdmins: mockAdmins.length,
    activeAdmins: getActiveAdmins().length,
    inactiveAdmins: getInactiveAdmins().length,
    superAdmins: getAdminsByRole('super_admin').length,
    admins: getAdminsByRole('admin').length,
    moderators: getAdminsByRole('moderator').length,
  };
}; 