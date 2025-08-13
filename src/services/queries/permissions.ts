import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsAPI } from '../api/permissions';
import { CreatePermissionData, UpdatePermissionData } from '../../types/permission';
import { QueryParams } from '../api/base';

// Query keys for permissions
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...permissionKeys.lists(), params] as const,
  details: () => [...permissionKeys.all, 'detail'] as const,
  detail: (slug: string) => [...permissionKeys.details(), slug] as const,
};

// Get list of permissions
export const usePermissions = (params?: QueryParams) => {
  return useQuery({
    queryKey: permissionKeys.list(params),
    queryFn: () => permissionsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single permission
export const usePermission = (slug: string) => {
  return useQuery({
    queryKey: permissionKeys.detail(slug),
    queryFn: () => permissionsAPI.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionData) => permissionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
};

// Update permission
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdatePermissionData }) =>
      permissionsAPI.update(slug, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        permissionKeys.detail(variables.slug),
        data
      );
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
};

// Delete permission
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => permissionsAPI.delete(slug),
    onSuccess: (_, slug) => {
      queryClient.removeQueries({ queryKey: permissionKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
};

