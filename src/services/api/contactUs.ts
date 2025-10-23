import { apiRequest } from './base';
import { ContactUs, ContactUsListResponse, ContactUsQueryParams } from '@/types/contactUs';

export const contactUsAPI = {
  // Get contact us list
  list: async (params?: ContactUsQueryParams): Promise<ContactUsListResponse> => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString() : '';
    
    return apiRequest<ContactUs[]>(`/contact-us${queryString}`).then(response => ({
      success: response.success,
      message: response.message,
      data: Array.isArray(response.data) ? response.data : [],
      pagination: response.pagination ? {
        ...response.pagination,
        from: (response.pagination.current_page - 1) * response.pagination.per_page + 1,
        to: Math.min(response.pagination.current_page * response.pagination.per_page, response.pagination.total),
      } : undefined,
    }));
  },

  // Get single contact us record
  get: async (slug: string): Promise<{ success: boolean; message: string; data: ContactUs }> => {
    return apiRequest<ContactUs>(`/contact-us/${slug}`).then(response => ({
      success: response.success,
      message: response.message,
      data: response.data,
    }));
  },

  // Delete contact us record
  delete: async (slug: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/contact-us/${slug}`, {
      method: 'DELETE',
    });
  },

  // Restore contact us record
  restore: async (slug: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/contact-us/${slug}/restore`, {
      method: 'POST',
    });
  },

  // Force delete contact us record
  forceDelete: async (slug: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/contact-us/${slug}/force`, {
      method: 'DELETE',
    });
  },
};
