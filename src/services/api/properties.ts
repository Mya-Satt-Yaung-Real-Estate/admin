// Properties API functions
import { apiRequest, QueryParams } from './base';
import { Property, CreatePropertyData, UpdatePropertyData, PropertyType, PropertyListingType } from '../../types/property';

export const propertiesAPI = {
  // Get list of properties
  list: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<Property[]>(`/properties${queryString}`);
  },

  // Get list of pending properties
  listPending: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<Property[]>(`/properties/pending${queryString}`);
  },

  // Get list of published properties
  listPublished: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<Property[]>(`/properties/published${queryString}`);
  },

  // Get single property
  get: (id: number) =>
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

  // Property Types
  getPropertyTypes: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<PropertyType[]>(`/property-types${queryString}`);
  },

  // Property Listing Types
  getPropertyListingTypes: (params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
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

