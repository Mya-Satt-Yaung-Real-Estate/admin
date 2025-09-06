import { RegularUser, Region, Township } from './index';

// Property Types based on API Documentation
export interface Property {
  id: number;
  user_id: number;
  property_mode: 'platform' | 'user';
  title_en: string;
  title_mm: string;
  description: string;
  property_condition: 'ready' | 'some' | 'no';
  status: 'published' | 'draft' | 'sold' | 'rented';
  verification_status: 'pending' | 'approved' | 'rejected';
  price: string;
  formatted_price: string;
  area_sqft: string;
  bedrooms?: number;
  bathrooms?: number;
  bank_installment_available?: boolean;
  tan_tan_tan?: boolean;
  features?: string[];
  location: {
    region: Region;
    township: Township;
    address: string;
    latitude?: string;
    longitude?: string;
    location_string: string;
    location_string_mm: string;
  };
  contact_info: {
    owner_name: string;
    phone_numbers: string[];
    email: string;
  };
  stats: {
    view_count: number;
    contact_count: number;
    favorite_count: number;
    like_count: number;
    comment_count: number;
  };
  dates: {
    published_at?: string;
    expires_at?: string;
    created_at: string;
    verified_at?: string;
    last_renewed_at?: string;
    deleted_at?: string;
  };
  rejection_reason?: string;
  is_published: boolean;
  is_draft: boolean;
  is_sold: boolean;
  is_rented: boolean;
  is_expired: boolean;
  can_be_published: boolean;
  is_approved: boolean;
  is_pending_approval: boolean;
  is_rejected: boolean;
  is_deleted: boolean;
  renewal_info?: {
    renewal_count: number;
    renewal_notes?: string;
  };
  media?: {
    images: Array<{
      id: number;
      type: string;
      filename: string;
      is_primary: boolean;
      status: string;
      url: string;
      small_url: string;
      medium_url: string;
      thumbnail_url: string;
    }>;
    videos: Array<{
      id: number;
      type: string;
      filename: string;
      status: string;
      url: string;
      thumbnail_url?: string;
    }>;
    primary_image?: {
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
  };
  user?: RegularUser;
  property_type?: PropertyType;
  listing_type?: PropertyListingType;
}

export interface CreatePropertyData {
  // Dual-mode fields
  is_platform_property: boolean;
  user_id?: number; // Required only for user properties
  
  // Basic property information
  property_type_id: number;
  listing_type_id: number;
  title_en: string;
  title_mm: string;
  description: string;
  property_condition: 'ready' | 'some' | 'no';
  
  // Location information
  region_id: number;
  township_id: number;
  address: string;
  latitude?: number;
  longitude?: number;
  
  // Property details
  price: number;
  area_sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  bank_installment_available?: boolean;
  tan_tan_tan?: boolean;
  features?: string[];
  
  // Contact information
  owner_name: string;
  phone_numbers: string[];
  email: string;
  
  // Status and settings
  status?: 'published' | 'draft' | 'sold' | 'rented';
  is_featured?: boolean;
  
  // Media
  media_ids?: number[];
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {}

export interface PropertyFilters {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Property Type
export interface PropertyType {
  id: number;
  name_mm: string;
  name_en: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

export interface CreatePropertyTypeData {
  name_mm: string;
  name_en: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePropertyTypeData {
  name_mm?: string;
  name_en?: string;
  description?: string;
  is_active?: boolean;
}

// Property Listing Type
export interface PropertyListingType {
  id: number;
  name_mm: string;
  name_en: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface CreatePropertyListingTypeData {
  name_mm: string;
  name_en: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdatePropertyListingTypeData {
  name_mm?: string;
  name_en?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

// Property Verification
export interface PropertyVerificationData {
  action: 'approve' | 'reject';
  reason?: string;
}

// Property Renewal
export interface PropertyRenewalData {
  notes?: string;
}

export interface PropertyRenewalResponse {
  property: Property;
  renewal_info: {
    previous_expiry: string | null;
    new_expiry: string | null;
    duration_days: number;
    points_consumed: number;
    renewed_by: 'admin' | 'user';
    renewed_at: string;
    notes: string | null;
    property_owner_type: string;
  };
}
