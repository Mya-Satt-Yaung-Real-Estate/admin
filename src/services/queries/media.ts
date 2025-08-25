import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaAPI } from '../api/media';
import { UploadMediaRequest } from '../../types/media';

// Query keys for media
export const mediaKeys = {
  all: ['media'] as const,
  uploads: () => [...mediaKeys.all, 'upload'] as const,
};

// Upload media mutation
export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadMediaRequest) => mediaAPI.upload(data),
    onSuccess: () => {
      // Invalidate media queries if needed
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
};

// Delete media mutation
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: number) => mediaAPI.delete(mediaId),
    onSuccess: () => {
      // Invalidate media queries if needed
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
};


