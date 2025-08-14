// Re-export all types for easy importing
export * from './layout';
export * from './auth';
export * from './admin';
export * from './role';
export * from './permission';
export * from './location';
export * from './property';
export * from './user';
export * from './ui';

// Global types that don't fit into specific categories
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

// Query Parameters
export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  [key: string]: any;
} 