// News & Updates API functions
import { apiRequest, QueryParams } from './base';
import { NewsAndUpdate, CreateNewsAndUpdateData, UpdateNewsAndUpdateData } from '../../types/newsAndUpdate';

export const newsAndUpdatesAPI = {
  // Get list of news and updates
  list: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<NewsAndUpdate[]>(`/news-and-updates${queryString}`);
  },

  // Get single news and update by ID
  get: (id: number) =>
    apiRequest<NewsAndUpdate>(`/news-and-updates/${id}`),

  // Get single news and update by slug
  getBySlug: (slug: string) =>
    apiRequest<NewsAndUpdate>(`/news-and-updates/${slug}`),

  // Create new news and update
  create: (data: CreateNewsAndUpdateData) =>
    apiRequest<NewsAndUpdate>('/news-and-updates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update news and update
  update: (slug: string, data: UpdateNewsAndUpdateData) =>
    apiRequest<NewsAndUpdate>(`/news-and-updates/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete news and update
  delete: (slug: string) =>
    apiRequest(`/news-and-updates/${slug}`, { method: 'DELETE' }),

};
