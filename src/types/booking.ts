import { RegularUser } from './index';

// Admin User for assignment
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  slug: string;
}

// Booking Types based on API Documentation
export interface Booking {
  id: number;
  user_id: number;
  property_id?: number;
  booking_type: 'property_consultation' | 'general_service';
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'accepted' | 'rescheduled' | 'cancelled';
  user_notes?: string;
  admin_notes?: string;
  cancellation_reason?: string;
  assigned_admin_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relationships
  user?: RegularUser;
  property?: {
    id: number;
    title: string;
    code?: string;
    price?: string;
    location?: string;
    status?: string;
    verification_status?: string;
  };
  assigned_admin?: RegularUser;
  
  // Computed fields
  formatted_appointment?: string;
  booking_type_label?: string;
  status_label?: string;
  can_cancel?: boolean;
  can_accept?: boolean;
  can_reschedule?: boolean;
}

export interface CreateBookingData {
  property_id?: number;
  booking_type: 'property_consultation' | 'general_service';
  appointment_date: string;
  appointment_time: string;
  user_notes?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {}

export interface BookingFilters {
  search?: string;
  status?: string;
  booking_type?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Booking Statistics
export interface BookingStatistics {
  total_bookings: number;
  pending_bookings: number;
  accepted_bookings: number;
  rescheduled_bookings: number;
  cancelled_bookings: number;
  bookings_today: number;
  bookings_this_week: number;
  bookings_this_month: number;
  property_consultations: number;
  general_services: number;
  unassigned_bookings: number;
  most_active_users: Array<{
    user_id: number;
    name: string;
    booking_count: number;
  }>;
  most_booked_properties: Array<{
    property_id: number;
    title_en: string;
    booking_count: number;
  }>;
}

// Booking Actions
export interface BookingActionData {
  admin_notes?: string;
}

export interface BookingRescheduleData extends BookingActionData {
  appointment_date: string;
  appointment_time: string;
}

export interface BookingCancelData extends BookingActionData {
  cancellation_reason: string;
}

export interface BookingAssignData extends BookingActionData {
  assigned_admin_id: number;
}

// API Response Types
export interface BookingListResponse {
  data: Booking[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

export interface BookingStatisticsResponse {
  data: BookingStatistics;
}
