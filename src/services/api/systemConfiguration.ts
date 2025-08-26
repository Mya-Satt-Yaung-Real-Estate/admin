// System Configuration API functions
import { apiRequest } from './base';
import {
  SystemConfiguration,
  SystemConfigurationListResponse,
  ConfigurationCategoriesResponse,
  ConfigurationHistoryResponse,
  RecentChangesResponse,
  UpdateConfigurationData,
  SystemConfigurationFilters,
} from '../../types/systemConfiguration';

export const systemConfigurationAPI = {
  // Get all configurations with pagination and filters
  getSystemConfigurations: (params?: SystemConfigurationFilters) => {
    if (!params) {
      return apiRequest<SystemConfigurationListResponse>('/system-configurations');
    }
    
    // Filter out undefined values and convert numbers to strings
    const queryParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    });
    
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `/system-configurations?${queryString}` : '/system-configurations';
    
    return apiRequest<SystemConfigurationListResponse>(url);
  },

  // Get configuration categories
  getConfigurationCategories: () =>
    apiRequest<ConfigurationCategoriesResponse>('/system-configurations/categories'),

  // Get configurations by category
  getConfigurationsByCategory: (category: string) =>
    apiRequest<SystemConfiguration[]>('/system-configurations/categories/' + category),

  // Get specific configuration by key
  getConfiguration: (key: string) =>
    apiRequest<SystemConfiguration>(`/system-configurations/${key}`),

  // Update configuration
  updateConfiguration: (key: string, data: UpdateConfigurationData) =>
    apiRequest<SystemConfiguration>(`/system-configurations/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Bulk update configurations


  // Get configuration history
  getConfigurationHistory: (key: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest<ConfigurationHistoryResponse>(`/system-configurations/${key}/history${params}`);
  },

  // Get recent configuration changes
  getRecentConfigurationChanges: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest<RecentChangesResponse>(`/system-configurations/recent-changes${params}`);
  },

  // Clear configuration cache
  clearConfigurationCache: () =>
    apiRequest('/system-configurations/clear-cache', {
      method: 'POST',
    }),
};
