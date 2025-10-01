// Point Transactions API functions
import { apiRequest, QueryParams } from './base';
import { PointTransaction, PointTransactionStatistics } from '../../types/pointTransaction';

// Point Transactions-specific query parameters interface
export interface PointTransactionQueryParams extends QueryParams {
  transaction_type?: string;
  reference_type?: string;
}

// Reusable utility function to filter out undefined/null/empty values from query params
export function buildCleanQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
  
  const queryString = Object.keys(filteredParams).length > 0 ? '?' + new URLSearchParams(filteredParams as any).toString() : '';
  
  return queryString;
}

export const pointTransactionsAPI = {
  // Get point transaction statistics
  statistics: () => {
    return apiRequest<PointTransactionStatistics>('/point-transactions/statistics');
  },

  // Get list of point transactions
  list: (params?: PointTransactionQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<PointTransaction[]>(`/point-transactions${queryString}`);
  },
};
