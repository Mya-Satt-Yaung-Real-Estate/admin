// System Configuration React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemConfigurationAPI } from '../api/systemConfiguration';
import { SystemConfigurationFilters, UpdateConfigurationData } from '../../types/systemConfiguration';
import { useAlertSystem } from '../../hooks/useAlertSystem';

// Query keys
export const systemConfigurationKeys = {
  all: ['system-configurations'] as const,
  lists: () => [...systemConfigurationKeys.all, 'list'] as const,
  list: (filters: SystemConfigurationFilters) => [...systemConfigurationKeys.lists(), filters] as const,
  categories: () => [...systemConfigurationKeys.all, 'categories'] as const,
  category: (category: string) => [...systemConfigurationKeys.all, 'category', category] as const,
  details: () => [...systemConfigurationKeys.all, 'detail'] as const,
  detail: (key: string) => [...systemConfigurationKeys.details(), key] as const,
  history: (key: string) => [...systemConfigurationKeys.all, 'history', key] as const,
  recentChanges: () => [...systemConfigurationKeys.all, 'recent-changes'] as const,
};

// Get all configurations
export const useSystemConfigurations = (filters?: SystemConfigurationFilters) => {
  return useQuery({
    queryKey: systemConfigurationKeys.list(filters || {}),
    queryFn: () => systemConfigurationAPI.getSystemConfigurations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get configuration categories
export const useConfigurationCategories = () => {
  return useQuery({
    queryKey: systemConfigurationKeys.categories(),
    queryFn: () => systemConfigurationAPI.getConfigurationCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get configurations by category
export const useConfigurationsByCategory = (category: string) => {
  return useQuery({
    queryKey: systemConfigurationKeys.category(category),
    queryFn: () => systemConfigurationAPI.getConfigurationsByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get specific configuration
export const useConfiguration = (key: string) => {
  return useQuery({
    queryKey: systemConfigurationKeys.detail(key),
    queryFn: () => systemConfigurationAPI.getConfiguration(key),
    enabled: !!key,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get configuration history
export const useConfigurationHistory = (key: string, limit?: number) => {
  return useQuery({
    queryKey: systemConfigurationKeys.history(key),
    queryFn: () => systemConfigurationAPI.getConfigurationHistory(key, limit),
    enabled: !!key,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get recent configuration changes
export const useRecentConfigurationChanges = (limit?: number) => {
  return useQuery({
    queryKey: systemConfigurationKeys.recentChanges(),
    queryFn: () => systemConfigurationAPI.getRecentConfigurationChanges(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Update configuration mutation
export const useUpdateConfiguration = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlertSystem();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateConfigurationData }) =>
      systemConfigurationAPI.updateConfiguration(key, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: systemConfigurationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: systemConfigurationKeys.detail(variables.key) });
      queryClient.invalidateQueries({ queryKey: systemConfigurationKeys.recentChanges() });
      
      showSuccess('Configuration updated successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to update configuration');
    },
  });
};



// Clear configuration cache mutation
export const useClearConfigurationCache = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlertSystem();

  return useMutation({
    mutationFn: () => systemConfigurationAPI.clearConfigurationCache(),
    onSuccess: () => {
      // Invalidate and refetch all configuration queries
      queryClient.invalidateQueries({ queryKey: systemConfigurationKeys.all });
      showSuccess('Configuration cache cleared successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to clear configuration cache');
    },
  });
};
