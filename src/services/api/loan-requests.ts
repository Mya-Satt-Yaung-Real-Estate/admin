// Loan Requests API functions
import { apiRequest, QueryParams } from './base';
import { buildCleanQueryString } from './properties';
import { 
  LoanRequest, 
  UpdateLoanRequestData,
  LoanRequestDetailResponse
} from '../../types/loanRequest';

// Loan requests-specific query parameters interface
export interface LoanRequestQueryParams extends QueryParams {
  status?: string;
  deleted?: string | boolean;
}

// Loan request statistics response
export interface LoanRequestStatistics {
  total_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  under_review_count: number;
  deleted_count: number;
  active_count: number;
}

export const loanRequestsAPI = {
  // Get loan requests list
  getLoanRequests: (params?: LoanRequestQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<LoanRequest[]>(`/loan-requests${queryString}`);
  },

  // Get loan request statistics
  getStatistics: () => {
    return apiRequest<LoanRequestStatistics>('/loan-requests/statistics');
  },

  // Get loan request by slug
  getLoanRequest: (slug: string) => 
    apiRequest<LoanRequest>(`/loan-requests/${slug}`),

  // Update loan request status
  updateLoanRequest: (slug: string, data: UpdateLoanRequestData) =>
    apiRequest<LoanRequestDetailResponse>(`/loan-requests/${slug}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete loan request
  deleteLoanRequest: (slug: string) =>
    apiRequest<{ success: boolean; message: string; data: null }>(`/loan-requests/${slug}`, {
      method: 'DELETE',
    }),

  // Restore loan request
  restoreLoanRequest: (slug: string) =>
    apiRequest<LoanRequest>(`/loan-requests/${slug}/restore`, {
      method: 'POST',
    }),
};