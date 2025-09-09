import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsAndUpdatesAPI } from '../api/news-and-updates';
import { CreateNewsAndUpdateData, UpdateNewsAndUpdateData } from '../../types/newsAndUpdate';
import { QueryParams } from '../api/base';

// Query keys for news and updates
export const newsAndUpdateKeys = {
  all: ['news-and-updates'] as const,
  lists: () => [...newsAndUpdateKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...newsAndUpdateKeys.lists(), params] as const,
  details: () => [...newsAndUpdateKeys.all, 'detail'] as const,
  detail: (slug: string) => [...newsAndUpdateKeys.details(), slug] as const,
};

// Get list of news and updates
export const useNewsAndUpdates = (params?: QueryParams) => {
  return useQuery({
    queryKey: newsAndUpdateKeys.list(params),
    queryFn: () => newsAndUpdatesAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single news and update by slug
export const useNewsAndUpdate = (slug: string) => {
  return useQuery({
    queryKey: newsAndUpdateKeys.detail(slug),
    queryFn: () => newsAndUpdatesAPI.getBySlug(slug),
    enabled: !!slug, // Only run if slug exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create news and update
export const useCreateNewsAndUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNewsAndUpdateData) => newsAndUpdatesAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch news and updates lists
      queryClient.invalidateQueries({ queryKey: newsAndUpdateKeys.lists() });
    },
  });
};

// Update news and update
export const useUpdateNewsAndUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateNewsAndUpdateData }) =>
      newsAndUpdatesAPI.update(slug, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch news and updates lists
      queryClient.invalidateQueries({ queryKey: newsAndUpdateKeys.lists() });
      // Invalidate the specific news and update to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: newsAndUpdateKeys.detail(variables.slug) });
    },
  });
};

// Delete news and update
export const useDeleteNewsAndUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => newsAndUpdatesAPI.delete(slug),
    onSuccess: () => {
      // Invalidate and refetch news and updates lists
      queryClient.invalidateQueries({ queryKey: newsAndUpdateKeys.lists() });
    },
  });
};

