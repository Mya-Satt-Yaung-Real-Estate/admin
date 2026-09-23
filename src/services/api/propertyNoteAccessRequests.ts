import { apiV2Request, QueryParams } from './base';
import type {
  PropertyNoteAccessAddDevicesPayload,
  PropertyNoteAccessChangeScopePayload,
  PropertyNoteAccessChangeScopeResult,
  PropertyNoteAccessDetail,
  PropertyNoteAccessGrantDevice,
  PropertyNoteAccessGrantOptions,
  PropertyNoteAccessGrantPayload,
  PropertyNoteAccessGrantResult,
  PropertyNoteAccessRequest,
  PropertyNoteAccessRequestFilters,
  PropertyNoteAccessRequestsListResponse,
  PropertyNoteAccessUserSummary,
  PropertyNoteAccessVisibleUser,
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
    const response = await apiV2Request<PropertyNoteAccessUserSummary[]>(
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
        revoked: 0,
      },
      pagination: raw.pagination,
    };
  },

  get: (id: number) =>
    apiV2Request<PropertyNoteAccessDetail>(`/property-note-access-requests/${id}`),

  getGrantOptions: () =>
    apiV2Request<PropertyNoteAccessGrantOptions>('/property-note-access-requests/grant-options'),

  getUserDevices: (userId: number) =>
    apiV2Request<PropertyNoteAccessGrantDevice[]>(
      `/property-note-access-requests/user-devices?user_id=${userId}`
    ),

  /**
   * Path A: Admin grants access with optional points / expiry / approver flags.
   */
  grant: (payload: PropertyNoteAccessGrantPayload) =>
    apiV2Request<PropertyNoteAccessGrantResult>('/property-note-access-requests/grant', {
      method: 'POST',
      body: JSON.stringify({
        user_id: payload.user_id,
        charge_points: payload.charge_points ?? true,
        apply_expiry: payload.apply_expiry ?? true,
        require_approver: payload.require_approver ?? true,
        visible_user_ids: payload.visible_user_ids ?? [],
        device_ids: payload.device_ids ?? [],
      }),
    }),

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

  /**
   * Revoke approved access only. Does not refund points or revoke the user account.
   */
  revoke: (id: number) =>
    apiV2Request<PropertyNoteAccessRequest>(`/property-note-access-requests/${id}/revoke`, {
      method: 'POST',
    }),

  addDevices: (id: number, payload: PropertyNoteAccessAddDevicesPayload) =>
    apiV2Request<{
      access: PropertyNoteAccessRequest | null;
      awaiting_approver: boolean;
      points_consumed: number;
      device_ids: string[];
    }>(`/property-note-access-requests/${id}/devices`, {
      method: 'POST',
      body: JSON.stringify({
        device_ids: payload.device_ids,
        charge_points: payload.charge_points ?? false,
        apply_expiry: payload.apply_expiry ?? false,
        require_approver: payload.require_approver ?? false,
      }),
    }),

  /**
   * Switch Any-device ↔ selected devices (no point charge).
   */
  changeScope: (id: number, payload: PropertyNoteAccessChangeScopePayload) =>
    apiV2Request<PropertyNoteAccessChangeScopeResult>(
      `/property-note-access-requests/${id}/change-scope`,
      {
        method: 'POST',
        body: JSON.stringify({
          scope: payload.scope,
          ...(payload.scope === 'devices'
            ? { device_ids: payload.device_ids ?? [] }
            : {}),
        }),
      }
    ),

  updateVisibleUsers: (id: number, visibleUserIds: number[]) =>
    apiV2Request<{
      visible_user_ids: number[];
      visible_users: PropertyNoteAccessVisibleUser[];
    }>(`/property-note-access-requests/${id}/visible-users`, {
      method: 'PUT',
      body: JSON.stringify({
        visible_user_ids: visibleUserIds,
      }),
    }),
};
