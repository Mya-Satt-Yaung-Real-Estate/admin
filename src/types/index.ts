// Re-export all types for easy importing
export * from './layout';
export * from './auth';
export * from './ui';

// Global types that don't fit into specific categories
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
} 