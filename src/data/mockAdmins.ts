import { Admin } from '../types/admin';

export const mockAdmins: Admin[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'System',
    lastName: 'Administrator',
    roleId: 1,
    status: 'active',
    createdAt: '2023-01-01',
    lastLogin: '2024-01-15T10:30:00Z',
    avatar: '/avatars/admin.jpg'
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@example.com',
    firstName: 'John',
    lastName: 'Manager',
    roleId: 2,
    status: 'active',
    createdAt: '2023-02-15',
    lastLogin: '2024-01-14T15:45:00Z',
    avatar: '/avatars/manager.jpg'
  },
  {
    id: 3,
    username: 'supervisor',
    email: 'supervisor@example.com',
    firstName: 'Sarah',
    lastName: 'Supervisor',
    roleId: 3,
    status: 'active',
    createdAt: '2023-03-20',
    lastLogin: '2024-01-13T09:15:00Z',
    avatar: '/avatars/supervisor.jpg'
  },
  {
    id: 4,
    username: 'operator',
    email: 'operator@example.com',
    firstName: 'Mike',
    lastName: 'Operator',
    roleId: 4,
    status: 'active',
    createdAt: '2023-04-10',
    lastLogin: '2024-01-12T14:20:00Z',
    avatar: '/avatars/operator.jpg'
  },
  {
    id: 5,
    username: 'viewer',
    email: 'viewer@example.com',
    firstName: 'Lisa',
    lastName: 'Viewer',
    roleId: 5,
    status: 'active',
    createdAt: '2023-05-05',
    lastLogin: '2024-01-11T11:30:00Z',
    avatar: '/avatars/viewer.jpg'
  },
  {
    id: 6,
    username: 'inactive_admin',
    email: 'inactive@example.com',
    firstName: 'Inactive',
    lastName: 'Admin',
    roleId: 2,
    status: 'inactive',
    createdAt: '2023-06-01',
    lastLogin: '2023-12-01T08:00:00Z',
    avatar: '/avatars/inactive.jpg'
  }
];

// Helper function to get admin by ID
export const getAdminById = (id: number) => mockAdmins.find(admin => admin.id === id);

// Helper function to get active admins only
export const getActiveAdmins = () => mockAdmins.filter(admin => admin.status === 'active');

// Helper function to get admins by role
export const getAdminsByRole = (roleId: number) => mockAdmins.filter(admin => admin.roleId === roleId); 