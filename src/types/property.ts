import { User, Region, Township } from './index';

// Property Types based on API Documentation
export interface Property {
  id: number;
  title_en: string;
  title_mm: string;
  description: string;
  price: number;
  area_sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  property_condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'published' | 'draft' | 'pending' | 'rejected';
  verification_status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  is_verified: boolean;
  address: string;
  latitude?: number;
  longitude?: number;
  bank_installment_available?: boolean;
  features?: string[];
  owner_name: string;
  phone_numbers: string[];
  email: string;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  property_type?: PropertyType;
  listing_type?: PropertyListingType;
  region?: Region;
  township?: Township;
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
  status?: 'published' | 'draft' | 'pending';
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
}

export interface UpdatePropertyTypeData {
  name_mm?: string;
  name_en?: string;
  description?: string;
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
}

export interface UpdatePropertyListingTypeData {
  name_mm?: string;
  name_en?: string;
  description?: string;
  sort_order?: number;
}

// Property Verification
export interface PropertyVerificationData {
  action: 'approve' | 'reject';
  reason?: string;
}
