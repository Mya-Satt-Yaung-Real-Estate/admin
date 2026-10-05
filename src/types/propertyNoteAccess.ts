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
  /**
   * From user_devices (name or model). Null for Any-device / unknown.
   */
  device_name?: string | null;
  reject_reason: string | null;
  created_at: string | null;
  /**
   * ISO timestamp — used to detect latest live scope after revoke / scope switch.
   */
  updated_at?: string | null;
  admin_approved_at: string | null;
  approved_at: string | null;
  unlocked_at: string | null;
  expires_at: string | null;
  user: PropertyNoteAccessUser | null;
  admin: PropertyNoteAccessAdmin | null;
  approver: PropertyNoteAccessApprover | null;
}

/**
 * Access List row — one unique user with grant summary (API grouped).
 */
export interface PropertyNoteAccessActionBy {
  name: string;
}

export interface PropertyNoteAccessUserSummary {
  user_id: number;
  user: PropertyNoteAccessUser | null;
  primary_status: PropertyNoteAccessStatus;
  grants_count: number;
  counts: {
    pending: number;
    admin_approved: number;
    approved: number;
    rejected: number;
    revoked: number;
  };
  scope_label: string;
  has_any_device: boolean;
  approved_device_count: number;
  /**
   * Grant id to open on Detail (most actionable).
   */
  detail_access_id: number;
  expires_at: string | null;
  last_requested_at: string | null;
  /**
   * Who acted on detail grant (approve / reject / revoke).
   */
  action_by: PropertyNoteAccessActionBy | null;
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
  /**
   * True when revoke blocks Path B until Admin re-actives.
   */
  point_unlock_blocked_by_revoke?: boolean;
}

export interface PropertyNoteAccessAddDevicesPayload {
  device_ids: string[];
  charge_points?: boolean;
  apply_expiry?: boolean;
  require_approver?: boolean;
}

/**
 * Admin switch: Any-device ↔ selected devices.
 */
export interface PropertyNoteAccessChangeScopePayload {
  scope: 'user_only' | 'devices';
  device_ids?: string[];
}

export interface PropertyNoteAccessChangeScopeResult {
  access: PropertyNoteAccessRequest | null;
  scope: 'user_only' | 'devices';
  revoked_ids: number[];
  created_ids: number[];
  device_ids: string[];
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
  data: PropertyNoteAccessUserSummary[];
  statistics: PropertyNoteAccessStatistics;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
}
