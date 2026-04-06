import { apiRequest, QueryParams } from './base';

/** User row returned by GET /property-likes/property/{id} */
export interface PropertyLikeUser {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  user_type: string;
  member_level: string;
  is_active: boolean;
  point_balance?: number | null;
  property_count?: number | null;
  last_login_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  verification_status?: string | null;
}

export const propertyLikesAPI = {
  getPropertyLikes: (propertyId: number, params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<PropertyLikeUser[]>(`/property-likes/property/${propertyId}${queryString}`);
  },
};
