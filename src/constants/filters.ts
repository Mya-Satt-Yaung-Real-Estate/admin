// Standard filter options used throughout the application
export const STATUS_OPTIONS = {
  all: 'all',
  active: 'active',
  inactive: 'inactive',
} as const;

export const DEFAULT_FILTERS = {
  searchTerm: '',
  statusFilter: STATUS_OPTIONS.all,
} as const;

// Filter types
export interface BaseFilters {
  searchTerm: string;
  statusFilter: string;
}

export interface FilterState extends BaseFilters {
  [key: string]: string;
}

// Common filter configurations
export const FILTER_CONFIG = {
  statusOptions: [
    { value: STATUS_OPTIONS.all, label: 'All Status' },
    { value: STATUS_OPTIONS.active, label: 'Active' },
    { value: STATUS_OPTIONS.inactive, label: 'Inactive' },
  ],
  searchPlaceholder: 'Search...',
  debounceDelay: 300, // milliseconds
} as const; 