/**
 * Admin V2 Property Note Access Request types.
 */

export type PropertyNoteAccessStatus =
  | 'pending'
  | 'admin_approved'
  | 'approved'
  | 'rejected';

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

export interface PropertyNoteAccessStatistics {
  total: number;
  pending: number;
  admin_approved: number;
  approved: number;
  rejected: number;
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
