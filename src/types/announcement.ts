import { BaseEntity } from './index';

// Announcement Types
export type AnnouncementType = 'notification' | 'alert' | 'maintenance' | 'update';

// Announcement Status
export type AnnouncementStatus = 'pending' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';

// Announcement Interface
export interface Announcement extends BaseEntity {
  announcement_type: AnnouncementType;
  all_users: boolean;
  user_ids: number[];
  title: string;
  body: string;
  sent_at?: string;
  created_by: number;
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  users?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  // Scheduling fields
  scheduled_at?: string;
  status: AnnouncementStatus;
  failed_at?: string;
  failure_reason?: string;
  scheduled_by?: number;
  scheduled_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  // Helper flags
  is_scheduled?: boolean;
  is_sent?: boolean;
  is_failed?: boolean;
  is_cancelled?: boolean;
  is_due?: boolean;
}

// Create Announcement Data
export interface CreateAnnouncementData {
  announcement_type: AnnouncementType;
  all_users: boolean;
  user_ids: number[];
  title: string;
  body: string;
  scheduled_at?: string; // ISO 8601 datetime string
}

// Update Announcement Data
export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {}

// Announcement Query Parameters
export interface AnnouncementQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  announcement_type?: AnnouncementType;
  all_users?: boolean;
  is_sent?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// Announcement Statistics
export interface AnnouncementStatistics {
  total_count: number;
  sent_count: number;
  pending_count: number;
  notification_count: number;
  alert_count: number;
  maintenance_count: number;
  update_count: number;
}

// Announcement Type Options
export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { value: 'notification', label: 'Notification' },
] as const;

