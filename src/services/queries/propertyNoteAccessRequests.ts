import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { propertyNoteAccessRequestsAPI } from '../api/propertyNoteAccessRequests';
import type { PropertyNoteAccessRequestFilters } from '../../types/propertyNoteAccess';

export const propertyNoteAccessKeys = {
  all: ['property-note-access-requests'] as const,
  lists: () => [...propertyNoteAccessKeys.all, 'list'] as const,
  list: (params?: PropertyNoteAccessRequestFilters) =>
    [...propertyNoteAccessKeys.lists(), params] as const,
  details: () => [...propertyNoteAccessKeys.all, 'detail'] as const,
  detail: (id: number) => [...propertyNoteAccessKeys.details(), id] as const,
};

export const usePropertyNoteAccessRequests = (params?: PropertyNoteAccessRequestFilters) => {
  return useQuery({
    queryKey: propertyNoteAccessKeys.list(params),
    queryFn: () => propertyNoteAccessRequestsAPI.list(params),
    staleTime: 30 * 1000,
    refetchOnMount: true,
    /**
     * Keep the previous list on screen while a new search/filter page loads
     * so typing does not flash a full-page loader.
     */
    placeholderData: keepPreviousData,
  });
};

export const useApprovePropertyNoteAccessRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propertyNoteAccessRequestsAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
    },
  });
};

export const useRejectPropertyNoteAccessRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectReason }: { id: number; rejectReason?: string }) =>
      propertyNoteAccessRequestsAPI.reject(id, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
    },
  });
};
