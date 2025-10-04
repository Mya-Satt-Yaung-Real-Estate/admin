import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsAPI } from '../api/announcements';
import { AnnouncementQueryParams } from '../../types/announcement';
import { CreateAnnouncementData, UpdateAnnouncementData } from '../../types/announcement';
import { QueryParams } from '../api/base';

// Query keys for announcements
export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...announcementKeys.lists(), params] as const,
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: number) => [...announcementKeys.details(), id] as const,
  statistics: () => [...announcementKeys.all, 'statistics'] as const,
};

// Get announcement statistics
export const useAnnouncementStatistics = () => {
  return useQuery({
    queryKey: announcementKeys.statistics(),
    queryFn: () => announcementsAPI.statistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};

// Get list of announcements
export const useAnnouncements = (params?: AnnouncementQueryParams) => {
  return useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: () => announcementsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single announcement
export const useAnnouncement = (id: number) => {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => announcementsAPI.get(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create announcement
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementData) => announcementsAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch announcements lists
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.statistics() });
    },
  });
};

// Update announcement
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAnnouncementData }) =>
      announcementsAPI.update(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch announcements lists
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      // Invalidate the specific announcement to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.id) });
    },
  });
};

// Delete announcement
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => announcementsAPI.delete(id),
    onSuccess: (_, id) => {
      // Remove the specific announcement from cache
      queryClient.removeQueries({ queryKey: announcementKeys.detail(id) });
      // Invalidate and refetch announcements lists
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.statistics() });
    },
  });
};

// Send announcement
export const useSendAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => announcementsAPI.send(id),
    onSuccess: (data, id) => {
      // Update the specific announcement in cache
      queryClient.setQueryData(
        announcementKeys.detail(id),
        data
      );
      // Invalidate and refetch announcements lists
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.statistics() });
    },
  });
};

