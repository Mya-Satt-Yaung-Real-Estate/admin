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
      return apiRequest<Role[]>(`/role${queryString ? '?' + queryString : ''}`);
    }
    return apiRequest<Role[]>(`/role`);
  },

  // Create new role
  create: (data: CreateRoleData) =>
    apiRequest<Role>('/role', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get single role
  get: (slug: string) =>
    apiRequest<Role>(`/role/${slug}`),

  // Update role
  update: (slug: string, data: UpdateRoleData) =>
    apiRequest<Role>(`/role/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete role
  delete: (slug: string) =>
    apiRequest(`/role/${slug}`, { method: 'DELETE' }),
};

