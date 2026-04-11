// AD Types based on AdsController API documentation
export interface AD {
  id: number;
  user_id: number;
  title_en: string | null;
  title_mm: string | null;
  description_en: string | null;
  description_mm: string | null;
  link: string | null;
  link_type: 'button_link' | 'text_link' | 'image_link' | null;
  link_text?: string | null;
  text_color_code?: string | null;
  price?: number;
  status: boolean;
  is_paid: boolean;
  is_published: boolean;
  display_location: 'homepage_block' | 'home-page-asidebar' | 'detail-page-asidebar' | 'home_grid_ads';
  grid_index?: number | null;
  payment_date?: string | null;
  start_at?: string;
  end_at?: string;
  media_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // User info
  user?: {
    id: number;
    name: string;
    email: string;
    user_type: 'admin' | 'individual' | 'company';
  };

  // Media info
  media?: {
    id: number;
    filename: string;
    url: string;
    thumbnail_url?: string;
    type: 'image' | 'video';
    size?: number;
    mime_type?: string;
    is_primary: boolean;
    status: 'completed' | 'uploading' | 'failed';
  };
  
  // Status flags
  is_deleted?: boolean;
  is_active?: boolean;
}

export interface ADFormData {
  title_en: string | null;
  title_mm: string | null;
  description_en: string | null;
  description_mm: string | null;
  link: string | null;
  link_type: 'button_link' | 'text_link' | 'image_link' | null;
  link_text?: string | null;
  text_color_code?: string | null;
  price?: number;
  status: boolean;
  is_paid: boolean;
  is_published: boolean;
  display_location: 'homepage_block' | 'home-page-asidebar' | 'detail-page-asidebar' | 'home_grid_ads';
  grid_index?: number | null;
  payment_date?: string | null;
  start_at?: string;
  end_at?: string;
  media_id: number;
}

export interface ADFilters {
  // Pagination
  page?: number;
  per_page?: number;

  // Search and filters
  search?: string;
  status?: string;
  display_location?: string;
  is_paid?: boolean;
  is_published?: boolean;
  user_id?: number;
  date_from?: string;
  date_to?: string;

  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';

  [key: string]: any;
}

export interface ADListResponse {
  success: boolean;
  message: string;
  data: AD[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

export interface ADResponse {
  success: boolean;
  message: string;
  data: AD;
}

export interface ADStatistics {
  total: number;
  active: number;
  inactive: number;
  paid: number;
  unpaid: number;
  homepage_slider: number;
  homepage_asidebar: number;
  detail_page_asidebar: number;
}

export interface ADStatisticsResponse {
  success: boolean;
  message: string;
  data: ADStatistics;
}

// Display location limits
export const DISPLAY_LOCATION_LIMITS = {
  'homepage_block': 3,       // Maximum 3 active ads
  'home-page-asidebar': 3,   // Maximum 3 active ads
  'detail-page-asidebar': 3, // Maximum 3 active ads
  'home_grid_ads': 3,        // Per grid slot (grid_index 1–4)
} as const;

// Status options
export const AD_STATUSES = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
] as const;

// Link type options
export const AD_LINK_TYPES = [
  { value: 'button_link', label: 'Button Link' },
  { value: 'text_link', label: 'Text Link' },
  { value: 'image_link', label: 'Image Link' },
] as const;

// Display location options
export const AD_DISPLAY_LOCATIONS = [
  { value: 'homepage_block', label: 'Homepage Block' },
  { value: 'home-page-asidebar', label: 'Home Page Sidebar' },
  { value: 'detail-page-asidebar', label: 'Detail Page Sidebar' },
  { value: 'home_grid_ads', label: 'Home Grid ADS' },
] as const;