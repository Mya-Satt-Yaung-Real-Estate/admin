// Users API functions
import { apiRequest, QueryParams } from './base';
import { RegularUser, CreateRegularUserData, UpdateRegularUserData } from '../../types/user';

export const usersAPI = {
  // Get users list
  getUsers: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<RegularUser[]>(`/users${queryString}`);
  },

  // Get user by slug
  getUser: (slug: string) => apiRequest<{ user: RegularUser }>(`/users/${slug}`),

  // Create user
  createUser: (data: CreateRegularUserData) =>
    apiRequest<RegularUser>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update user
  updateUser: (slug: string, data: UpdateRegularUserData) =>
    apiRequest<RegularUser>(`/users/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete user
  deleteUser: (id: number) =>
    apiRequest<null>(`/users/${id}`, {
      method: 'DELETE',
    }),
};
