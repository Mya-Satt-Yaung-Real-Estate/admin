// Locations API functions
import { apiRequest, QueryParams } from './base';
import { Region, Township, CreateRegionData, UpdateRegionData, CreateTownshipData, UpdateTownshipData } from '../../types/location';

export const locationsAPI = {
  // Regions
  getRegions: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<Region[]>(`/regions${queryString}`);
  },

  getRegion: (slug: string) =>
    apiRequest<Region>(`/regions/${slug}`),

  createRegion: (data: CreateRegionData) =>
    apiRequest<Region>('/regions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRegion: (slug: string, data: UpdateRegionData) =>
    apiRequest<Region>(`/regions/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRegion: (slug: string) =>
    apiRequest(`/regions/${slug}`, { method: 'DELETE' }),

  // Townships
  getTownships: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<Township[]>(`/townships${queryString}`);
  },

  getTownship: (slug: string) =>
    apiRequest<Township>(`/townships/${slug}`),

  createTownship: (data: CreateTownshipData) =>
    apiRequest<Township>('/townships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTownship: (slug: string, data: UpdateTownshipData) =>
    apiRequest<Township>(`/townships/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTownship: (slug: string) =>
    apiRequest(`/townships/${slug}`, { method: 'DELETE' }),
};
