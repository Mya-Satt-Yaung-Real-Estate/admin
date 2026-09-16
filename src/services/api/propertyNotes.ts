import { apiV2Request, QueryParams } from './base';
import type {
  PropertyNote,
  PropertyNoteListFilters,
  PropertyNotesListResponse,
} from '../../types/propertyNote';

function buildQueryString(params?: PropertyNoteListFilters): string {
  if (!params) return '';

  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (value === 'all') return false;
      return true;
    })
  );

  return Object.keys(filtered).length > 0
    ? `?${new URLSearchParams(filtered as Record<string, string>).toString()}`
    : '';
}

/**
 * Admin V2 Property Notes API (read list / show).
 */
export const propertyNotesAPI = {
  list: async (params?: PropertyNoteListFilters): Promise<PropertyNotesListResponse> => {
    const queryString = buildQueryString(params);
    const response = await apiV2Request<PropertyNote[]>(`/property-notes${queryString}`);
    const raw = response as PropertyNotesListResponse & QueryParams;

    return {
      success: raw.success,
      message: raw.message,
      data: Array.isArray(raw.data) ? raw.data : [],
      statistics: raw.statistics ?? {
        total: 0,
        active: 0,
        sold: 0,
        rented: 0,
      },
      pagination: raw.pagination,
    };
  },

  get: (id: number) => apiV2Request<PropertyNote>(`/property-notes/${id}`),
};
