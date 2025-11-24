// AD Types based on AdsController API documentation
export interface AD {
  id: number;
  user_id: number;
  title_en: string;
  title_mm: string;
  slug: string;
  description_en: string;
  description_mm: string;
  link: string;
  link_type: 'button_link' | 'text_link' | 'image_link';
  link_text?: string;
  price?: number;
  status: boolean;
  is_paid: boolean;
  is_published: boolean;
  display_location: 'homepage-slider' | 'home-page-asidebar' | 'detail-page-asidebar';
  payment_date?: string;
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
  title_en: string;
  title_mm: string;
  slug: string;
  description_en: string;
  description_mm: string;
  link: string;
  link_type: 'button_link' | 'text_link' | 'image_link';
  link_text?: string;
  price?: number;
  status: boolean;
  is_paid: boolean;
  is_published: boolean;
  display_location: 'homepage-slider' | 'home-page-asidebar' | 'detail-page-asidebar';
  payment_date?: string;
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
  'homepage-slider': 5,      // Maximum 5 active ads
  'home-page-asidebar': 1,   // Maximum 1 active ad
  'detail-page-asidebar': 1, // Maximum 1 active ad
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
  { value: 'homepage-slider', label: 'Homepage Slider' },
  { value: 'home-page-asidebar', label: 'Home Page Sidebar' },
  { value: 'detail-page-asidebar', label: 'Detail Page Sidebar' },
] as const;