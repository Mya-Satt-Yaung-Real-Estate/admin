// Locations API functions
import { apiRequest, QueryParams } from './base';
import { Region, Township, Ward, CreateRegionData, UpdateRegionData, CreateTownshipData, UpdateTownshipData, CreateWardData, UpdateWardData, YarpyatTax, CreateYarpyatTaxData, UpdateYarpyatTaxData } from '../../types/location';

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

  // Wards
  getWards: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<Ward[]>(`/wards${queryString}`);
  },

  getWard: (slug: string) =>
    apiRequest<Ward>(`/wards/${slug}`),

  createWard: (data: CreateWardData) =>
    apiRequest<Ward>('/wards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWard: (slug: string, data: UpdateWardData) =>
    apiRequest<Ward>(`/wards/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteWard: (slug: string) =>
    apiRequest(`/wards/${slug}`, { method: 'DELETE' }),

  // YarpyatTax
  getYarpyatTaxes: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<YarpyatTax[]>(`/yarpyat${queryString}`);
  },

  getYarpyatTax: (slug: string) =>
    apiRequest<YarpyatTax>(`/yarpyat/${slug}`),

  createYarpyatTax: (data: CreateYarpyatTaxData) =>
    apiRequest<YarpyatTax>('/yarpyat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateYarpyatTax: (slug: string, data: UpdateYarpyatTaxData) =>
    apiRequest<YarpyatTax>(`/yarpyat/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteYarpyatTax: (slug: string) =>
    apiRequest(`/yarpyat/${slug}`, { method: 'DELETE' }),
};
