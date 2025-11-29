import { useQuery } from '@tanstack/react-query';
import { pointOrdersAPI, PointOrderFilters } from '../api/pointOrders';
import { QueryParams } from '../api/base';
import { PointOrdersResponse } from '../../types/point';

// Re-export for convenience
export type { PointOrderFilters };

// Query keys for point orders
export const pointOrderKeys = {
  all: ['pointOrders'] as const,
  lists: () => [...pointOrderKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...pointOrderKeys.lists(), params] as const,
  details: () => [...pointOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...pointOrderKeys.details(), id] as const,
};

// Get list of point orders
export const usePointOrders = (params?: PointOrderFilters) => {
  return useQuery<PointOrdersResponse>({
    queryKey: pointOrderKeys.list(params),
    queryFn: () => pointOrdersAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single point order detail
export const usePointOrder = (id: number) => {
  return useQuery({
    queryKey: pointOrderKeys.detail(id),
    queryFn: () => pointOrdersAPI.detail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

