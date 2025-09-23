import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentPreferTimeApi } from '../api/appointmentPreferTimes';
import { CreateAppointmentPreferTimeData, UpdateAppointmentPreferTimeData } from '../api/appointmentPreferTimes';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const appointmentPreferTimeKeys = {
  all: ['appointmentPreferTimes'] as const,
  lists: () => [...appointmentPreferTimeKeys.all, 'list'] as const,
  list: (filters?: any) => [...appointmentPreferTimeKeys.lists(), { filters }] as const,
  details: () => [...appointmentPreferTimeKeys.all, 'detail'] as const,
  detail: (id: number) => [...appointmentPreferTimeKeys.details(), id] as const,
  trashed: () => [...appointmentPreferTimeKeys.all, 'trashed'] as const,
  withTrashed: () => [...appointmentPreferTimeKeys.all, 'withTrashed'] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all appointment prefer times (excluding soft deleted)
 */
export const useAppointmentPreferTimes = () => {
  return useQuery({
    queryKey: appointmentPreferTimeKeys.list(),
    queryFn: () => appointmentPreferTimeApi.list(),
  });
};

/**
 * Get all appointment prefer times including soft deleted
 */
export const useAppointmentPreferTimesWithTrashed = () => {
  return useQuery({
    queryKey: appointmentPreferTimeKeys.withTrashed(),
    queryFn: () => appointmentPreferTimeApi.listWithTrashed(),
  });
};

/**
 * Get only soft deleted appointment prefer times
 */
export const useAppointmentPreferTimesTrashed = () => {
  return useQuery({
    queryKey: appointmentPreferTimeKeys.trashed(),
    queryFn: () => appointmentPreferTimeApi.listTrashed(),
  });
};

/**
 * Get specific appointment prefer time
 */
export const useAppointmentPreferTime = (id: number) => {
  return useQuery({
    queryKey: appointmentPreferTimeKeys.detail(id),
    queryFn: () => appointmentPreferTimeApi.show(id),
    enabled: !!id,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create appointment prefer time
 */
export const useCreateAppointmentPreferTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentPreferTimeData) => appointmentPreferTimeApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.withTrashed() });
    },
  });
};

/**
 * Update appointment prefer time
 */
export const useUpdateAppointmentPreferTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentPreferTimeData }) =>
      appointmentPreferTimeApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific detail and lists
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.withTrashed() });
    },
  });
};

/**
 * Soft delete appointment prefer time
 */
export const useDeleteAppointmentPreferTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentPreferTimeApi.destroy(id),
    onSuccess: () => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.withTrashed() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.trashed() });
    },
  });
};

/**
 * Permanently delete appointment prefer time
 */
export const useForceDeleteAppointmentPreferTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentPreferTimeApi.forceDelete(id),
    onSuccess: () => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.withTrashed() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.trashed() });
    },
  });
};

/**
 * Restore soft deleted appointment prefer time
 */
export const useRestoreAppointmentPreferTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentPreferTimeApi.restore(id),
    onSuccess: () => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.withTrashed() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.trashed() });
    },
  });
};

/**
 * Toggle appointment prefer time status
 */
export const useToggleAppointmentPreferTimeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentPreferTimeApi.toggleStatus(id),
    onSuccess: (_, id) => {
      // Invalidate specific detail and lists
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentPreferTimeKeys.withTrashed() });
    },
  });
};
