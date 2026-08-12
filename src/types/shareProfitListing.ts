/**
 * Share Profit Listing types (Admin UI → V2 API).
 */

export interface Region {
  id: number;
  name_en: string;
  name_mm: string;
}

export interface Township {
  id: number;
  name_en: string;
  name_mm: string;
}

export interface PropertyType {
  id: number;
  name_en: string;
  name_mm: string;
}

export interface PreferredLocation {
  region: Region;
  township: Township | null;
}

export interface Location {
  region_en: string;
  township_en: string;
  region_mm: string;
  township_mm: string;
}

export interface Budget {
  min_budget: string;
  max_budget: string;
  budget_range: string;
}

export interface Specifications {
  bedrooms: number;
  bathrooms: number;
  min_area: string | null;
  max_area: string | null;
  area_range: string;
}

export interface Contact {
  name: string;
  phone: string;
  email: string;
}

export interface Status {
  verification_status: 'pending' | 'approved' | 'rejected';
  status: 'draft' | 'published' | 'expired' | 'closed';
  is_expired: boolean;
  is_published: boolean;
  expires_at: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  member_level: string;
  company_name?: string | null;
}

export interface MediaImage {
  id: number;
  type: string;
  filename: string;
  is_primary: boolean;
  status: string;
  url?: string;
  thumbnail_url?: string;
  small_url?: string;
  medium_url?: string;
}

export interface ShareProfitListingMedia {
  images?: MediaImage[];
  primary_image?: MediaImage | null;
  images_count?: number;
}

export type ShareProfitWantedType = 'buyer' | 'seller' | 'for_rent' | 'renter';

export interface ShareProfitListing {
  id: number;
  slug: string;
  wanted_type: ShareProfitWantedType | string;
  wanted_type_label: string;
  title: string;
  description: string;
  address?: string | null;
  property_type: PropertyType;
  preferred_location?: PreferredLocation;
  location?: Location;
  budget: Budget;
  specifications: Specifications;
  contact: Contact;
  status: Status;
  user?: User;
  media?: ShareProfitListingMedia;
  created_at: string;
  deleted_at?: string | null;
  is_active?: boolean;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  has_more_pages: boolean;
}

export interface CreateShareProfitListingData {
  wanted_type: ShareProfitWantedType | string;
  title: string;
  description?: string;
  property_type_id: number;
  region_id: number;
  township_id?: number | null;
  min_budget?: number;
  max_budget?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  address?: string | null;
  name: string;
  phone: string;
  email?: string;
  status?: 'draft' | 'published';
  /**
   * Optional owner. If omitted, API uses current admin.
   */
  user_id?: number | null;
  /**
   * Admin create: pending | approved | rejected. Omit → API defaults to pending.
   */
  verification_status?: 'pending' | 'approved' | 'rejected';
  /**
   * Required when verification_status is rejected.
   */
  rejection_reason?: string | null;
  media_ids: number[];
}

export interface UpdateShareProfitListingData {
  wanted_type?: ShareProfitWantedType | string;
  title?: string;
  description?: string;
  property_type_id?: number;
  region_id?: number | null;
  township_id?: number | null;
  min_budget?: number;
  max_budget?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  address?: string | null;
  name?: string;
  phone?: string;
  email?: string;
  status?: 'draft' | 'published' | 'closed';
  /**
   * Admin edit: pending | approved | rejected.
   */
  verification_status?: 'pending' | 'approved' | 'rejected';
  /**
   * Required when verification_status is rejected.
   */
  rejection_reason?: string | null;
  /**
   * Optional owner change. If omitted, API keeps current owner.
   */
  user_id?: number | null;
  media_ids: number[];
}
