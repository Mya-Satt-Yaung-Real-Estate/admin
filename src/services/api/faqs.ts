
import { apiRequest, QueryParams } from './base';
import { buildCleanQueryString } from './properties';
import {
    Faq,
    UpdateFaqData,
    FaqDetailResponse,
} from '../../types/faq';


// faqs-specific query parameters interface
export interface FaqQueryParams extends QueryParams {
  status?: string;
  deleted?: string | boolean;
}

// Faq statistics response
export interface FaqStatistics {
  total_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  under_review_count: number;
  deleted_count: number;
  active_count: number;
}

export const faqsAPI = {
  // Get faq requests list
  getFaqs: (params?: FaqQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<Faq[]>(`/faqs${queryString}`);
  },

  // Get faq statistics
  getStatistics: () => {
    return apiRequest<FaqStatistics>('/faqs/statistics');
  },

  // Get faq by slug
  getFaq: (slug: string) => 
    apiRequest<Faq>(`/faqs/${slug}`),

  // Create new faq
  createFaq: (data: UpdateFaqData) =>
    apiRequest<FaqDetailResponse>('/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update faq status
  updateFaq: (slug: string, data: UpdateFaqData) =>
    apiRequest<FaqDetailResponse>(`/faqs/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete faq request
  deleteFaq: (slug: string) =>
    apiRequest<{ success: boolean; message: string; data: null }>(`/faqs/${slug}`, {
      method: 'DELETE',
    }),

  // Restore faq request
  restoreFaq: (slug: string) =>
    apiRequest<Faq>(`/faqs/${slug}/restore`, {
      method: 'POST',
    }),
};