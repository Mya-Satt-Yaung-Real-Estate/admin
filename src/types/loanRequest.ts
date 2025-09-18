// Loan Request types

export interface LoanRequest {
  id: number;
  slug: string;
  full_name: string;
  email: string;
  phone: string;
  nrc_number: string;
  date_of_birth: string;
  current_address: string;
  occupation: string;
  employer: string;
  monthly_income: string;
  work_experience: number;
  requested_amount: string;
  loan_purpose: string;
  property_value: string;
  down_payment: string;
  property_location: string;
  additional_notes: string;
  agree_terms: boolean;
  consent_personal_data: boolean;
  authorize_credit_check: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Related data
  user?: {
    id: number;
    name: string;
    email: string;
  };
  property_type?: {
    id: number;
    name_en: string;
    name_mm: string;
  };
}

export interface LoanRequestFilters {
  search?: string;
  status?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// API Response types
export interface LoanRequestListResponse {
  success: boolean;
  message: string;
  data: LoanRequest[];
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

export interface LoanRequestDetailResponse {
  success: boolean;
  message: string;
  data: LoanRequest;
}

export interface UpdateLoanRequestData {
  status: 'approved' | 'rejected' | 'under_review';
  admin_note?: string;
}