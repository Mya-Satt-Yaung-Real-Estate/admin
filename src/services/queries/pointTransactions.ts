import { useQuery } from '@tanstack/react-query';
import { pointTransactionsAPI, PointTransactionQueryParams } from '../api/pointTransactions';
import { QueryParams } from '../api/base';

// Query keys for point transactions
export const pointTransactionKeys = {
  all: ['pointTransactions'] as const,
  lists: () => [...pointTransactionKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...pointTransactionKeys.lists(), params] as const,
  statistics: () => [...pointTransactionKeys.all, 'statistics'] as const,
};

// Get list of point transactions
export const usePointTransactions = (params?: PointTransactionQueryParams) => {
  return useQuery({
    queryKey: pointTransactionKeys.list(params),
    queryFn: () => pointTransactionsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get point transaction statistics
export const usePointTransactionStatistics = () => {
  return useQuery({
    queryKey: pointTransactionKeys.statistics(),
    queryFn: () => pointTransactionsAPI.statistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};
