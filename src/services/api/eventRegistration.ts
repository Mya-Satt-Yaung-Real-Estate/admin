import { apiRequest } from './base';
import { EventRegistrationResponse, EventRegistrationUser, PaginationInfo } from '../../types/eventRegistration';

const createQueryString = (params?: { page?: number; per_page?: number }): string => {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString() ? `?${searchParams.toString()}` : '';
};

const transformPagination = (pagination: any): PaginationInfo | undefined => {
  if (!pagination) return undefined;
  
  return {
    current_page: pagination.current_page,
    per_page: pagination.per_page,
    total: pagination.total,
    last_page: pagination.last_page,
    from: pagination.from || 1,
    to: pagination.to || pagination.total,
    has_more_pages: pagination.has_more_pages
  };
};

export const eventRegistrationAPI = {
  /**
   * Get registration users for a specific event
   */
  getRegistrationUsers: async (slug: string, params?: { page?: number; per_page?: number }): Promise<EventRegistrationResponse> => {
    const queryString = createQueryString(params);
    const response = await apiRequest<EventRegistrationUser[]>(`/housing-event-registrations/${slug}${queryString}`);
    
    return {
      success: response.success,
      message: response.message,
      data: response.data,
      pagination: transformPagination(response.pagination)
    };
  },
};
