import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyReferralsAPI, PropertyReferralQueryParams } from '../api/propertyReferrals';
import { CreatePropertyReferralAssignmentData, UpdatePropertyReferralAssignmentData } from '../../types/propertyReferral';
import { QueryParams } from '../api/base';

// Query keys for property referrals
export const propertyReferralKeys = {
  all: ['propertyReferrals'] as const,
  lists: () => [...propertyReferralKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...propertyReferralKeys.lists(), params] as const,
  details: () => [...propertyReferralKeys.all, 'detail'] as const,
  detail: (id: number) => [...propertyReferralKeys.details(), id] as const,
  statistics: () => [...propertyReferralKeys.all, 'statistics'] as const,
};

// Get property referral statistics
export const usePropertyReferralStatistics = () => {
  return useQuery({
    queryKey: propertyReferralKeys.statistics(),
    queryFn: () => propertyReferralsAPI.statistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};

// Get list of property referrals
export const usePropertyReferrals = (params?: PropertyReferralQueryParams) => {
  return useQuery({
    queryKey: propertyReferralKeys.list(params),
    queryFn: () => propertyReferralsAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single property referral
export const usePropertyReferral = (id: number) => {
  return useQuery({
    queryKey: propertyReferralKeys.detail(id),
    queryFn: () => propertyReferralsAPI.get(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Assign employee to property
export const useAssignEmployeeToProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyReferralAssignmentData) => 
      propertyReferralsAPI.assignEmployee(data),
    onSuccess: () => {
      // Invalidate and refetch property referrals lists
      queryClient.invalidateQueries({ queryKey: propertyReferralKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: propertyReferralKeys.statistics() });
    },
  });
};

// Unassign employee from property
export const useUnassignEmployeeFromProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: number) => 
      propertyReferralsAPI.unassignEmployee(assignmentId),
    onSuccess: () => {
      // Invalidate and refetch property referrals lists
      queryClient.invalidateQueries({ queryKey: propertyReferralKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: propertyReferralKeys.statistics() });
    },
  });
};

// Update assignment
export const useUpdatePropertyReferralAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: number; data: UpdatePropertyReferralAssignmentData }) =>
      propertyReferralsAPI.updateAssignment(assignmentId, data),
    onSuccess: () => {
      // Invalidate and refetch property referrals lists
      queryClient.invalidateQueries({ queryKey: propertyReferralKeys.lists() });
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: propertyReferralKeys.statistics() });
    },
  });
};

// Export property referrals to Excel
export const useExportPropertyReferrals = () => {
  return useMutation({
    mutationFn: (params?: PropertyReferralQueryParams) => 
      propertyReferralsAPI.export(params),
  });
};

