import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsAPI } from '../api/comments';
import { QueryParams } from '../api/base';

// Query keys for comments
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (propertyId: number, params?: QueryParams) => [...commentKeys.lists(), propertyId, params] as const,
  details: () => [...commentKeys.all, 'detail'] as const,
  detail: (id: number) => [...commentKeys.details(), id] as const,
  statistics: () => [...commentKeys.all, 'statistics'] as const,
};

// Get comments for a property
export const usePropertyComments = (propertyId: number, params?: QueryParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: commentKeys.list(propertyId, params),
    queryFn: () => commentsAPI.getPropertyComments(propertyId, params),
    enabled: !!propertyId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get a specific comment
export const useComment = (commentId: number) => {
  return useQuery({
    queryKey: commentKeys.detail(commentId),
    queryFn: () => commentsAPI.getComment(commentId),
    enabled: !!commentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Delete comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentsAPI.deleteComment(commentId),
    onSuccess: () => {
      // Invalidate all comment lists to refresh the data
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: commentKeys.statistics() });
    },
  });
};

// Force delete comment (permanent deletion)
export const useForceDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentsAPI.forceDeleteComment(commentId),
    onSuccess: () => {
      // Invalidate all comment lists to refresh the data
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      
      // Also invalidate statistics
      queryClient.invalidateQueries({ queryKey: commentKeys.statistics() });
    },
  });
};

// Get comments statistics
export const useCommentsStatistics = () => {
  return useQuery({
    queryKey: commentKeys.statistics(),
    queryFn: () => commentsAPI.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
