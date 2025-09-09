import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackAPI } from '../api/feedback';
import { FeedbackQueryParams } from '@/types';

// Query keys for feedback
export const feedbackKeys = {
  all: ['feedbacks'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
  list: (params?: FeedbackQueryParams) => [...feedbackKeys.lists(), params] as const,
  details: () => [...feedbackKeys.all, 'detail'] as const,
  detail: (slug: string) => [...feedbackKeys.details(), slug] as const,
};

// Get feedbacks list
export const useFeedbacks = (params?: FeedbackQueryParams) => {
  return useQuery({
    queryKey: feedbackKeys.list(params),
    queryFn: () => feedbackAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single feedback
export const useFeedback = (slug: string) => {
  return useQuery({
    queryKey: feedbackKeys.detail(slug),
    queryFn: () => feedbackAPI.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Delete feedback mutation
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => feedbackAPI.delete(slug),
    onSuccess: () => {
      // Invalidate and refetch feedbacks list
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
    },
  });
};
