import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mapAccessUsersAPI } from '../api/mapAccessUsers';
import { useUsers, userKeys } from './users';

/**
 * List users for Map Access page (same list query as Users — shared cache).
 */
export const useMapAccessUsers = useUsers;

export const useUpdateMapPinsAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, mapPinsAccess }: { slug: string; mapPinsAccess: boolean }) =>
      mapAccessUsersAPI.updateMapPinsAccess(slug, mapPinsAccess),
    onSuccess: (_response, { slug }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(slug) });
    },
  });
};
