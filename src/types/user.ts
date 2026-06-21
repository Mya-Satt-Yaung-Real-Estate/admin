// User types for regular users (companies/individuals)

export interface CompanyProfile {
  id: number;
  company_name: string;
  company_type_id: number;
  company_type_name: string;
  phone_number: string;
  address: string;
  website?: string;
  description?: string;
  view_count: number;
  location_en: string;
  location_mm: string;
  show_on_homepage?: boolean;
  show_on_property_detail?: boolean;
  our_market?: boolean;
}

// Point Package for user detail
export interface UserPointPackage {
  id: number;
  package_name: string;
  points_allocated: number;
  points_remaining: number;
  points_consumed: number;
  consumption_percentage: number;
  allocated_at: string;
  expires_at: string;
  days_until_expiry: number;
  is_expired: boolean;
  is_active: boolean;
  allocated_by: {
    id: number;
    name: string;
    email: string;
  };
}

// Point Transaction for user detail
export interface UserPointTransaction {
  id: number;
  transaction_type: 'DEBIT' | 'CREDIT';
  points_amount: number;
  balance_before: number;
  balance_after: number;
  reference_type: string;
  reference_id: number;
  description: string;
  created_at: string;
}

export interface RegularUser {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  user_type: 'company' | 'individual';
  user_type_label?: string;
  member_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected';
  last_login_at?: string;
  last_active_at?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string; // Soft delete support
  // Additional fields for detail view
  company_profile?: CompanyProfile;
  property_count: number;
  // Point system fields
  point_balance: number;
  total_points_allocated: number;
  total_points_consumed: number;
  point_packages_count: number;
  point_packages?: UserPointPackage[];
  recent_transactions?: UserPointTransaction[];
  // Property statistics fields
  property_statistics?: {
    total_properties: number;
    active_properties: number;
    sold_properties: number;
    rented_properties: number;
    expired_properties: number;
    draft_properties: number;
  };
  // Biometric (admin detail / clear-biometric)
  biometric_enabled?: boolean;
  biometric_enabled_at?: string;
  // Profile image (admin edit / user site)
  profile_image_url?: string | null;
  profile_media_id?: number | null;
}

export interface CreateRegularUserData {
  name: string;
  email: string;
  password: string;
  user_type: 'company' | 'individual';
  member_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active?: boolean;
  /** Optional profile image (upload via /api/v1/media first). */
  media_id?: number;
  // Company-specific fields
  company_name?: string;
  company_type_id?: number;
  phone?: string;
  address?: string;
  region_id?: number;
  township_id?: number;
  description?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
  show_on_homepage?: boolean;
  show_on_property_detail?: boolean;
  our_market?: boolean;
}

export interface UpdateRegularUserData {
  name?: string;
  email?: string;
  user_type?: 'company' | 'individual';
  member_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active?: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected';
  show_on_homepage?: boolean;
  show_on_property_detail?: boolean;
  our_market?: boolean;
  /** Set or clear profile image (admin). Omit to leave unchanged. */
  media_id?: number | null;
}

export interface RegularUserFilters {
  search?: string;
  user_type?: string;
  member_level?: string;
  is_active?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  include_deleted?: boolean; // Soft delete filter
}

// API Response types
export interface UserListResponse {
  success: boolean;
  message: string;
  data: RegularUser[];
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

export interface UserDetailResponse {
  success: boolean;
  message: string;
  data: {
    user: RegularUser;
  };
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: RegularUser;
    trial_points: {
      points_allocated: number;
      expires_at: string;
    };
    company_profile?: {
      id: number;
      name: string;
      slug: string;
      phone: string;
      business_address: string;
      description: string;
      company_type: {
        id: number;
        name_en: string;
        name_mm: string;
      };
      region: {
        id: number;
        name_en: string;
        name_mm: string;
      };
      township: {
        id: number;
        name_en: string;
        name_mm: string;
      };
    };
  };
}

export function getCompanyUserSelectLabel(user: RegularUser): string {
  const label = user.company_profile?.company_name ?? user.name;
  const phone = user.phone ?? user.company_profile?.phone_number ?? '—';
  return `${label} (${phone})`;
}

export function getUserSelectLabel(user: RegularUser): string {
  const phone = user.phone ?? user.company_profile?.phone_number ?? '—';
  return `${user.name} (${phone}) - ${user.user_type}`;
}
