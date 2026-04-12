import { useQuery } from '@tanstack/react-query';
import { propertyViewInteractionsAPI } from '../api/propertyViewInteractions';
import { QueryParams } from '../api/base';

export const propertyViewInteractionsKeys = {
  all: ['property-view-interactions'] as const,
  lists: () => [...propertyViewInteractionsKeys.all, 'list'] as const,
  list: (propertyId: number, params?: QueryParams) =>
    [...propertyViewInteractionsKeys.lists(), propertyId, params] as const,
};

export const usePropertyViewInteractions = (
  propertyId: number,
  params?: QueryParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: propertyViewInteractionsKeys.list(propertyId, params),
    queryFn: () => propertyViewInteractionsAPI.getByPropertyId(propertyId, params),
    enabled: !!propertyId && enabled,
    staleTime: 60 * 1000,
  });
};
