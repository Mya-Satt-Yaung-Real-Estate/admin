import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '../api/projects';
import { ProjectFilters, ProjectFormData } from '../../types/project';
import { QueryParams } from '../api/base';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
  statistics: () => [...projectKeys.all, 'statistics'] as const,
};

export const useProjects = (params?: ProjectFilters) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectAPI.getProjects(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectAPI.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectStatistics = () => {
  return useQuery({
    queryKey: projectKeys.statistics(),
    queryFn: () => projectAPI.getStatistics(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectFormData) => projectAPI.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.statistics() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProjectFormData> }) =>
      projectAPI.updateProject(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.statistics() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectAPI.deleteProject(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.statistics() });
    },
  });
};

export const useRestoreProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectAPI.restoreProject(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.statistics() });
    },
  });
};
