// Appointments React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  appointmentsAPI, 
  AppointmentQueryParams 
} from '../api/appointments';
import { 
  Appointment, 
  CreateAppointmentData, 
  UpdateAppointmentData,
  AppointmentActionData,
  AppointmentRescheduleData,
  AppointmentCancelData,
  AppointmentCompleteData,
  AppointmentListResponse,
  AppointmentStatisticsResponse
} from '../../types/appointment';

// Query Keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (params: AppointmentQueryParams) => [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...appointmentKeys.details(), id] as const,
  statistics: () => [...appointmentKeys.all, 'statistics'] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

// Get appointment statistics
export const useAppointmentStatistics = () => {
  return useQuery<AppointmentStatisticsResponse>({
    queryKey: appointmentKeys.statistics(),
    queryFn: async () => {
      const response = await appointmentsAPI.statistics();
      return {
        data: response.data // Extract the statistics data from the API response
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get appointment time slots
export const useAppointmentTimeSlots = () => {
  return useQuery({
    queryKey: ['appointmentTimeSlots'],
    queryFn: async () => {
      const response = await appointmentsAPI.getTimeSlots();
      return response.data; // Extract the time slots data from the API response
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get list of appointments
export const useAppointments = (params: AppointmentQueryParams = {}) => {
  return useQuery<AppointmentListResponse>({
    queryKey: appointmentKeys.list(params),
    queryFn: async () => {
      const response = await appointmentsAPI.list(params);
      return {
        data: response.data, // Extract the appointments array
        pagination: response.pagination // Extract the pagination object
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get single appointment
export const useAppointment = (id: number) => {
  return useQuery<Appointment>({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const response = await appointmentsAPI.get(id);
      return response.data; // Extract the appointment data from the API response
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

// Delete appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsAPI.delete(id),
    onSuccess: (_, id) => {
      // Only invalidate critical queries - appointments list
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Remove the specific appointment from cache
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(id) });
      
      // Statistics will update naturally or can be invalidated separately if needed
    },
  });
};

// Accept appointment
export const useAcceptAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: AppointmentActionData }) => {
      const response = await appointmentsAPI.accept(id, data);
      return response.data; // Extract the appointment data from the API response
    },
    onSuccess: (updatedAppointment, { id }) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(id), updatedAppointment);
      
      // Only invalidate critical queries - appointments list
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Statistics will update naturally or can be invalidated separately if needed
    },
  });
};

// Reschedule appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AppointmentRescheduleData }) => {
      const response = await appointmentsAPI.reschedule(id, data);
      return response.data; // Extract the appointment data from the API response
    },
    onSuccess: (updatedAppointment, { id }) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(id), updatedAppointment);
      
      // Only invalidate critical queries - appointments list
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Statistics will update naturally or can be invalidated separately if needed
    },
  });
};

// Cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: AppointmentCancelData }) => {
      const response = await appointmentsAPI.cancel(id, data);
      return response.data; // Extract the appointment data from the API response
    },
    onSuccess: (updatedAppointment, { id }) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(id), updatedAppointment);
      
      // Only invalidate critical queries - appointments list
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Statistics will update naturally or can be invalidated separately if needed
    },
  });
};

// Complete appointment
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: AppointmentCompleteData }) => {
      const response = await appointmentsAPI.complete(id, data);
      return response.data; // Extract the appointment data from the API response
    },
    onSuccess: (updatedAppointment, { id }) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(appointmentKeys.detail(id), updatedAppointment);
      
      // Only invalidate critical queries - appointments list
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Statistics will update naturally or can be invalidated separately if needed
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Get time slots for dropdowns
export const useTimeSlots = () => {
  return useQuery({
    queryKey: ['time-slots'],
    queryFn: appointmentsAPI.getTimeSlots,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get property types for dropdowns
export const usePropertyTypes = () => {
  return useQuery({
    queryKey: ['property-types'],
    queryFn: appointmentsAPI.getPropertyTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
