import { useQuery } from '@tanstack/react-query';
import { propertyFavoritesAPI } from '../api/propertyFavorites';
import { QueryParams } from '../api/base';

export const propertyFavoritesKeys = {
  all: ['property-favorites'] as const,
  lists: () => [...propertyFavoritesKeys.all, 'list'] as const,
  list: (propertyId: number, params?: QueryParams) => [...propertyFavoritesKeys.lists(), propertyId, params] as const,
};

export const usePropertyFavorites = (propertyId: number, params?: QueryParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: propertyFavoritesKeys.list(propertyId, params),
    queryFn: () => propertyFavoritesAPI.getPropertyFavorites(propertyId, params),
    enabled: !!propertyId && enabled,
    staleTime: 60 * 1000,
  });
};
