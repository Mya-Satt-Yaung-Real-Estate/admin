// Point Package Types
export interface PointPackage {
  id: number;
  name_en: string;
  name_mm: string;
  slug: string;
  points: number;
  price_mmk: number;
  expiry_days?: number | null;
  formatted_price: string;
  description_en?: string;
  description_mm?: string;
  feature?: string | null;
  is_active: boolean;
  is_available: boolean;
  total_purchases: number;
  total_revenue: number;
  purchase_requests_count?: number;
  user_points_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: number;
  deletion_reason?: string;
}

export interface CreatePointPackageData {
  name_en: string;
  name_mm: string;
  points: number;
  price_mmk: number;
  expiry_days?: number | null;
  description_en?: string;
  description_mm?: string;
  feature?: string | null;
  is_active?: boolean;
}

export interface UpdatePointPackageData {
  name_en?: string;
  name_mm?: string;
  points?: number;
  price_mmk?: number;
  expiry_days?: number | null;
  description_en?: string;
  description_mm?: string;
  feature?: string | null;
  is_active?: boolean;
}

// Point Purchase Request Types
export interface PointPurchaseRequest {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  status_label: string;
  payment_method: string | null;
  formatted_payment_method: string | null;
  payment_reference: string | null;
  payment_date: string | null;
  requested_at: string;
  approved_at?: string | null;
  user: {
    id: number;
    name: string | null;
    email: string | null;
    user_type: 'individual' | 'company';
    current_point_balance: number;
  } | null;
  package: {
    id: number;
    name_en: string;
    name_mm: string;
    slug: string;
    points: number;
    price_mmk: number;
    formatted_price: string;
  } | null;
  points_requested: number;
  price_mmk: number;
  formatted_price: string | null;
  approved_by?: {
    id: number;
    name: string;
  };
  admin_notes?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
  can_approve: boolean;
  can_reject: boolean;
  is_pending: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  is_cancelled: boolean;
}

export interface CreatePointPurchaseRequestData {
  user_id: number;
  package_id: number;
  payment_method: string;
  payment_reference: string;
  payment_date: string;
}

export interface UpdatePointPurchaseRequestData {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string;
  rejected_reason?: string;
}

export interface ApproveRejectRequestData {
  action: 'approve' | 'reject';
  notes?: string;
  rejection_reason?: string;
  payment_method?: 'bank_transfer' | 'cash' | 'mobile_money' | 'other';
  payment_reference?: string;
}

// API Response Types
export interface PointPurchaseRequestSummary {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  cancelled_requests: number;
  total_revenue: number;
}

export interface PointPurchaseRequestsResponse {
  success: boolean;
  message: string;
  data: PointPurchaseRequest[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
  summary: PointPurchaseRequestSummary;
}

// Form data types for components
export interface PointPackageFormData {
  name_en: string;
  name_mm: string;
  points: number;
  price_mmk: number;
  description_en: string;
  description_mm: string;
  is_active: boolean;
}

export interface PointPurchaseRequestFilters {
  search?: string;
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PointPackageFilters {
  search?: string;
  status?: string;
  include_deleted?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Point Order Types
export interface PointOrder {
  id: number;
  order_id: string;
  status: 'pending' | 'approved' | 'failed' | 'cancelled';
  status_label: string;
  payment_status: 'PENDING' | 'SUCCESS' | 'ERROR' | 'CANCELLED' | 'TIMEOUT' | 'DECLINED' | 'SYSTEM_ERROR';
  formatted_payment_status: string;
  payment_provider: string;
  formatted_payment_provider: string;
  dinger_transaction_id?: string;
  dinger_provider_name?: string;
  dinger_method_name?: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    user_type: 'individual' | 'company';
  };
  package: {
    id: number;
    name_en: string;
    name_mm: string;
    points: number;
  };
  point_amount: number;
  price_mmk: number;
  formatted_price: string;
  payment_completed_at?: string;
  payment_failed_at?: string;
  payment_failure_reason?: string;
  points_allocated_at?: string;
  allocated_by?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  is_pending: boolean;
  is_approved: boolean;
  is_failed: boolean;
  is_cancelled: boolean;
  is_payment_pending: boolean;
  is_payment_completed: boolean;
  is_payment_failed: boolean;
  is_payment_processing: boolean;
}

export interface PointOrderSummary {
  total_orders: number;
  pending_orders: number;
  success_orders: number;
  failed_orders: number;
  total_revenue: number;
  total_points_allocated: number;
}

// PointOrdersResponse matches the actual API response structure
// The API returns: { success, message, data: PointOrder[], pagination, summary }
export interface PointOrdersResponse {
  success: boolean;
  message: string;
  data: PointOrder[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
  summary?: PointOrderSummary;
}

export interface PointOrderFilters {
  search?: string;
  payment_status?: string;
  status?: string;
  payment_provider?: string;
  dinger_provider_name?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
