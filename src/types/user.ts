// User types for regular users (companies/individuals)

export interface RegularUser {
  id: number;
  name: string;
  slug: string;
  email: string;
  user_type: 'company' | 'individual';
  member_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active: boolean;
  last_login_at?: string;
  last_active_at?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRegularUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type: 'company' | 'individual';
  member_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active?: boolean;
}

export interface UpdateRegularUserData {
  name?: string;
  email?: string;
  user_type?: 'company' | 'individual';
  member_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active?: boolean;
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
}
