import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeHubAPI } from '../api';
import { CreateKnowledgeHubData, UpdateKnowledgeHubData } from '../../types/knowledgeHub';
import { QueryParams } from '../api/base';

// Query keys for knowledge hubs
export const knowledgeHubKeys = {
  all: ['knowledge-hub'] as const,
  lists: () => [...knowledgeHubKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...knowledgeHubKeys.lists(), params] as const,
  details: () => [...knowledgeHubKeys.all, 'detail'] as const,
  detail: (slug: string) => [...knowledgeHubKeys.details(), slug] as const,
};

// Get list of knowledge hubs
export const useKnowledgeHubs = (params?: QueryParams) => {
  return useQuery({
    queryKey: knowledgeHubKeys.list(params),
    queryFn: () => knowledgeHubAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single knowledge hub by slug
export const useKnowledgeHub = (slug: string) => {
  return useQuery({
    queryKey: knowledgeHubKeys.detail(slug),
    queryFn: () => knowledgeHubAPI.getBySlug(slug),
    enabled: !!slug, // Only run if slug exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create knowledge hub
export const useCreateKnowledgeHub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKnowledgeHubData) => knowledgeHubAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch knowledge hub lists
      queryClient.invalidateQueries({ queryKey: knowledgeHubKeys.lists() });
    },
  });
};

// Update knowledge hub
export const useUpdateKnowledgeHub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateKnowledgeHubData }) =>
      knowledgeHubAPI.update(slug, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch knowledge hub lists
      queryClient.invalidateQueries({ queryKey: knowledgeHubKeys.lists() });
      // Invalidate the specific knowledge hub to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: knowledgeHubKeys.detail(variables.slug) });
    },
  });
};

// Delete knowledge hub
export const useDeleteKnowledgeHub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => knowledgeHubAPI.delete(slug),
    onSuccess: () => {
      // Invalidate and refetch knowledge hub lists
      queryClient.invalidateQueries({ queryKey: knowledgeHubKeys.lists() });
    },
  });
};

// Restore knowledge hub
export const useRestoreKnowledgeHub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => knowledgeHubAPI.restore(slug),
    onSuccess: () => {
      // Invalidate and refetch knowledge hub lists
      queryClient.invalidateQueries({ queryKey: knowledgeHubKeys.lists() });
    },
  });
};

// Use existing news article categories API for knowledge hub categories
export { useNewsArticleCategories as useKnowledgeHubCategories } from './news-article-categories';
