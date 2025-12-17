import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../api/dashboard';

// Query keys for dashboard
export const dashboardKeys = {
  all: ['dashboard'] as const,
  statistics: () => [...dashboardKeys.all, 'statistics'] as const,
  systemInfo: () => [...dashboardKeys.all, 'systemInfo'] as const,
};

// Get dashboard statistics
export const useDashboardStatistics = () => {
  return useQuery({
    queryKey: dashboardKeys.statistics(),
    queryFn: () => dashboardAPI.getStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

// Get system information
export const useDashboardSystemInfo = () => {
  return useQuery({
    queryKey: dashboardKeys.systemInfo(),
    queryFn: () => dashboardAPI.getSystemInfo(),
    staleTime: 1 * 60 * 1000, // 1 minute - system info can be cached
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

