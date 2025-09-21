import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI, BookingQueryParams } from '../api/bookings';
import { 
  CreateBookingData, 
  UpdateBookingData, 
  BookingActionData,
  BookingRescheduleData,
  BookingCancelData,
  BookingAssignData
} from '../../types/booking';
import { QueryParams } from '../api/base';

// Query keys for bookings
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
  statistics: () => [...bookingKeys.all, 'statistics'] as const,
};

// Get booking statistics
export const useBookingStatistics = () => {
  return useQuery({
    queryKey: bookingKeys.statistics(),
    queryFn: () => bookingsAPI.statistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};

// Get list of bookings
export const useBookings = (params?: BookingQueryParams) => {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single booking
export const useBooking = (id: number) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsAPI.get(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingData }) =>
      bookingsAPI.update(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate the specific booking to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
  });
};

// Delete booking
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookingsAPI.delete(id),
    onSuccess: (_, id) => {
      // Remove the specific booking from cache
      queryClient.removeQueries({ queryKey: bookingKeys.detail(id) });
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
  });
};

// Create booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingData) => bookingsAPI.create(data),
    onSuccess: () => {
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
  });
};

// Accept booking
export const useAcceptBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: BookingActionData }) =>
      bookingsAPI.accept(id, data),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(
        bookingKeys.detail(variables.id),
        data
      );
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
  });
};

// Reschedule booking
export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingRescheduleData }) =>
      bookingsAPI.reschedule(id, data),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(
        bookingKeys.detail(variables.id),
        data
      );
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
  });
};

// Cancel booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingCancelData }) =>
      bookingsAPI.cancel(id, data),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(
        bookingKeys.detail(variables.id),
        data
      );
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
  });
};

// Assign booking
export const useAssignBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingAssignData }) =>
      bookingsAPI.assign(id, data),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(
        bookingKeys.detail(variables.id),
        data
      );
      // Invalidate and refetch bookings lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
  });
};

// Admin Users Query
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => bookingsAPI.getAdminUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};