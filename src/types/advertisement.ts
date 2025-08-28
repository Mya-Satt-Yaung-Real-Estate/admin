// Advertisement Types based on API documentation
export interface Advertisement {
  id: number;
  user_id: number;
  property_type_id: number;
  listing_type_id: number;
  title_en: string;
  title_mm: string;
  description: string;
  price: {
    amount: number;
    type: string;
    type_label: string;
    formatted: string;
  } | null;
  region_id: number;
  township_id: number;
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
  user?: string;
  user_type?: string;
  propertyType?: {
    id: number;
    name_en: string;
    name_mm: string;
    slug?: string;
  };
  listingType?: {
    id: number;
    name_en: string;
    name_mm: string;
    slug?: string;
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
      name_en: string;
      name_mm: string;
    };
    township: {
      name_en: string;
      name_mm: string;
    };
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
  featured?: boolean;
  user_id?: number;
  property_type_id?: number;
  listing_type_id?: number;
  region_id?: number;
  township_id?: number;
  price_min?: number;
  price_max?: number;
  price_type?: string;
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
  propertyTypeFilter?: string;
  listingTypeFilter?: string;
  priceTypeFilter?: string;
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
  user_id?: number;
  property_type_id: number;
  listing_type_id: number;
  title_en: string;
  title_mm: string;
  description: string;
  price?: number;
  price_type?: string;
  region_id: number;
  township_id: number;
  address: string;
  contact_name: string;
  phone_numbers: string[];
  email: string;
  status?: string;
  verification_status?: string;
  rejection_reason?: string;
  is_featured?: boolean;
  expires_at?: string;
  media_ids?: number[];
}

// Price type options
export const PRICE_TYPES = [
  { value: 'monthly_rent', label: 'Monthly Rent' },
  { value: 'yearly_rent', label: 'Yearly Rent' },
  { value: 'sale_price', label: 'Sale Price' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'contact_for_price', label: 'Contact for Price' },
  { value: 'free', label: 'Free' },
] as const;

export type PriceType = typeof PRICE_TYPES[number]['value'];

// Status options
export const ADVERTISEMENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
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
  { value: 'price', label: 'Price' },
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
