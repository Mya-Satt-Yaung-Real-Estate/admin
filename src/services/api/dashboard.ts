// Dashboard API functions
import { apiRequest, ApiResponse } from './base';

export interface DashboardStatistics {
  total_company: number;
  total_individual_user: number;
  total_property: number;
  total_wanting_list: number;
  total_appointment: number;
  credited_point: number;
  debit_point: number;
  total_revenue_from_payment: number;
  total_feedback: number;
  total_contactus: number;
  total_covered_location: number;
}

export interface SystemInfo {
  disk: {
    total: string;
    free: string;
    used: string;
    used_percentage: number;
    alert?: {
      status: 'normal' | 'warning' | 'critical';
      threshold: number;
      current_usage: number;
    };
  };
  database: {
    size: string;
    tables_count: number;
  };
  memory: {
    php_memory_limit: string;
    php_memory_usage: string;
    php_peak_memory: string;
    alert?: {
      status: 'normal' | 'warning' | 'critical';
      threshold: number;
      current_usage_percent: number;
    };
  };
  server: {
    php_version: string;
    laravel_version: string;
    server_software: string;
    cpu_cores?: number;
    total_ram?: string;
  };
  cpu: {
    load_average_1min?: number;
    load_average_5min?: number;
    load_average_15min?: number;
    cpu_usage_percent?: number;
    available: boolean;
    message?: string;
    alert?: {
      status: 'normal' | 'warning' | 'critical';
      threshold: number;
      current_load?: number;
      current_usage?: number;
      cpu_cores: number;
    };
  };
}

export const dashboardAPI = {
  // Get dashboard statistics
  getStatistics: (): Promise<ApiResponse<DashboardStatistics>> =>
    apiRequest<DashboardStatistics>('/dashboard/statistics'),
  
  // Get system information
  getSystemInfo: (): Promise<ApiResponse<SystemInfo>> =>
    apiRequest<SystemInfo>('/dashboard/system-info'),
};

