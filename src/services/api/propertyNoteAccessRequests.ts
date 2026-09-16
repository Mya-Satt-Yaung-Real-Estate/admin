import { apiV2Request, QueryParams } from './base';
import type {
  PropertyNoteAccessRequest,
  PropertyNoteAccessRequestFilters,
  PropertyNoteAccessRequestsListResponse,
} from '../../types/propertyNoteAccess';

function buildQueryString(params?: PropertyNoteAccessRequestFilters): string {
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
 * Admin V2 Property Note Access Requests API.
 */
export const propertyNoteAccessRequestsAPI = {
  list: async (
    params?: PropertyNoteAccessRequestFilters
  ): Promise<PropertyNoteAccessRequestsListResponse> => {
    const queryString = buildQueryString(params);
    const response = await apiV2Request<PropertyNoteAccessRequest[]>(
      `/property-note-access-requests${queryString}`
    );
    const raw = response as PropertyNoteAccessRequestsListResponse & QueryParams;
    return {
      success: raw.success,
      message: raw.message,
      data: Array.isArray(raw.data) ? raw.data : [],
      statistics: raw.statistics ?? {
        total: 0,
        pending: 0,
        admin_approved: 0,
        approved: 0,
        rejected: 0,
      },
      pagination: raw.pagination,
    };
  },

  get: (id: number) =>
    apiV2Request<PropertyNoteAccessRequest>(`/property-note-access-requests/${id}`),

  approve: (id: number) =>
    apiV2Request<PropertyNoteAccessRequest>(`/property-note-access-requests/${id}/approve`, {
      method: 'POST',
    }),

  reject: (id: number, rejectReason?: string) =>
    apiV2Request<PropertyNoteAccessRequest>(`/property-note-access-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({
        reject_reason: rejectReason ?? null,
      }),
    }),
};
