import { User, UserRole, EntityStatus } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'JD',
    lastLogin: '2024-01-15 09:30',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Real estate enthusiast looking for investment opportunities in the city.',
    isActive: true,
    sendEmailNotification: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'JS',
    lastLogin: '2024-01-14 16:45',
    createdAt: '2023-02-20',
    updatedAt: '2024-01-14',
    phone: '+1 (555) 234-5678',
    location: 'Los Angeles, CA',
    bio: 'Real estate agent specializing in luxury properties and commercial real estate.',
    isActive: true,
    sendEmailNotification: true,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Normal User',
    status: 'inactive',
    avatar: 'BJ',
    lastLogin: '2024-01-10 11:20',
    createdAt: '2023-03-10',
    updatedAt: '2024-01-10',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    bio: 'Property owner and real estate investor with portfolio across multiple states.',
    isActive: false,
    sendEmailNotification: false,
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'Company User',
    status: 'pending',
    avatar: 'AB',
    lastLogin: '2024-01-12 14:15',
    createdAt: '2023-04-05',
    updatedAt: '2024-01-12',
    phone: '+1 (555) 456-7890',
    location: 'Miami, FL',
    bio: 'New real estate professional eager to learn and grow in the industry.',
    isActive: false,
    sendEmailNotification: true,
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'CW',
    lastLogin: '2024-01-13 10:30',
    createdAt: '2023-05-12',
    updatedAt: '2024-01-13',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    bio: 'Tech professional interested in real estate investment opportunities.',
    isActive: true,
    sendEmailNotification: true,
  },
  {
    id: 6,
    name: 'Diana Davis',
    email: 'diana.davis@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'DD',
    lastLogin: '2024-01-14 13:45',
    createdAt: '2023-06-18',
    updatedAt: '2024-01-14',
    phone: '+1 (555) 678-9012',
    location: 'Austin, TX',
    bio: 'Experienced real estate broker with focus on residential properties.',
    isActive: true,
    sendEmailNotification: true,
  },
  {
    id: 7,
    name: 'Edward Miller',
    email: 'edward.miller@example.com',
    role: 'Normal User',
    status: 'inactive',
    avatar: 'EM',
    lastLogin: '2024-01-08 09:15',
    createdAt: '2023-07-22',
    updatedAt: '2024-01-08',
    phone: '+1 (555) 789-0123',
    location: 'Denver, CO',
    bio: 'Retired professional looking to invest in real estate for passive income.',
    isActive: false,
    sendEmailNotification: false,
  },
  {
    id: 8,
    name: 'Fiona Garcia',
    email: 'fiona.garcia@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'FG',
    lastLogin: '2024-01-15 08:20',
    createdAt: '2023-08-30',
    updatedAt: '2024-01-15',
    phone: '+1 (555) 890-1234',
    location: 'Phoenix, AZ',
    bio: 'Commercial real estate specialist with expertise in office and retail properties.',
    isActive: true,
    sendEmailNotification: true,
  },
  {
    id: 9,
    name: 'George Thompson',
    email: 'george.thompson@example.com',
    role: 'Normal User',
    status: 'pending',
    avatar: 'GT',
    lastLogin: '2024-01-11 15:30',
    createdAt: '2023-09-15',
    updatedAt: '2024-01-11',
    phone: '+1 (555) 901-2345',
    location: 'Portland, OR',
    bio: 'Environmental consultant interested in sustainable real estate development.',
    isActive: false,
    sendEmailNotification: true,
  },
  {
    id: 10,
    name: 'Helen Martinez',
    email: 'helen.martinez@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'HM',
    lastLogin: '2024-01-14 12:00',
    createdAt: '2023-10-08',
    updatedAt: '2024-01-14',
    phone: '+1 (555) 012-3456',
    location: 'San Diego, CA',
    bio: 'Luxury real estate specialist with international client portfolio.',
    isActive: true,
    sendEmailNotification: true,
  },
];

// Helper functions
export const getActiveUsers = (): User[] => {
  return mockUsers.filter(user => user.status === 'active');
};

export const getInactiveUsers = (): User[] => {
  return mockUsers.filter(user => user.status === 'inactive');
};

export const getPendingUsers = (): User[] => {
  return mockUsers.filter(user => user.status === 'pending');
};

export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(user => user.role === role);
};

export const getUsersByStatus = (status: EntityStatus): User[] => {
  return mockUsers.filter(user => user.status === status);
};

export const searchUsers = (searchTerm: string): User[] => {
  const term = searchTerm.toLowerCase();
  return mockUsers.filter(user =>
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term) ||
    user.location?.toLowerCase().includes(term) ||
    user.bio?.toLowerCase().includes(term)
  );
};

export const getUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUserStats = () => {
  return {
    totalUsers: mockUsers.length,
    activeUsers: getActiveUsers().length,
    inactiveUsers: getInactiveUsers().length,
    pendingUsers: getPendingUsers().length,
    normalUsers: getUsersByRole('Normal User').length,
    companyUsers: getUsersByRole('Company User').length,
  };
}; 