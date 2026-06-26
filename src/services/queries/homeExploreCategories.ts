import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homeExploreCategoriesAPI } from '../api/homeExploreCategories';
import {
  HomeExploreCategoryFormData,
  HomeExploreCategoryQueryParams,
  HomeExploreCategoryReorderItem,
} from '../../types/homeExploreCategory';

export const homeExploreCategoryKeys = {
  all: ['home-explore-categories'] as const,
  lists: () => [...homeExploreCategoryKeys.all, 'list'] as const,
  list: (params?: HomeExploreCategoryQueryParams) => [...homeExploreCategoryKeys.lists(), params] as const,
  details: () => [...homeExploreCategoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...homeExploreCategoryKeys.details(), id] as const,
};

export const useHomeExploreCategories = (params?: HomeExploreCategoryQueryParams) => {
  return useQuery({
    queryKey: homeExploreCategoryKeys.list(params),
    queryFn: () => homeExploreCategoriesAPI.list(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHomeExploreCategory = (id: number) => {
  return useQuery({
    queryKey: homeExploreCategoryKeys.detail(id),
    queryFn: () => homeExploreCategoriesAPI.show(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateHomeExploreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HomeExploreCategoryFormData) => homeExploreCategoriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeExploreCategoryKeys.lists() });
    },
  });
};

export const useUpdateHomeExploreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HomeExploreCategoryFormData> }) =>
      homeExploreCategoriesAPI.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: homeExploreCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: homeExploreCategoryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteHomeExploreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => homeExploreCategoriesAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: homeExploreCategoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: homeExploreCategoryKeys.lists() });
    },
  });
};

export const useReorderHomeExploreCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: HomeExploreCategoryReorderItem[]) => homeExploreCategoriesAPI.reorder(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeExploreCategoryKeys.lists() });
    },
  });
};
