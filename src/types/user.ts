import { BaseEntityWithNumberId, EntityStatus, SelectOption } from './index';

// Core User interface - standardized across the application
export interface User extends BaseEntityWithNumberId {
  name: string;
  email: string;
  role: UserRole;
  status: EntityStatus;
  avatar: string;
  lastLogin: string;
  phone?: string;
  location?: string;
  bio?: string;
  isActive: boolean;
  sendEmailNotification?: boolean;
}

// User roles - standardized
export type UserRole = 'Normal User' | 'Company User' | 'admin' | 'super_admin';

// User form data interface
export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: EntityStatus;
  avatar: string;
  password?: string;
  confirmPassword?: string;
  location?: string;
  bio?: string;
  isActive: boolean;
  sendEmailNotification: boolean;
}

// User filters interface
export interface UserFilters {
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
}

// User creation data
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: EntityStatus;
  password: string;
  location?: string;
  bio?: string;
}

// User update data
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: EntityStatus;
  location?: string;
  bio?: string;
  isActive?: boolean;
  sendEmailNotification?: boolean;
}

// User statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
  normalUsers: number;
  companyUsers: number;
}

// User role options for forms
export const USER_ROLE_OPTIONS: SelectOption[] = [
  { value: 'Normal User', label: 'Normal User' },
  { value: 'Company User', label: 'Company User' },
  { value: 'admin', label: 'Administrator' },
  { value: 'super_admin', label: 'Super Administrator' },
];

// User status options for forms
export const USER_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

// User form fields configuration
export const USER_FORM_FIELDS = {
  firstName: {
    name: 'firstName',
    label: 'First Name',
    type: 'text' as const,
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
    },
  },
  lastName: {
    name: 'lastName',
    label: 'Last Name',
    type: 'text' as const,
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
    },
  },
  email: {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    required: true,
    validation: {
      pattern: /\S+@\S+\.\S+/,
    },
  },
  phone: {
    name: 'phone',
    label: 'Phone Number',
    type: 'text' as const,
    required: true,
    validation: {
      minLength: 10,
    },
  },
  role: {
    name: 'role',
    label: 'Role',
    type: 'select' as const,
    required: true,
    options: USER_ROLE_OPTIONS,
  },
  status: {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    required: true,
    options: USER_STATUS_OPTIONS,
  },
  password: {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    required: true,
    validation: {
      minLength: 6,
    },
  },
  confirmPassword: {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password' as const,
    required: true,
  },
  location: {
    name: 'location',
    label: 'Location',
    type: 'text' as const,
    required: false,
  },
  bio: {
    name: 'bio',
    label: 'Bio',
    type: 'textarea' as const,
    required: false,
    validation: {
      maxLength: 500,
    },
  },
  isActive: {
    name: 'isActive',
    label: 'Active',
    type: 'switch' as const,
    required: false,
  },
  sendEmailNotification: {
    name: 'sendEmailNotification',
    label: 'Send Email Notifications',
    type: 'switch' as const,
    required: false,
  },
}; 