import { apiRequest, ApiResponse } from './base';

// ============================================================================
// TYPES
// ============================================================================

export interface AppointmentPreferTime {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateAppointmentPreferTimeData {
  name: string;
  start_time: string;
  end_time: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateAppointmentPreferTimeData {
  name?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  is_active?: boolean;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const appointmentPreferTimeApi = {
  /**
   * Get all appointment prefer times (excluding soft deleted)
   */
  list: (): Promise<ApiResponse<AppointmentPreferTime[]>> => {
    return apiRequest('/appointment-prefer-times');
  },

  /**
   * Get all appointment prefer times including soft deleted
   */
  listWithTrashed: (): Promise<ApiResponse<AppointmentPreferTime[]>> => {
    return apiRequest('/appointment-prefer-times/with-trashed');
  },

  /**
   * Get only soft deleted appointment prefer times
   */
  listTrashed: (): Promise<ApiResponse<AppointmentPreferTime[]>> => {
    return apiRequest('/appointment-prefer-times/trashed');
  },

  /**
   * Get specific appointment prefer time
   */
  show: (id: number): Promise<ApiResponse<AppointmentPreferTime>> => {
    return apiRequest(`/appointment-prefer-times/${id}`);
  },

  /**
   * Create new appointment prefer time
   */
  create: (data: CreateAppointmentPreferTimeData): Promise<ApiResponse<AppointmentPreferTime>> => {
    return apiRequest('/appointment-prefer-times', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update appointment prefer time
   */
  update: (id: number, data: UpdateAppointmentPreferTimeData): Promise<ApiResponse<AppointmentPreferTime>> => {
    return apiRequest(`/appointment-prefer-times/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Soft delete appointment prefer time
   */
  destroy: (id: number): Promise<ApiResponse<null>> => {
    return apiRequest(`/appointment-prefer-times/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Permanently delete appointment prefer time
   */
  forceDelete: (id: number): Promise<ApiResponse<null>> => {
    return apiRequest(`/appointment-prefer-times/${id}/force`, {
      method: 'DELETE',
    });
  },

  /**
   * Restore soft deleted appointment prefer time
   */
  restore: (id: number): Promise<ApiResponse<AppointmentPreferTime>> => {
    return apiRequest(`/appointment-prefer-times/${id}/restore`, {
      method: 'POST',
    });
  },

  /**
   * Toggle appointment prefer time status
   */
  toggleStatus: (id: number): Promise<ApiResponse<AppointmentPreferTime>> => {
    return apiRequest(`/appointment-prefer-times/${id}/toggle-status`, {
      method: 'POST',
    });
  },
};
