// Users API functions
import { apiRequest, QueryParams } from './base';
import { 
  RegularUser, 
  CreateRegularUserData, 
  UpdateRegularUserData,
  CreateUserResponse
} from '../../types/user';

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
    apiRequest<CreateUserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update user
  updateUser: (slug: string, data: UpdateRegularUserData) =>
    apiRequest<{ success: boolean; message: string; data: { user: RegularUser } }>(`/users/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Soft delete user
  softDeleteUser: (slug: string) =>
    apiRequest<{ success: boolean; message: string; data: null }>(`/users/${slug}`, {
      method: 'DELETE',
    }),

  // Restore user
  restoreUser: (slug: string) =>
    apiRequest<{ success: boolean; message: string; data: { user: RegularUser } }>(`/users/${slug}/restore`, {
      method: 'POST',
    }),

  // Permanent delete user
  forceDeleteUser: (slug: string) =>
    apiRequest<{ success: boolean; message: string; data: null }>(`/users/${slug}/force`, {
      method: 'DELETE',
    }),

  // Clear biometric data for user (so they can set up again from the app)
  clearBiometric: (slug: string) =>
    apiRequest<{ success: boolean; message: string; data: { user: RegularUser } }>(`/users/${slug}/clear-biometric`, {
      method: 'POST',
    }),

  revokeUser: (slug: string) =>
    apiRequest<{ user: RegularUser; tokens_revoked: number }>(`/users/${slug}/revoke`, {
      method: 'POST',
    }),

  /**
   * Toggle map pins access without sending a full user update payload.
   */
  updateMapPinsAccess: (slug: string, mapPinsAccess: boolean) =>
    apiRequest<{ user: RegularUser }>(`/users/${slug}/map-pins-access`, {
      method: 'PATCH',
      body: JSON.stringify({ map_pins_access: mapPinsAccess }),
    }),
};
