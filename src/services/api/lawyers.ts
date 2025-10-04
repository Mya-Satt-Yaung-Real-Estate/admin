// Lawyers API functions
import { apiRequest } from './base';
import { Lawyer, CreateLawyerData, UpdateLawyerData, LawyerQueryParams, LawyerStatistics } from '../../types/lawyer';

// Reusable utility function to filter out undefined/null/empty values from query params
function buildCleanQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
  
  const queryString = Object.keys(filteredParams).length > 0 ? '?' + new URLSearchParams(filteredParams as any).toString() : '';
  
  return queryString;
}

export const lawyersAPI = {
  // Get lawyers with pagination and filtering
  getLawyers: (params?: LawyerQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<{
      success: boolean;
      message: string;
      data: Lawyer[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
      };
    }>(`/lawers${queryString}`);
  },

  // Get lawyer by slug
  getLawyer: (slug: string) =>
    apiRequest<Lawyer>(`/lawers/${slug}`),

  // Create lawyer
  createLawyer: (data: CreateLawyerData) =>
    apiRequest<Lawyer>('/lawers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update lawyer
  updateLawyer: (slug: string, data: UpdateLawyerData) =>
    apiRequest<Lawyer>(`/lawers/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete lawyer (soft delete)
  deleteLawyer: (slug: string) =>
    apiRequest(`/lawers/${slug}`, { method: 'DELETE' }),

  // Restore lawyer
  restoreLawyer: (slug: string) =>
    apiRequest<Lawyer>(`/lawers/${slug}/restore`, { method: 'POST' }),

  // Force delete lawyer
  forceDeleteLawyer: (slug: string) =>
    apiRequest(`/lawers/${slug}/force`, { method: 'DELETE' }),

  // Get lawyer statistics
  getLawyerStatistics: () =>
    apiRequest<LawyerStatistics>('/lawers/statistics'),
};
