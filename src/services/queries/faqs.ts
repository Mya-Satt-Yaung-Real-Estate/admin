
import { FaqQueryParams, faqsAPI } from '../api/faqs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys for faqs
export const faqKeys = {
  all: ['faqs'] as const,
  lists: () => [...faqKeys.all, 'list'] as const,
  list: (params?: FaqQueryParams) => [...faqKeys.lists(), params] as const,
  details: () => [...faqKeys.all, 'detail'] as const,
  detail: (slug: string) => [...faqKeys.details(), slug] as const,
  statistics: () => [...faqKeys.all, 'statistics'] as const,
};

// Get faqs list
export const useFaqs = (params?: FaqQueryParams) => {
  return useQuery({
    queryKey: faqKeys.list(params),
    queryFn: () => faqsAPI.getFaqs(params),
    staleTime: 30 * 1000, // 30 seconds - data becomes stale quickly
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Always refetch when component mounts (page navigation)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Get faq statistics
export const useFaqStatistics = () => {
  return useQuery({
    queryKey: faqKeys.statistics(),
    queryFn: () => faqsAPI.getStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};

// Get faq by slug
export const useFaq = (slug: string) => {
  return useQuery({
    queryKey: faqKeys.detail(slug),
    queryFn: () => faqsAPI.getFaq(slug),
    enabled: !!slug,
    staleTime: 30 * 1000, // 30 seconds - data becomes stale quickly
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Always refetch when component mounts (page navigation)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Create faq
export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: faqsAPI.createFaq,
    onSuccess: () => {
      // Invalidate and refetch faqs lists
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: faqKeys.statistics() });
    },
  });
};

// Update faq
export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      faqsAPI.updateFaq(slug, data),
    onSuccess: (response, { slug }) => {
      // Invalidate and refetch faqs lists
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      // Invalidate specific faq detail
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(slug) });
      // Update the faq detail cache with the new data
      if (response?.data) {
        queryClient.setQueryData(faqKeys.detail(slug), response);
      }
    },
  });
};

// Delete faq
export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: faqsAPI.deleteFaq,
    onSuccess: (_response, slug) => {
      // Invalidate and refetch faqs lists
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: faqKeys.statistics() });
      // Invalidate specific faq detail to force refetch
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(slug) });
    },
  });
};


// Restore faq
export const useRestoreFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: faqsAPI.restoreFaq,
    onSuccess: (response, slug) => {
      // Invalidate and refetch faqs lists
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      // Invalidate specific faq detail
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(slug) });
      // Update the faq detail cache with the new data
      if (response?.data) {
        queryClient.setQueryData(faqKeys.detail(slug), response);
      }
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: faqKeys.statistics() });
    },
  });
};