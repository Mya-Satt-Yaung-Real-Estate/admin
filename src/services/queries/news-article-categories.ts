import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsArticleCategoriesAPI } from '../api/news-article-categories';
import { CreateNewsArticleCategoryData, UpdateNewsArticleCategoryData } from '../../types/newsArticleCategory';
import { QueryParams } from '../api/base';

// Query keys for news article categories
export const newsArticleCategoryKeys = {
  all: ['news-article-categories'] as const,
  lists: () => [...newsArticleCategoryKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...newsArticleCategoryKeys.lists(), params] as const,
  details: () => [...newsArticleCategoryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...newsArticleCategoryKeys.details(), slug] as const,
};

// Get list of news article categories
export const useNewsArticleCategories = (params?: QueryParams) => {
  return useQuery({
    queryKey: newsArticleCategoryKeys.list(params),
    queryFn: () => newsArticleCategoriesAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single news article category by slug
export const useNewsArticleCategory = (slug: string) => {
  return useQuery({
    queryKey: newsArticleCategoryKeys.detail(slug),
    queryFn: () => newsArticleCategoriesAPI.getBySlug(slug),
    enabled: !!slug, // Only run if slug exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create news article category
export const useCreateNewsArticleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNewsArticleCategoryData) => newsArticleCategoriesAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch news article categories lists
      queryClient.invalidateQueries({ queryKey: newsArticleCategoryKeys.lists() });
    },
  });
};

// Update news article category
export const useUpdateNewsArticleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateNewsArticleCategoryData }) =>
      newsArticleCategoriesAPI.update(slug, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch news article categories lists
      queryClient.invalidateQueries({ queryKey: newsArticleCategoryKeys.lists() });
      // Invalidate the specific news article category to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: newsArticleCategoryKeys.detail(variables.slug) });
    },
  });
};

// Delete news article category
export const useDeleteNewsArticleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => newsArticleCategoriesAPI.delete(slug),
    onSuccess: () => {
      // Invalidate and refetch news article categories lists
      queryClient.invalidateQueries({ queryKey: newsArticleCategoryKeys.lists() });
    },
  });
};

// Restore news article category
export const useRestoreNewsArticleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => newsArticleCategoriesAPI.restore(slug),
    onSuccess: () => {
      // Invalidate and refetch news article categories lists
      queryClient.invalidateQueries({ queryKey: newsArticleCategoryKeys.lists() });
    },
  });
};
