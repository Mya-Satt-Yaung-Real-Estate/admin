// Re-export all types for easy importing
export * from './layout';
export * from './auth';
export * from './ui';
export * from './user';
export * from './admin';
export * from './role';
export * from './permission';
export * from './location';

// Global types that don't fit into specific categories
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseEntityWithNumberId {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Common status types
export type EntityStatus = 'active' | 'inactive' | 'pending';

// Common form field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'switch' | 'date';
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  options?: SelectOption[];
}

// Common form data interface
export interface BaseFormData {
  [key: string]: any;
}

// Common form errors interface
export interface FormErrors {
  [key: string]: string | undefined;
}

// Common API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common filter types
export interface BaseFilters {
  searchTerm: string;
  statusFilter: string;
  page: number;
  limit: number;
}

// Common action types
export interface EntityAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick: () => void;
  disabled?: boolean;
}

// Form hook return type
export interface UseFormReturnType {
  register: any;
  handleSubmit: any;
  formState: any;
  control: any;
  watch: any;
  setValue: any;
  getValues: any;
  reset: any;
  isSubmitting: boolean;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
} 