// Bookings API functions
import { apiRequest, QueryParams } from './base';
import { 
  Booking, 
  CreateBookingData, 
  UpdateBookingData, 
  BookingActionData,
  BookingRescheduleData,
  BookingCancelData,
  BookingAssignData,
  AdminUser,
  BookingListResponse,
  BookingStatisticsResponse
} from '../../types/booking';

// Bookings-specific query parameters interface
export interface BookingQueryParams extends QueryParams {
  search?: string;
  status?: string;
  booking_type?: string;
  assigned_admin_id?: number;
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

export const bookingsAPI = {
  // Get booking statistics
  statistics: () => {
    return apiRequest<BookingStatisticsResponse>('/bookings/statistics');
  },

  // Get list of bookings
  list: (params?: BookingQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<BookingListResponse>(`/bookings${queryString}`);
  },

  // Get single booking
  get: (id: number) =>
    apiRequest<Booking>(`/bookings/${id}`),

  // Get single booking by ID (alias for get)
  getById: (id: number) =>
    apiRequest<Booking>(`/bookings/${id}`),

  // Create new booking
  create: (data: CreateBookingData) =>
    apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update booking
  update: (id: number, data: UpdateBookingData) =>
    apiRequest<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete booking
  delete: (id: number) =>
    apiRequest(`/bookings/${id}`, { method: 'DELETE' }),

  // Accept booking
  accept: (id: number, data?: BookingActionData) =>
    apiRequest<Booking>(`/bookings/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Reschedule booking
  reschedule: (id: number, data: BookingRescheduleData) =>
    apiRequest<Booking>(`/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cancel booking
  cancel: (id: number, data: BookingCancelData) =>
    apiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Assign booking to admin
  assign: (id: number, data: BookingAssignData) =>
    apiRequest<Booking>(`/bookings/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get admin users for assignment
  getAdminUsers: () =>
    apiRequest<AdminUser[]>('/bookings/admin-users', {
      method: 'GET',
    }),
};
