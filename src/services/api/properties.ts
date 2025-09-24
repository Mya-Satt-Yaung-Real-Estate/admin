// Properties API functions
import { apiRequest, QueryParams } from './base';
import { Property, CreatePropertyData, UpdatePropertyData, PropertyType, PropertyListingType, PropertyRenewalResponse } from '../../types/property';

// Properties-specific query parameters interface
export interface PropertyQueryParams extends QueryParams {
  status?: string;
  verification_status?: string;
  property_type?: string;
  listing_type?: string;
  expired?: string | boolean;
  is_trending?: boolean;
  deleted?: string | boolean;
}

// Reusable utility function to filter out undefined/null/empty values from query params
// This can be used by any API service that needs clean query strings
export function buildCleanQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
  
  // Convert boolean values to proper string representation for Laravel
  const processedParams = Object.fromEntries(
    Object.entries(filteredParams).map(([key, value]) => {
      if (key === 'is_trending' && typeof value === 'boolean') {
        // Special handling for is_trending to ensure Laravel compatibility
        return [key, value ? '1' : '0'];
      }
      return [key, value];
    })
  );
  
  const queryString = Object.keys(processedParams).length > 0 ? '?' + new URLSearchParams(processedParams as any).toString() : '';
  
  // Debug logging for is_trending parameter
  if (params && 'is_trending' in params) {
    console.log('🔍 is_trending debug:', {
      original: params.is_trending,
      type: typeof params.is_trending,
      processed: processedParams.is_trending,
      queryString: queryString
    });
  }
  
  return queryString;
}

export const propertiesAPI = {
  // Get property statistics
  statistics: () => {
    return apiRequest<{
      total_count: number;
      pending_count: number;
      published_count: number;
      deleted_count: number;
      approved_count: number;
      rejected_count: number;
      active_count: number;
    }>('/properties/statistics');
  },

  // Get list of properties
  list: (params?: PropertyQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<Property[]>(`/properties${queryString}`);
  },

  // Get list of pending properties
  listPending: (params?: PropertyQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<Property[]>(`/properties/pending${queryString}`);
  },

  // Get list of published properties
  listPublished: (params?: PropertyQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<Property[]>(`/properties/published${queryString}`);
  },

  // Get single property
  get: (id: number) =>
    apiRequest<Property>(`/properties/${id}`),

  // Get single property by ID (alias for get)
  getById: (id: number) =>
    apiRequest<Property>(`/properties/${id}`),

  // Create new property
  create: (data: CreatePropertyData) =>
    apiRequest<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update property
  update: (id: number, data: UpdatePropertyData) =>
    apiRequest<Property>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete property
  delete: (id: number) =>
    apiRequest(`/properties/${id}`, { method: 'DELETE' }),

  // Restore property
  restore: (id: number) =>
    apiRequest<Property>(`/properties/${id}/restore`, { method: 'POST' }),

  // Approve property
  approve: (id: number) =>
    apiRequest<Property>(`/properties/${id}/verification`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' }),
    }),

  // Reject property
  reject: (id: number, reason: string) =>
    apiRequest<Property>(`/properties/${id}/verification`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', reason }),
    }),

  // Renew property
  renew: (id: number, notes?: string) =>
    apiRequest<PropertyRenewalResponse>(`/properties/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Property Types
  getPropertyTypes: (params?: QueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<PropertyType[]>(`/property-types${queryString}`);
  },

  // Property Listing Types
  getPropertyListingTypes: (params?: QueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<PropertyListingType[]>(`/property-listing-types${queryString}`);
  },

  // Get Property Type by slug
  getPropertyType: (slug: string) =>
    apiRequest<PropertyType>(`/property-types/${slug}`),

  // Create Property Type
  createPropertyType: (data: any) =>
    apiRequest<PropertyType>('/property-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update Property Type
  updatePropertyType: (slug: string, data: any) =>
    apiRequest<PropertyType>(`/property-types/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete Property Type
  deletePropertyType: (slug: string) =>
    apiRequest(`/property-types/${slug}`, { method: 'DELETE' }),

  // Get Property Listing Type by slug
  getPropertyListingType: (slug: string) =>
    apiRequest<PropertyListingType>(`/property-listing-types/${slug}`),

  // Create Property Listing Type
  createPropertyListingType: (data: any) =>
    apiRequest<PropertyListingType>('/property-listing-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update Property Listing Type
  updatePropertyListingType: (slug: string, data: any) =>
    apiRequest<PropertyListingType>(`/property-listing-types/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete Property Listing Type
  deletePropertyListingType: (slug: string) =>
    apiRequest(`/property-listing-types/${slug}`, { method: 'DELETE' }),
};

