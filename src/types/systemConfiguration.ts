// System Configuration Types
export interface SystemConfiguration {
  id: number;
  config_key: string;
  config_label?: string;
  config_value: string;
  typed_value: string | number | boolean | any[];
  config_type: 'string' | 'int' | 'bool' | 'array';
  category: string;
  description?: string;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface ConfigurationChange {
  id: number;
  config_key: string;
  old_value?: string;
  new_value: string;
  changed_by: {
    id: number;
    name: string;
    email: string;
  };
  changed_at: string;
  configuration?: SystemConfiguration;
}

export interface UpdateConfigurationData {
  config_value: string;
  description?: string;
  is_active?: boolean;
}



export interface SystemConfigurationFilters {
  search?: string;
  category?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface SystemConfigurationListResponse {
  success: boolean;
  message: string;
  data: {
    data: SystemConfiguration[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    };
  };
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
  };
}

export interface ConfigurationCategoriesResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface ConfigurationHistoryResponse {
  success: boolean;
  message: string;
  data: ConfigurationChange[];
}

export interface RecentChangesResponse {
  success: boolean;
  message: string;
  data: ConfigurationChange[];
}

// Form data types for components
export interface SystemConfigurationFormData {
  config_key: string;
  config_value: string;
  description: string;
  is_active: boolean;
}



// Configuration categories for UI
export const CONFIGURATION_CATEGORIES = [
  'point_system',
  'point_costs',
  'trial_points',
  'purchase_requests',
  'payment_methods',
  'reference_types',
  'request_statuses',
  'admin',
  'validation',
  'cache',
  'reporting',
  'property',
  'features',
  'media',
] as const;

export type ConfigurationCategory = typeof CONFIGURATION_CATEGORIES[number];

// Configuration type options for UI
export const CONFIGURATION_TYPES = [
  { value: 'string', label: 'Text' },
  { value: 'int', label: 'Number' },
  { value: 'bool', label: 'Boolean' },
  { value: 'array', label: 'Array' },
] as const;

export type ConfigurationType = typeof CONFIGURATION_TYPES[number]['value'];
