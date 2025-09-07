
// Event Category Types
export interface HousingEventCategory {
  id: number;
  name_en: string;
  name_mm: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  housing_events_count?: number;
}

export interface CreateHousingEventCategoryData {
  name_en: string;
  name_mm: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateHousingEventCategoryData extends Partial<CreateHousingEventCategoryData> {}

export interface HousingEventCategoryFilters {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
  include_deleted?: boolean;
}

// Event Types
export interface HousingEvent {
  id: number;
  name_en: string;
  name_mm: string;
  slug: string;
  description?: string;
  tag?: string[];
  event_type?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  host_contact_number: string;
  is_free: boolean;
  price?: string;
  need_registration: boolean;
  is_online: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'done';
  published_at?: string;
  registration_user_count: number;
  user_capacity?: number;
  is_active: boolean;
  created_at: string;
  deleted_at?: string;
  
  // Additional fields for edit form
  housing_event_category_id: number;
  region_id?: number;
  township_id?: number;
  
  // Relationships
  host_user?: {
    user_id: number;
    company_name: string;
  };
  category?: {
    id: number;
    name_en: string;
    name_mm: string;
  };
  region?: {
    id: number;
    name_en: string;
    name_mm: string;
  };
  township?: {
    id: number;
    name_en: string;
    name_mm: string;
  };
  images?: {
    id: number;
    type: string;
    filename: string;
    is_primary: boolean;
    status: string;
    url: string;
    small_url: string;
    medium_url: string;
    thumbnail_url: string;
  };
}

export interface CreateHousingEventData {
  name_en: string;
  name_mm: string;
  slug?: string;
  description: string;
  tag?: string[];
  housing_event_category_id: number;
  event_type?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  region_id?: number;
  township_id?: number;
  host_user_id: number;
  host_contact_number: string;
  is_free?: boolean;
  price?: number;
  need_registration?: boolean;
  is_online?: boolean;
  status?: 'draft' | 'published' | 'cancelled' | 'done';
  published_at?: string;
  registration_user_count?: number;
  user_capacity?: number;
  media_ids: number[];
  is_active?: boolean;
}

export interface UpdateHousingEventData extends Partial<CreateHousingEventData> {}

export interface HousingEventFilters {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'done';
  category_id?: number;
  region_id?: number;
  township_id?: number;
  include_deleted?: boolean;
}

// Media interface (if not already defined)
export interface Media {
  id: number;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  formatted_size: string;
  mime_type: string;
  is_primary?: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}
