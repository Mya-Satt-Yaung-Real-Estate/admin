// Advertisement Types based on updated API documentation
export interface Advertisement {
  id: number;
  user_id: number;
  title_en: string;
  title_mm: string;
  description: string;
  advertisement_type?: 'for_rent' | 'for_sale';
  region_id: number | null;
  township_id: number | null;
  address: string;
  contact_name: string;
  phone_numbers: string[];
  email: string;
  status: 'draft' | 'published' | 'expired' | 'rejected';
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  verified_by?: number;
  rejection_reason?: string;
  is_featured: boolean;
  view_count: number;
  contact_count: number;
  favorite_count: number;
  published_at?: string;
  expires_at?: string;
  last_renewed_at?: string;
  renewal_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted?: boolean;

  // User info (simplified in list response)
  user?: {
    id: number;
    name: string;
    slug: string;
    email: string;
    user_type: 'individual' | 'company';
    member_level: string;
    is_active: boolean;
    point_balance: number;
    property_count: number | null;
    deleted_at: string | null;
  };
  user_type?: string;

  // Location objects (nullable)
  region?: {
    id: number;
    name_en: string;
    name_mm: string;
  } | null;
  township?: {
    id: number;
    name_en: string;
    name_mm: string;
  } | null;
  verifiedBy?: {
    id: number;
    name: string;
    email?: string;
  };

  // Computed properties (simplified in list response)
  is_published?: boolean;
  is_draft?: boolean;
  is_expired?: boolean;
  age_in_days?: number;
  is_expiring_soon?: boolean;

  // Location object (simplified in list response)
  location?: {
    region: {
      id: number;
      name_en: string;
      name_mm: string;
    } | null;
    township: {
      id: number;
      name_en: string;
      name_mm: string;
    } | null;
    address: string;
  };

  // Contact info object
  contact_info?: {
    contact_name: string;
    phone_numbers: string[];
    email: string;
  };

  // Stats object
  stats?: {
    view_count: number;
    contact_count: number;
    favorite_count: number;
  };

  // Dates object
  dates?: {
    published_at?: string;
    expires_at?: string;
    created_at: string;
    verified_at?: string;
    last_renewed_at?: string;
  };

  // Renewal info object
  renewal_info?: {
    renewal_count: number;
  };

  // Advertisement mode
  advertisement_mode?: 'platform' | 'user';

  // Media object
  media?: {
    images: Media[];
    videos: Media[];
    primary_image?: Media;
  };
}

export interface Media {
  id: number;
  url: string;
  thumbnail_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  media_type?: 'image' | 'video';
  is_primary: boolean;
  display_order?: number;
  duration?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdvertisementFilters {
  // Pagination
  page?: number;
  per_page?: number;
  
  // Search and filters
  search?: string;
  status?: string;
  verification_status?: string;
  advertisement_type?: 'for_rent' | 'for_sale';
  featured?: boolean;
  user_id?: number;
  region_id?: number;
  township_id?: number;
  date_from?: string;
  date_to?: string;
  expiring_soon?: boolean;
  
  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  
  // Legacy filter names for compatibility
  searchTerm?: string;
  statusFilter?: string;
  verificationFilter?: string;
  featuredFilter?: string;
  
  [key: string]: any;
}

export interface AdvertisementListResponse {
  success: boolean;
  message: string;
  data: Advertisement[];
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

export interface AdvertisementResponse {
  success: boolean;
  message: string;
  data: Advertisement;
}

export interface AdvertisementStatistics {
  total: number;
  draft: number;
  published: number;
  expired: number;
  rejected: number;
  pending_verification: number;
  approved: number;
  featured: number;
  total_views: number;
  total_contacts: number;
  total_favorites: number;
  recent_uploads: number;
  expiring_soon: number;
}

export interface AdvertisementStatisticsResponse {
  success: boolean;
  message: string;
  data: AdvertisementStatistics;
}

export interface AdvertisementFormData {
  is_platform_advertisement?: boolean;
  user_id?: number;
  title_en: string;
  title_mm: string;
  description: string;
  advertisement_type?: 'for_rent' | 'for_sale';
  region_id?: number | null;
  township_id?: number | null;
  address: string;
  contact_name: string;
  phone_numbers: string[];
  email: string;
  status?: string;
  rejection_reason?: string;
  is_featured?: boolean;
  expires_at?: string;
  media_ids?: number[];
}

// Status options
export const ADVERTISEMENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const ADVERTISEMENT_TYPES = [
  { value: 'for_sale', label: 'For Sale' },
  { value: 'for_rent', label: 'For Rent' },
] as const;

export type AdvertisementStatus = typeof ADVERTISEMENT_STATUSES[number]['value'];

// Verification status options
export const VERIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUSES[number]['value'];

// Sort options
export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'published_at', label: 'Published Date' },
  { value: 'expires_at', label: 'Expiration Date' },
  { value: 'view_count', label: 'Views' },
  { value: 'favorite_count', label: 'Favorites' },
  { value: 'contact_count', label: 'Contacts' },
  { value: 'title_en', label: 'Title' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];

// Filter options
export const FILTER_OPTIONS = {
  status: [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'expired', label: 'Expired' },
    { value: 'rejected', label: 'Rejected' },
  ],
  verification: [
    { value: 'all', label: 'All Verifications' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ],
  featured: [
    { value: 'all', label: 'All Advertisements' },
    { value: 'featured', label: 'Featured Only' },
    { value: 'not_featured', label: 'Not Featured' },
  ],
} as const;
