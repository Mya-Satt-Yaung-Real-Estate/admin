import { User, Region, Township } from './index';

// Property Types based on API Documentation
export interface Property {
  id: number;
  user_id: number;
  title_en: string;
  title_mm: string;
  description: string;
  property_condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'published' | 'draft' | 'sold' | 'rented';
  verification_status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  price: string;
  formatted_price: string;
  area_sqft: string;
  bedrooms?: number;
  bathrooms?: number;
  bank_installment_available?: boolean;
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
  };
  dates: {
    published_at?: string;
    expires_at?: string;
    created_at: string;
    verified_at?: string;
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
  user?: User;
  property_type?: PropertyType;
  listing_type?: PropertyListingType;
}

export interface CreatePropertyData {
  property_type_id: number;
  listing_type_id: number;
  title_en: string;
  title_mm: string;
  description: string;
  property_condition: 'new' | 'good' | 'fair' | 'poor';
  region_id: number;
  township_id: number;
  address: string;
  latitude?: number;
  longitude?: number;
  price: number;
  area_sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  bank_installment_available?: boolean;
  features?: string[];
  owner_name: string;
  phone_numbers: string[];
  email: string;
  status?: 'published' | 'draft' | 'sold' | 'rented';
  is_featured?: boolean;
  is_verified?: boolean;
  published_at?: string;
  expires_at?: string;
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
