// Permissions API functions
import { apiRequest, QueryParams } from './base';
import { Permission, CreatePermissionData, UpdatePermissionData } from '../../types/permission';

export const permissionsAPI = {
  // Get list of permissions
  list: (params?: QueryParams) => {
    if (params) {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(cleanParams as any).toString();
      return apiRequest<Permission[]>(`/permission${queryString ? '?' + queryString : ''}`);
    }
    return apiRequest<Permission[]>(`/permission`);
  },

  // Create new permission
  create: (data: CreatePermissionData) =>
    apiRequest<Permission>('/permission', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get single permission
  get: (slug: string) =>
    apiRequest<Permission>(`/permission/${slug}`),

  // Update permission
  update: (slug: string, data: UpdatePermissionData) =>
    apiRequest<Permission>(`/permission/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete permission
  delete: (slug: string) =>
    apiRequest(`/permission/${slug}`, { method: 'DELETE' }),
};

