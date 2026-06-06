import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { youtubeVideosAPI } from '../api/youtubeVideos';
import {
  CreateYoutubeVideoData,
  UpdateYoutubeVideoData,
  YoutubeVideoQueryParams,
} from '../../types/youtubeVideo';

export const youtubeVideoKeys = {
  all: ['youtube-videos'] as const,
  lists: () => [...youtubeVideoKeys.all, 'list'] as const,
  list: (params?: YoutubeVideoQueryParams) => [...youtubeVideoKeys.lists(), params] as const,
  details: () => [...youtubeVideoKeys.all, 'detail'] as const,
  detail: (id: number) => [...youtubeVideoKeys.details(), id] as const,
};

export const useYoutubeVideos = (params?: YoutubeVideoQueryParams) => {
  return useQuery({
    queryKey: youtubeVideoKeys.list(params),
    queryFn: () => youtubeVideosAPI.getYoutubeVideos(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useYoutubeVideo = (id: number) => {
  return useQuery({
    queryKey: youtubeVideoKeys.detail(id),
    queryFn: () => youtubeVideosAPI.getYoutubeVideo(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateYoutubeVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateYoutubeVideoData) => youtubeVideosAPI.createYoutubeVideo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: youtubeVideoKeys.lists() });
    },
  });
};

export const useUpdateYoutubeVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateYoutubeVideoData }) =>
      youtubeVideosAPI.updateYoutubeVideo(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: youtubeVideoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: youtubeVideoKeys.detail(variables.id) });
    },
  });
};

export const useDeleteYoutubeVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => youtubeVideosAPI.deleteYoutubeVideo(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: youtubeVideoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: youtubeVideoKeys.lists() });
    },
  });
};
