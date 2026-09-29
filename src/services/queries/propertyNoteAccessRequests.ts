import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { propertyNoteAccessRequestsAPI } from '../api/propertyNoteAccessRequests';
import type {
  PropertyNoteAccessAddDevicesPayload,
  PropertyNoteAccessChangeScopePayload,
  PropertyNoteAccessGrantPayload,
  PropertyNoteAccessRequestFilters,
} from '../../types/propertyNoteAccess';

export const propertyNoteAccessKeys = {
  all: ['property-note-access-requests'] as const,
  lists: () => [...propertyNoteAccessKeys.all, 'list'] as const,
  list: (params?: PropertyNoteAccessRequestFilters) =>
    [...propertyNoteAccessKeys.lists(), params] as const,
  details: () => [...propertyNoteAccessKeys.all, 'detail'] as const,
  detail: (id: number) => [...propertyNoteAccessKeys.details(), id] as const,
  grantOptions: () => [...propertyNoteAccessKeys.all, 'grant-options'] as const,
  userDevices: (userId: number) =>
    [...propertyNoteAccessKeys.all, 'user-devices', userId] as const,
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

export const usePropertyNoteAccessRequest = (id: number) => {
  return useQuery({
    queryKey: propertyNoteAccessKeys.detail(id),
    queryFn: () => propertyNoteAccessRequestsAPI.get(id),
    enabled: id > 0,
    staleTime: 30 * 1000,
    /**
     * Keep the previous grant on screen when switching table rows so the
     * first click on a new grant id does not flash a full-page loader.
     */
    placeholderData: keepPreviousData,
  });
};

export const usePropertyNoteAccessGrantOptions = () => {
  return useQuery({
    queryKey: propertyNoteAccessKeys.grantOptions(),
    queryFn: async () => {
      const response = await propertyNoteAccessRequestsAPI.getGrantOptions();
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const usePropertyNoteAccessUserDevices = (userId: number | null) => {
  return useQuery({
    queryKey: propertyNoteAccessKeys.userDevices(userId ?? 0),
    queryFn: async () => {
      const response = await propertyNoteAccessRequestsAPI.getUserDevices(userId as number);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: userId !== null && userId > 0,
    staleTime: 30 * 1000,
  });
};

export const useGrantPropertyNoteAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PropertyNoteAccessGrantPayload) =>
      propertyNoteAccessRequestsAPI.grant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.grantOptions() });
    },
  });
};

export const useApprovePropertyNoteAccessRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propertyNoteAccessRequestsAPI.approve(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.detail(id) });
    },
  });
};

export const useRejectPropertyNoteAccessRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectReason }: { id: number; rejectReason?: string }) =>
      propertyNoteAccessRequestsAPI.reject(id, rejectReason),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.detail(vars.id) });
    },
  });
};

export const useRevokePropertyNoteAccessRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propertyNoteAccessRequestsAPI.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.details() });
    },
  });
};

export const useReactivatePropertyNotePointUnlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propertyNoteAccessRequestsAPI.reactivatePointUnlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.details() });
    },
  });
};

export const useAddPropertyNoteAccessDevices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PropertyNoteAccessAddDevicesPayload;
    }) => propertyNoteAccessRequestsAPI.addDevices(id, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.grantOptions() });
    },
  });
};

export const useChangePropertyNoteAccessScope = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PropertyNoteAccessChangeScopePayload;
    }) => propertyNoteAccessRequestsAPI.changeScope(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.details() });
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.grantOptions() });
    },
  });
};

export const useUpdatePropertyNoteVisibleUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, visibleUserIds }: { id: number; visibleUserIds: number[] }) =>
      propertyNoteAccessRequestsAPI.updateVisibleUsers(id, visibleUserIds),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: propertyNoteAccessKeys.detail(vars.id) });
    },
  });
};
