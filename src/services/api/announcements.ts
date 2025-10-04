// Announcements API functions
import { apiRequest } from './base';
import { Announcement, CreateAnnouncementData, UpdateAnnouncementData, AnnouncementQueryParams, AnnouncementStatistics } from '../../types/announcement';

// Reusable utility function to filter out undefined/null/empty values from query params
function buildCleanQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
  
  const queryString = Object.keys(filteredParams).length > 0 ? '?' + new URLSearchParams(filteredParams as any).toString() : '';
  
  return queryString;
}

export const announcementsAPI = {
  // Get announcement statistics
  statistics: () => {
    return apiRequest<AnnouncementStatistics>('/announcements/statistics');
  },

  // Get list of announcements
  list: (params?: AnnouncementQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<Announcement[]>(`/announcements${queryString}`);
  },

  // Get single announcement
  get: (id: number) =>
    apiRequest<Announcement>(`/announcements/${id}`),

  // Get single announcement by ID (alias for get)
  getById: (id: number) =>
    apiRequest<Announcement>(`/announcements/${id}`),

  // Create new announcement
  create: (data: CreateAnnouncementData) =>
    apiRequest<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update announcement
  update: (id: number, data: UpdateAnnouncementData) =>
    apiRequest<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete announcement
  delete: (id: number) =>
    apiRequest(`/announcements/${id}`, { method: 'DELETE' }),

  // Send announcement
  send: (id: number) =>
    apiRequest<Announcement>(`/announcements/${id}/send`, { method: 'POST' }),

};
