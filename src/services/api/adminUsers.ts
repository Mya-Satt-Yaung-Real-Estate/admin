// Admin Users API functions
import { apiRequest, QueryParams } from './base';
import { AdminUser, CreateAdminUserData, UpdateAdminUserData } from '../../types/admin';

export const adminUsersAPI = {
  // Get list of admin users
  list: (params?: QueryParams) => {
    if (params) {
      // Filter out undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(cleanParams as any).toString();
      return apiRequest<AdminUser[]>(`/admin-users${queryString ? '?' + queryString : ''}`);
    }
    return apiRequest<AdminUser[]>(`/admin-users`);
  },

  // Create new admin user
  create: (data: CreateAdminUserData) =>
    apiRequest<{ user: AdminUser }>('/admin-users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get single admin user
  get: (slug: string) =>
    apiRequest<{ user: AdminUser }>(`/admin-users/${slug}`),

  // Update admin user
  update: (slug: string, data: UpdateAdminUserData) =>
    apiRequest<{ data: AdminUser }>(`/admin-users/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete admin user
  delete: (slug: string) =>
    apiRequest(`/admin-users/${slug}`, { method: 'DELETE' }),
};

