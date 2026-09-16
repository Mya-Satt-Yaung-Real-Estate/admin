import { apiRequest, QueryParams } from './base';
import { RegularUser } from '../../types/user';
import { usersAPI } from './users';

/**
 * Map Access feature API — list reuses Users; toggle is owned here.
 */
export const mapAccessUsersAPI = {
  getUsers: (params?: QueryParams) => usersAPI.getUsers(params),

  /**
   * Toggle map pins access without a full user update payload.
   */
  updateMapPinsAccess: (slug: string, mapPinsAccess: boolean) =>
    apiRequest<{ user: RegularUser }>(`/users/${slug}/map-pins-access`, {
      method: 'PATCH',
      body: JSON.stringify({ map_pins_access: mapPinsAccess }),
    }),
};
