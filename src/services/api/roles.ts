// Roles API functions
import { apiRequest, QueryParams } from './base';
import { Role, CreateRoleData, UpdateRoleData } from '../../types/role';

export const rolesAPI = {
  // Get list of roles
  list: (params?: QueryParams) => {
    if (params) {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(cleanParams as any).toString();
      return apiRequest<Role[]>(`/roles${queryString ? '?' + queryString : ''}`);
    }
    return apiRequest<Role[]>(`/roles`);
  },

  // Create new role
  create: (data: CreateRoleData) =>
    apiRequest<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get single role
  get: (slug: string) =>
    apiRequest<Role>(`/roles/${slug}`),

  // Update role
  update: (slug: string, data: UpdateRoleData) =>
    apiRequest<Role>(`/roles/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete role
  delete: (slug: string) =>
    apiRequest(`/roles/${slug}`, { method: 'DELETE' }),
};

