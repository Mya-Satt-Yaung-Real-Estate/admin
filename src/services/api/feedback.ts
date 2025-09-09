import { apiRequest } from './base';
import { Feedback, FeedbackListResponse, FeedbackQueryParams } from '@/types';

// Feedback API functions
export const feedbackAPI = {
  // Get list of feedbacks
  list: (params?: FeedbackQueryParams): Promise<FeedbackListResponse> => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString() : '';
    
    return apiRequest<Feedback[]>(`/feedbacks${queryString}`).then(response => ({
      success: response.success,
      message: response.message,
      data: response.data,
      pagination: response.pagination ? {
        ...response.pagination,
        from: (response.pagination.current_page - 1) * response.pagination.per_page + 1,
        to: Math.min(response.pagination.current_page * response.pagination.per_page, response.pagination.total),
      } : undefined,
    }));
  },

  // Get single feedback by slug
  get: (slug: string): Promise<FeedbackListResponse> => {
    return apiRequest<Feedback[]>(`/feedbacks/${slug}`).then(response => ({
      success: response.success,
      message: response.message,
      data: response.data,
      pagination: response.pagination ? {
        ...response.pagination,
        from: (response.pagination.current_page - 1) * response.pagination.per_page + 1,
        to: Math.min(response.pagination.current_page * response.pagination.per_page, response.pagination.total),
      } : undefined,
    }));
  },

  // Delete feedback
  delete: (slug: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/feedbacks/${slug}`, {
      method: 'DELETE',
    });
  },
};
