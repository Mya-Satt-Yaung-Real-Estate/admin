/**
 * Admin V2 Property Note Access Request types.
 */

export type PropertyNoteAccessStatus =
  | 'pending'
  | 'admin_approved'
  | 'approved'
  | 'rejected'
  | 'revoked';

export interface PropertyNoteAccessUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  user_type: string | null;
  current_point_balance: number;
}

export interface PropertyNoteAccessAdmin {
  id: number;
  name: string;
  email: string | null;
}

export interface PropertyNoteAccessApprover {
  id: number;
  name: string;
  phone: string | null;
}

export interface PropertyNoteAccessRequest {
  id: number;
  status: PropertyNoteAccessStatus;
  source: string | null;
  points_amount: number;
  apply_expiry: boolean;
  device_id: string | null;
  reject_reason: string | null;
  created_at: string | null;
  admin_approved_at: string | null;
  approved_at: string | null;
  unlocked_at: string | null;
  expires_at: string | null;
  user: PropertyNoteAccessUser | null;
  admin: PropertyNoteAccessAdmin | null;
  approver: PropertyNoteAccessApprover | null;
}

export interface PropertyNoteAccessGrantPayload {
  user_id: number;
  charge_points?: boolean;
  apply_expiry?: boolean;
  require_approver?: boolean;
  /**
   * Users whose notes/pins the grantee may see on the map.
   */
  visible_user_ids?: number[];
  /**
   * Empty = user-only (any device). Non-empty = grant each device_id.
   */
  device_ids?: string[];
}

export interface PropertyNoteAccessGrantDevice {
  id: number;
  device_id: string;
  device_name?: string | null;
  device_model?: string | null;
  platform: string;
  os_version?: string | null;
  app_version?: string | null;
  last_seen_at?: string | null;
  created_at: string;
}

export interface PropertyNoteAccessGrantOptions {
  unlock_point_cost: number;
  access_days: number;
  defaults: {
    charge_points: boolean;
    apply_expiry: boolean;
    require_approver: boolean;
  };
  /**
   * Users with user-only usable access or a pending / admin_approved request.
   */
  blocked_user_ids: number[];
}

export interface PropertyNoteAccessGrantResult {
  access: PropertyNoteAccessRequest | null;
  awaiting_approver: boolean;
  points_consumed: number;
  remaining_balance: number;
  visible_user_ids?: number[];
  device_ids?: string[];
}

export interface PropertyNoteAccessVisibleUser {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface PropertyNoteAccessDetail {
  access: PropertyNoteAccessRequest;
  related_grants: PropertyNoteAccessRequest[];
  registered_devices: PropertyNoteAccessGrantDevice[];
  visible_users: PropertyNoteAccessVisibleUser[];
}

export interface PropertyNoteAccessAddDevicesPayload {
  device_ids: string[];
  charge_points?: boolean;
  apply_expiry?: boolean;
  require_approver?: boolean;
}

export interface PropertyNoteAccessStatistics {
  total: number;
  pending: number;
  admin_approved: number;
  approved: number;
  rejected: number;
  revoked: number;
}

export interface PropertyNoteAccessRequestFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: PropertyNoteAccessStatus | 'all' | '';
  source?: string;
}

export interface PropertyNoteAccessRequestsListResponse {
  success: boolean;
  message: string;
  data: PropertyNoteAccessRequest[];
  statistics: PropertyNoteAccessStatistics;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
}
