// Advertisement API functions based on API documentation
import { apiRequest, ApiResponse } from './base';
import {
  Advertisement,
  AdvertisementFilters,
  AdvertisementResponse,
  AdvertisementStatisticsResponse,
  AdvertisementFormData,
} from '../../types/advertisement';

export const advertisementAPI = {
  // Get all advertisements with pagination and filters
  getAdvertisements: (params?: AdvertisementFilters): Promise<ApiResponse<Advertisement[]>> => {
    if (!params) {
      return apiRequest<Advertisement[]>('/advertisements');
    }
    
    // Filter out undefined values and convert numbers to strings
    const queryParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    });
    
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `/advertisements?${queryString}` : '/advertisements';
    
    return apiRequest<Advertisement[]>(url);
  },

  // Get specific advertisement by ID
  getAdvertisement: (id: number): Promise<ApiResponse<AdvertisementResponse>> =>
    apiRequest<AdvertisementResponse>(`/advertisements/${id}`),

  // Create new advertisement
  createAdvertisement: (data: AdvertisementFormData): Promise<ApiResponse<AdvertisementResponse>> =>
    apiRequest<AdvertisementResponse>('/advertisements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update advertisement
  updateAdvertisement: (id: number, data: Partial<AdvertisementFormData>): Promise<ApiResponse<AdvertisementResponse>> =>
    apiRequest<AdvertisementResponse>(`/advertisements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete advertisement
  deleteAdvertisement: (id: number): Promise<{ success: boolean; message: string; data: null }> =>
    apiRequest(`/advertisements/${id}`, {
      method: 'DELETE',
    }),

  // Approve advertisement
  approveAdvertisement: (id: number): Promise<ApiResponse<AdvertisementResponse>> =>
    apiRequest<AdvertisementResponse>(`/advertisements/${id}/approve`, {
      method: 'POST',
    }),

  // Reject advertisement
  rejectAdvertisement: (id: number, reason?: string): Promise<ApiResponse<AdvertisementResponse>> =>
    apiRequest<AdvertisementResponse>(`/advertisements/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),



  // Renew advertisement
  renewAdvertisement: (id: number): Promise<ApiResponse<AdvertisementResponse>> =>
    apiRequest<AdvertisementResponse>(`/advertisements/${id}/renew`, {
      method: 'POST',
    }),

  // Get advertisement statistics
  getStatistics: (): Promise<ApiResponse<AdvertisementStatisticsResponse>> =>
    apiRequest<AdvertisementStatisticsResponse>('/advertisements/statistics'),


};
