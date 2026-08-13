export type ActivityStatus = 'draft' | 'published';

export interface ActivityUser {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  user_type?: string;
  member_level?: string;
  company_id?: number | null;
  company_name?: string | null;
  company_slug?: string | null;
}

export interface ActivityMediaImage {
  id: number;
  type?: string;
  filename: string;
  is_primary?: boolean;
  status?: string;
  url?: string;
  thumbnail_url?: string;
  small_url?: string;
  medium_url?: string;
}

export interface Activity {
  id: number;
  user_id: number;
  slug: string;
  title: string;
  description: string | null;
  status: ActivityStatus;
  show_on_homepage: boolean;
  published_at: string | null;
  user?: ActivityUser | null;
  media?: {
    images?: ActivityMediaImage[];
    primary_image?: ActivityMediaImage | null;
  };
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityStatistics {
  total: number;
  published: number;
  draft: number;
  show_on_homepage: number;
  deleted: number;
}

export interface CreateActivityData {
  user_id?: number;
  is_platform_activity?: boolean;
  title: string;
  description: string;
  status?: ActivityStatus;
  show_on_homepage?: boolean;
  media_ids: number[];
}

export interface UpdateActivityData {
  user_id?: number;
  is_platform_activity?: boolean;
  title?: string;
  description?: string;
  status?: ActivityStatus;
  show_on_homepage?: boolean;
  media_ids?: number[];
}

export interface ActivityQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: ActivityStatus;
  user_id?: number;
  show_on_homepage?: boolean;
  include_deleted?: boolean;
  only_trashed?: boolean;
  sort_by?: 'created_at' | 'published_at' | 'title' | 'status';
  sort_direction?: 'asc' | 'desc';
}
