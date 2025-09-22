// Appointments API functions
import { apiRequest, QueryParams } from './base';
import { 
  Appointment, 
  AppointmentActionData,
  AppointmentRescheduleData,
  AppointmentCancelData,
  AppointmentCompleteData,
  AppointmentListResponse,
  AppointmentStatisticsResponse,
  TimeSlot,
  PropertyType
} from '../../types/appointment';

// Appointments-specific query parameters interface
export interface AppointmentQueryParams extends QueryParams {
  search?: string;
  status?: string;
  property_listing_type_id?: number;
  date_from?: string;
  date_to?: string;
}

// Reusable utility function to filter out undefined/null/empty values from query params
export function buildCleanQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );
  
  return Object.keys(filteredParams).length > 0 ? '?' + new URLSearchParams(filteredParams as any).toString() : '';
}

export const appointmentsAPI = {
  // Get appointment statistics
  statistics: () => {
    return apiRequest<AppointmentStatisticsResponse>('/appointments/statistics');
  },

  // Get list of appointments
  list: (params?: AppointmentQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<AppointmentListResponse>(`/appointments${queryString}`);
  },

  // Get single appointment
  get: (id: number) =>
    apiRequest<Appointment>(`/appointments/${id}`),

  // Get single appointment by ID (alias for get)
  getById: (id: number) =>
    apiRequest<Appointment>(`/appointments/${id}`),

  // Delete appointment
  delete: (id: number) =>
    apiRequest(`/appointments/${id}`, { method: 'DELETE' }),

  // Accept/Confirm appointment
  accept: (id: number, data?: AppointmentActionData) =>
    apiRequest<Appointment>(`/appointments/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Reschedule appointment
  reschedule: (id: number, data: AppointmentRescheduleData) =>
    apiRequest<Appointment>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cancel appointment
  cancel: (id: number, data?: AppointmentCancelData) =>
    apiRequest<Appointment>(`/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Complete appointment
  complete: (id: number, data?: AppointmentCompleteData) =>
    apiRequest<Appointment>(`/appointments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Get time slots for frontend dropdowns
  getTimeSlots: () =>
    apiRequest<TimeSlot[]>('/appointments/time-slots'),

  // Get property types for frontend dropdowns
  getPropertyTypes: () =>
    apiRequest<PropertyType[]>('/appointment-property-types'),
};
