// Point Transaction Types based on API Documentation
export interface PointTransaction {
  id: number;
  user_name: string;
  user_email: string;
  transaction_type: 'CREDIT' | 'DEBIT';
  points_amount: number;
  balance_before: number;
  balance_after: number;
  reference_type: string;
  reference_id: number;
  description: string;
  created_at: string;
}

export interface PointTransactionFilters {
  search?: string;
  user_id?: string | number;
  transaction_type?: string;
  reference_type?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface PointTransactionStatistics {
  total_transaction: number;
  total_credits: string;
  total_debits: string;
  property_upload_transaction_count: number;
}

// Transaction type options for filters
export const TRANSACTION_TYPES = [
  { value: 'all', label: 'All Transactions' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'DEBIT', label: 'Debit' },
] as const;

// Reference type options for filters
export const REFERENCE_TYPES = [
  { value: 'all', label: 'All Reference Types' },
  { value: 'purchase_approval', label: 'Purchase Approval' },
  { value: 'property_upload', label: 'Property Upload' },
  { value: 'admin_allocation', label: 'Admin Allocation' },
  { value: 'refund', label: 'Point Refund' },
  { value: 'property_renewal', label: 'Property Renewal' },
  { value: 'property_upgrade', label: 'Property Upgrade' },
  { value: 'property_trending', label: 'Property Premium' },
  { value: 'property_trending_refund', label: 'Property Premium Refund' },
  { value: 'advertisement_upload', label: 'Advertisement Upload' },
  { value: 'advertisement_renewal', label: 'Advertisement Renewal' },
  { value: 'wanted_list_info_unlock', label: 'Wanted List Unlock'},
] as const;
