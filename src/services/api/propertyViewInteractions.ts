import { apiRequest, QueryParams } from './base';

export interface PropertyViewInteraction {
  id: number;
  created_at: string | null;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  ip_address: string;
  user_agent: string;
}

export const propertyViewInteractionsAPI = {
  getByPropertyId: (propertyId: number, params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<PropertyViewInteraction[]>(
      `/property-view-interactions/property/${propertyId}${queryString}`
    );
  },
};
