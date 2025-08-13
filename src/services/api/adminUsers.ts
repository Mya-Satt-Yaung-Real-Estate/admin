// Admin Users API functions
import { apiRequest, QueryParams } from './base';
import { AdminUser, CreateAdminUserData, UpdateAdminUserData } from '../../types/admin';

export const adminUsersAPI = {
  // Get list of admin users
  list: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<AdminUser[]>(`/admin-users${queryString}`);
  },

  // Create new admin user
  create: (data: CreateAdminUserData) =>
    apiRequest<AdminUser>('/admin-users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get single admin user
  get: (slug: string) =>
    apiRequest<AdminUser>(`/admin-users/${slug}`),

  // Update admin user
  update: (slug: string, data: UpdateAdminUserData) =>
    apiRequest<AdminUser>(`/admin-users/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete admin user
  delete: (slug: string) =>
    apiRequest(`/admin-users/${slug}`, { method: 'DELETE' }),
};

