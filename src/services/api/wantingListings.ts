// Wanting Listings API functions
import { apiRequest, QueryParams } from './base';
import { WantingList, CreateWantingListData, UpdateWantingListData } from '../../types/wantedListing';

// Wanting Listings-specific query parameters interface
export interface WantingListQueryParams extends QueryParams {
  wanted_type?: string;
  property_type_id?: number;
  prefer_region_id?: number;
  prefer_township_id?: number;
  min_budget?: number;
  max_budget?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  search?: string;
  deleted?: string | boolean;
}

// Reusable utility function to filter out undefined/null/empty values from query params
// This can be used by any API service that needs clean query strings
export function buildCleanWantingListingQueryString(params?: Record<string, any>): string {
  if (!params) return '';

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  // Convert boolean values to proper string representation for Laravel
  const processedParams = Object.fromEntries(
    Object.entries(filteredParams).map(([key, value]) => {
      if (key === 'deleted' && typeof value === 'boolean') {
        // Special handling for deleted to ensure Laravel compatibility
        return [key, value ? '1' : '0'];
      }
      return [key, value];
    })
  );

  const queryString = Object.keys(processedParams).length > 0 ? '?' + new URLSearchParams(processedParams as any).toString() : '';

  return queryString;
}

export const wantingListingsAPI = {
  // Get wanting listings statistics
  statistics: () => {
    return apiRequest<{
      total: number;
      published: number;
      draft: number;
      pending: number;
      approved: number;
      rejected: number;
      by_type: {
        buyer: number;
        renter: number;
      };
    }>('/wanted-lists/statistics');
  },

  // Get list of wanting lists
  list: (params?: WantingListQueryParams) => {
    const queryString = buildCleanWantingListingQueryString(params);
    return apiRequest<{data: WantingList[], pagination?: any}>(`/wanted-lists${queryString}`);
  },

  // Get single wanting list
  get: (slug: string) =>
    apiRequest<WantingList>(`/wanted-lists/${slug}`),

  // Create new wanting list
  create: (data: CreateWantingListData) =>
    apiRequest<WantingList>('/wanted-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update wanting list
  update: (slug: string, data: UpdateWantingListData) =>
    apiRequest<WantingList>(`/wanted-lists/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete wanting list (soft delete)
  delete: (slug: string) =>
    apiRequest(`/wanted-lists/${slug}`, { method: 'DELETE' }),

  // Restore wanting list
  restore: (slug: string) =>
    apiRequest<WantingList>(`/wanted-lists/${slug}/restore`, { method: 'POST' }),

  // Toggle wanting list status
  toggleStatus: (slug: string) =>
    apiRequest<WantingList>(`/wanted-lists/${slug}/toggle-status`, {
      method: 'PATCH',
    }),

  // Force delete wanting list
  forceDelete: (slug: string) =>
    apiRequest(`/wanted-lists/${slug}/force`, { method: 'DELETE' }),
};