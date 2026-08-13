import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activitiesAPI } from '../api/activities';
import type {
  ActivityQueryParams,
  CreateActivityData,
  UpdateActivityData,
} from '../../types/activity';

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (params?: ActivityQueryParams) => [...activityKeys.lists(), params] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (slug: string) => [...activityKeys.details(), slug] as const,
  statistics: () => [...activityKeys.all, 'statistics'] as const,
};

export const useActivityStatistics = () => {
  return useQuery({
    queryKey: activityKeys.statistics(),
    queryFn: () => activitiesAPI.statistics(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useActivities = (params?: ActivityQueryParams) => {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => activitiesAPI.list(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useActivity = (slug: string) => {
  return useQuery({
    queryKey: activityKeys.detail(slug),
    queryFn: () => activitiesAPI.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityData) => activitiesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.statistics() });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateActivityData }) =>
      activitiesAPI.update(slug, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: activityKeys.statistics() });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => activitiesAPI.delete(slug),
    onSuccess: (_data, slug) => {
      queryClient.removeQueries({ queryKey: activityKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.statistics() });
    },
  });
};

export const useRestoreActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => activitiesAPI.restore(slug),
    onSuccess: (response, slug) => {
      queryClient.setQueryData(activityKeys.detail(slug), response);
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.statistics() });
    },
  });
};

export const useForceDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => activitiesAPI.forceDelete(slug),
    onSuccess: (_data, slug) => {
      queryClient.removeQueries({ queryKey: activityKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.statistics() });
    },
  });
};

export const useToggleActivityHomepage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => activitiesAPI.toggleHomepage(slug),
    onSuccess: (response, slug) => {
      queryClient.setQueryData(activityKeys.detail(slug), response);
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.statistics() });
    },
  });
};
