// Loan Requests React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanRequestsAPI } from '../api/loan-requests';
import { LoanRequestQueryParams } from '../api/loan-requests';

// Query keys for loan requests
export const loanRequestKeys = {
  all: ['loanRequests'] as const,
  lists: () => [...loanRequestKeys.all, 'list'] as const,
  list: (params?: LoanRequestQueryParams) => [...loanRequestKeys.lists(), params] as const,
  details: () => [...loanRequestKeys.all, 'detail'] as const,
  detail: (slug: string) => [...loanRequestKeys.details(), slug] as const,
  statistics: () => [...loanRequestKeys.all, 'statistics'] as const,
};

// Get loan requests list
export const useLoanRequests = (params?: LoanRequestQueryParams) => {
  return useQuery({
    queryKey: loanRequestKeys.list(params),
    queryFn: () => loanRequestsAPI.getLoanRequests(params),
    staleTime: 30 * 1000, // 30 seconds - data becomes stale quickly
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Always refetch when component mounts (page navigation)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Get loan request statistics
export const useLoanRequestStatistics = () => {
  return useQuery({
    queryKey: loanRequestKeys.statistics(),
    queryFn: () => loanRequestsAPI.getStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};

// Get loan request by slug
export const useLoanRequest = (slug: string) => {
  return useQuery({
    queryKey: loanRequestKeys.detail(slug),
    queryFn: () => loanRequestsAPI.getLoanRequest(slug),
    enabled: !!slug,
    staleTime: 30 * 1000, // 30 seconds - data becomes stale quickly
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Always refetch when component mounts (page navigation)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Update loan request
export const useUpdateLoanRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      loanRequestsAPI.updateLoanRequest(slug, data),
    onSuccess: (response, { slug }) => {
      // Invalidate and refetch loan requests lists
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.lists() });
      // Invalidate specific loan request detail
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.detail(slug) });
      // Update the loan request detail cache with the new data
      if (response?.data) {
        queryClient.setQueryData(loanRequestKeys.detail(slug), response);
      }
    },
  });
};

// Delete loan request
export const useDeleteLoanRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanRequestsAPI.deleteLoanRequest,
    onSuccess: (_response, slug) => {
      // Invalidate and refetch loan requests lists
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.lists() });
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.statistics() });
      // Invalidate specific loan request detail to force refetch
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.detail(slug) });
    },
  });
};

// Restore loan request
export const useRestoreLoanRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanRequestsAPI.restoreLoanRequest,
    onSuccess: (response, slug) => {
      // Invalidate and refetch loan requests lists
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.lists() });
      // Invalidate specific loan request detail
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.detail(slug) });
      // Update the loan request detail cache with the new data
      if (response?.data) {
        queryClient.setQueryData(loanRequestKeys.detail(slug), response);
      }
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: loanRequestKeys.statistics() });
    },
  });
};