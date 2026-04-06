import { apiRequest, QueryParams } from './base';
import type { PropertyLikeUser } from './propertyLikes';

export const propertyFavoritesAPI = {
  /** Same user row shape as property likes */
  getPropertyFavorites: (propertyId: number, params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<PropertyLikeUser[]>(`/property-favorites/property/${propertyId}${queryString}`);
  },
};
