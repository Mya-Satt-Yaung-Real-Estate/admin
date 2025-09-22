import { RegularUser } from './index';

// Property Listing Type for appointments
export interface PropertyListingType {
  id: number;
  name_en: string;
  name_mm: string;
}

// Appointment Prefer Time
export interface AppointmentPreferTime {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

// Appointment Types based on API Documentation
export interface Appointment {
  id: number;
  user_id: number;
  property_listing_type_id: number;
  prefer_time_id?: number;
  prefer_time_name?: string;
  prefer_start_time?: string;
  prefer_end_time?: string;
  is_anytime: boolean;
  schedule_date?: string;
  schedule_start_time?: string;
  schedule_end_time?: string;
  date: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  advance_amount?: number;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relationships
  user?: RegularUser;
  property_listing_type?: PropertyListingType;
  prefer_time?: AppointmentPreferTime;
  
  // Computed fields
  prefer_time_range?: string;
  schedule_time_range?: string;
  display_time_range?: string;
  can_be_cancelled?: boolean;
  can_be_rescheduled?: boolean;
  is_scheduled?: boolean;
}

export interface CreateAppointmentData {
  property_listing_type_id: number;
  prefer_time_id?: number;
  is_anytime: boolean;
  date: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  advance_amount?: number;
  message?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {}

export interface AppointmentFilters {
  search?: string;
  status?: string;
  property_listing_type_id?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Appointment Statistics
export interface AppointmentStatistics {
  total_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  rescheduled_appointments: number;
  today_appointments: number;
  this_week_appointments: number;
  this_month_appointments: number;
}

// Appointment Actions
export interface AppointmentActionData {
  admin_notes?: string;
  schedule_date?: string;
  schedule_start_time?: string;
  schedule_end_time?: string;
}

export interface AppointmentRescheduleData extends AppointmentActionData {
  schedule_date: string;
  schedule_start_time: string;
  schedule_end_time: string;
}

// Time Slot interface
export interface TimeSlot {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

// Property Type interface
export interface PropertyType {
  id: number;
  name_en: string;
  name_mm: string;
}

export interface AppointmentCancelData extends AppointmentActionData {
  admin_notes?: string;
}

export interface AppointmentCompleteData extends AppointmentActionData {
  admin_notes?: string;
}

// API Response Types
export interface AppointmentListResponse {
  data: Appointment[];
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

export interface AppointmentStatisticsResponse {
  data: AppointmentStatistics;
}

// Time Slot for frontend dropdowns
export interface TimeSlot {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

// Property Type for frontend dropdowns
export interface PropertyType {
  id: number;
  name_en: string;
  name_mm: string;
}
