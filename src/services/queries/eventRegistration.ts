import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { eventRegistrationAPI } from '../api/eventRegistration';
import { EventRegistrationResponse } from '../../types/eventRegistration';

// Query keys
export const eventRegistrationKeys = {
  all: ['eventRegistrations'] as const,
  registrationUsers: (slug: string, params?: { page?: number; per_page?: number }) => 
    [...eventRegistrationKeys.all, 'users', slug, params] as const,
};

// React Query hooks
export const useEventRegistrationUsers = (
  slug: string, 
  params?: { page?: number; per_page?: number },
  options?: Omit<UseQueryOptions<EventRegistrationResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<EventRegistrationResponse>({
    queryKey: eventRegistrationKeys.registrationUsers(slug, params),
    queryFn: () => eventRegistrationAPI.getRegistrationUsers(slug, params),
    enabled: !!slug, // Only run query if slug is provided
    ...options, // Allow overriding default options
  });
};
