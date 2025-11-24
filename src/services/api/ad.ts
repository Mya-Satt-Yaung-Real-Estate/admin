// AD API functions based on AdsController API documentation
import { apiRequest, ApiResponse } from './base';
import {
  AD,
  ADFilters,
  ADResponse,
  ADStatisticsResponse,
  ADFormData,
} from '../../types/ad';

export const adAPI = {
  // Get all ads with pagination and filters
  getADs: (params?: ADFilters): Promise<ApiResponse<AD[]>> => {
    if (!params) {
      return apiRequest<AD[]>('/ads');
    }

    // Filter out undefined values and convert numbers to strings
    const queryParams: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    });

    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `/ads?${queryString}` : '/ads';

    return apiRequest<AD[]>(url);
  },

  // Get specific ad by ID
  getAD: (id: number): Promise<ApiResponse<AD>> =>
    apiRequest<AD>(`/ads/${id}`),

  // Get specific ad by slug
  getADBySlug: (slug: string): Promise<ApiResponse<AD>> =>
    apiRequest<AD>(`/ads/${slug}`),

  // Create new ad
  createAD: (data: ADFormData): Promise<ApiResponse<ADResponse>> =>
    apiRequest<ADResponse>('/ads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update ad by ID
  updateAD: (id: number, data: Partial<ADFormData>): Promise<ApiResponse<ADResponse>> =>
    apiRequest<ADResponse>(`/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Update ad by slug
  updateADBySlug: (slug: string, data: Partial<ADFormData>): Promise<ApiResponse<ADResponse>> =>
    apiRequest<ADResponse>(`/ads/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete ad by slug
  deleteAD: (slug: string): Promise<{ success: boolean; message: string; data: null }> =>
    apiRequest(`/ads/${slug}`, {
      method: 'DELETE',
    }),

  // Get ad statistics
  getStatistics: (): Promise<ApiResponse<ADStatisticsResponse>> =>
    apiRequest<ADStatisticsResponse>('/ads/statistics'),
};