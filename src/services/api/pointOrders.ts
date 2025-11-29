// Point Orders API functions
import { apiRequest } from './base';
import { PointOrder, PointOrdersResponse, PointOrderFilters } from '../../types/point';

// Export PointOrderFilters for use in queries
export type { PointOrderFilters };

// Reusable utility function to filter out undefined/null/empty values from query params
export function buildCleanQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
  
  const queryString = Object.keys(filteredParams).length > 0 ? '?' + new URLSearchParams(filteredParams as any).toString() : '';
  
  return queryString;
}

export const pointOrdersAPI = {
  // Get list of point orders
  // API returns: { success, message, data: PointOrder[], pagination, summary }
  // apiRequest returns the JSON response as-is (returns data directly, not wrapped)
  list: async (params?: PointOrderFilters) => {
    const queryString = buildCleanQueryString(params);
    const response = await apiRequest<PointOrdersResponse>(`/point-orders${queryString}`);
    // apiRequest<T> returns ApiResponse<T> = { success, message, data: T }
    // But the actual API response IS PointOrdersResponse = { success, message, data: [...], pagination, summary }
    // So apiRequest returns PointOrdersResponse directly (not wrapped), but typed as ApiResponse<PointOrdersResponse>
    // We need to return response as PointOrdersResponse (it already is, just typed incorrectly)
    // Cast through unknown first to avoid type error
    return response as unknown as PointOrdersResponse;
  },

  // Get single point order detail
  detail: (id: number) => {
    return apiRequest<PointOrder>(`/point-orders/${id}`);
  },
};

