import { useQuery } from '@tanstack/react-query';
import { propertyLikesAPI } from '../api/propertyLikes';
import { QueryParams } from '../api/base';

export const propertyLikesKeys = {
  all: ['property-likes'] as const,
  lists: () => [...propertyLikesKeys.all, 'list'] as const,
  list: (propertyId: number, params?: QueryParams) => [...propertyLikesKeys.lists(), propertyId, params] as const,
};

export const usePropertyLikes = (propertyId: number, params?: QueryParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: propertyLikesKeys.list(propertyId, params),
    queryFn: () => propertyLikesAPI.getPropertyLikes(propertyId, params),
    enabled: !!propertyId && enabled,
    staleTime: 60 * 1000,
  });
};
