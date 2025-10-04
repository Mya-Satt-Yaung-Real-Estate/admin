import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lawyersAPI } from '../api/lawyers';
import { LawyerQueryParams, CreateLawyerData, UpdateLawyerData } from '../../types/lawyer';

// Query keys for lawyers
export const lawyerKeys = {
  all: ['lawyers'] as const,
  lists: () => [...lawyerKeys.all, 'list'] as const,
  list: (params?: LawyerQueryParams) => [...lawyerKeys.lists(), params] as const,
  details: () => [...lawyerKeys.all, 'detail'] as const,
  detail: (slug: string) => [...lawyerKeys.details(), slug] as const,
  statistics: () => [...lawyerKeys.all, 'statistics'] as const,
};

// Get lawyers with pagination and filtering
export const useLawyers = (params?: LawyerQueryParams) => {
  return useQuery({
    queryKey: lawyerKeys.list(params),
    queryFn: () => lawyersAPI.getLawyers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get lawyer by slug
export const useLawyer = (slug: string) => {
  return useQuery({
    queryKey: lawyerKeys.detail(slug),
    queryFn: () => lawyersAPI.getLawyer(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create lawyer
export const useCreateLawyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLawyerData) => lawyersAPI.createLawyer(data),
    onSuccess: () => {
      // Invalidate and refetch lawyers
      queryClient.invalidateQueries({ queryKey: lawyerKeys.lists() });
    },
  });
};

// Update lawyer
export const useUpdateLawyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateLawyerData }) =>
      lawyersAPI.updateLawyer(slug, data),
    onSuccess: (data, variables) => {
      // Update the specific lawyer in cache
      queryClient.setQueryData(
        lawyerKeys.detail(variables.slug),
        data
      );
      // Invalidate and refetch lawyers
      queryClient.invalidateQueries({ queryKey: lawyerKeys.lists() });
    },
  });
};

// Delete lawyer (soft delete)
export const useDeleteLawyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => lawyersAPI.deleteLawyer(slug),
    onSuccess: () => {
      // Invalidate and refetch lawyers
      queryClient.invalidateQueries({ queryKey: lawyerKeys.lists() });
    },
  });
};

// Restore lawyer
export const useRestoreLawyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => lawyersAPI.restoreLawyer(slug),
    onSuccess: () => {
      // Invalidate and refetch lawyers
      queryClient.invalidateQueries({ queryKey: lawyerKeys.lists() });
    },
  });
};

// Force delete lawyer
export const useForceDeleteLawyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => lawyersAPI.forceDeleteLawyer(slug),
    onSuccess: () => {
      // Invalidate and refetch lawyers
      queryClient.invalidateQueries({ queryKey: lawyerKeys.lists() });
    },
  });
};

// Get lawyer statistics
export const useLawyerStatistics = () => {
  return useQuery({
    queryKey: lawyerKeys.statistics(),
    queryFn: () => lawyersAPI.getLawyerStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
