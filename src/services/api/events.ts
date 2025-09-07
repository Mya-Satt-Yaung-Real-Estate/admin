// Event Management API functions
import { apiRequest } from './base';
import { 
  HousingEventCategory, 
  CreateHousingEventCategoryData, 
  UpdateHousingEventCategoryData,
  HousingEventCategoryFilters,
  HousingEvent,
  CreateHousingEventData,
  UpdateHousingEventData,
  HousingEventFilters
} from '../../types/event';

// Event Category API
export const eventCategoryAPI = {
  // Get list of event categories
  list: (params?: HousingEventCategoryFilters) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<HousingEventCategory[]>(`/housing-event-categories${queryString}`);
  },

  // Get single event category
  get: (slug: string) =>
    apiRequest<HousingEventCategory>(`/housing-event-categories/${slug}`),

  // Create new event category
  create: (data: CreateHousingEventCategoryData) =>
    apiRequest<HousingEventCategory>('/housing-event-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update event category
  update: (slug: string, data: UpdateHousingEventCategoryData) =>
    apiRequest<HousingEventCategory>(`/housing-event-categories/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete event category (soft delete)
  delete: (slug: string) =>
    apiRequest(`/housing-event-categories/${slug}`, { method: 'DELETE' }),

  // Restore event category
  restore: (slug: string) =>
    apiRequest<HousingEventCategory>(`/housing-event-categories/${slug}/restore`, {
      method: 'POST',
    }),

  // Force delete event category
  forceDelete: (slug: string) =>
    apiRequest(`/housing-event-categories/${slug}/force`, { method: 'DELETE' }),
};

// Event API
export const eventAPI = {
  // Get list of events
  list: (params?: HousingEventFilters) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<HousingEvent[]>(`/housing-events${queryString}`);
  },

  // Get single event
  get: (slug: string) =>
    apiRequest<HousingEvent>(`/housing-events/${slug}`),

  // Create new event
  create: (data: CreateHousingEventData) =>
    apiRequest<HousingEvent>('/housing-events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update event
  update: (slug: string, data: UpdateHousingEventData) =>
    apiRequest<HousingEvent>(`/housing-events/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete event (soft delete)
  delete: (slug: string) =>
    apiRequest(`/housing-events/${slug}`, { method: 'DELETE' }),

  // Restore event
  restore: (slug: string) =>
    apiRequest<HousingEvent>(`/housing-events/${slug}/restore`, {
      method: 'POST',
    }),

  // Force delete event
  forceDelete: (slug: string) =>
    apiRequest(`/housing-events/${slug}/force`, { method: 'DELETE' }),
};
