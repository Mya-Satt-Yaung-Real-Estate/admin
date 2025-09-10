// Event Registration Types

export interface EventRegistrationUser {
  id: number;
  name: string | null;
  slug: string;
  email: string;
  user_type: 'company' | 'individual';
  member_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active: boolean;
  created_at: string;
  phone: string | null;
  registered_at: string;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  has_more_pages: boolean;
}

export interface EventRegistrationResponse {
  success: boolean;
  message: string;
  data: EventRegistrationUser[];
  pagination?: PaginationInfo;
}

// For modal usage - we need event info + users
export interface EventRegistrationModalData {
  event: {
    id: number;
    name_en: string;
    name_mm: string;
    slug: string;
    need_registration: boolean;
    user_capacity: number;
    registration_user_count: number;
  };
  registered_users: EventRegistrationUser[];
}

