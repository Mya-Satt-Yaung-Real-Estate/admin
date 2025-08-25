import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesAPI } from '../api/roles';
import { CreateRoleData, UpdateRoleData } from '../../types/role';
import { QueryParams } from '../api/base';

// Query keys for roles
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (slug: string) => [...roleKeys.details(), slug] as const,
};

// Get list of roles
export const useRoles = (params?: QueryParams) => {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => rolesAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single role
export const useRole = (slug: string) => {
  return useQuery({
    queryKey: roleKeys.detail(slug),
    queryFn: () => rolesAPI.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create role
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleData) => rolesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

// Update role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateRoleData }) =>
      rolesAPI.update(slug, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        roleKeys.detail(variables.slug),
        data
      );
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

// Delete role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => rolesAPI.delete(slug),
    onSuccess: (_, slug) => {
      queryClient.removeQueries({ queryKey: roleKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
};

