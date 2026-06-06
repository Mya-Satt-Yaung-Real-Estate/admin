import { apiRequest } from './base';
import {
  CreateYoutubeVideoData,
  UpdateYoutubeVideoData,
  YoutubeVideo,
  YoutubeVideoQueryParams,
} from '../../types/youtubeVideo';

function buildCleanQueryString(params?: Record<string, any>): string {
  if (!params) return '';

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

  return Object.keys(filteredParams).length > 0
    ? `?${new URLSearchParams(filteredParams as any).toString()}`
    : '';
}

export const youtubeVideosAPI = {
  getYoutubeVideos: (params?: YoutubeVideoQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<YoutubeVideo[]>(`/youtube-videos${queryString}`);
  },

  getYoutubeVideo: (id: number) => {
    return apiRequest<YoutubeVideo>(`/youtube-videos/${id}`);
  },

  createYoutubeVideo: (data: CreateYoutubeVideoData) => {
    return apiRequest<YoutubeVideo>('/youtube-videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateYoutubeVideo: (id: number, data: UpdateYoutubeVideoData) => {
    return apiRequest<YoutubeVideo>(`/youtube-videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteYoutubeVideo: (id: number) => {
    return apiRequest(`/youtube-videos/${id}`, { method: 'DELETE' });
  },
};
