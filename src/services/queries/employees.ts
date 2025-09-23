// Employees React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesAPI, EmployeeQueryParams } from '../api/employees';
import { CreateEmployeeData, UpdateEmployeeData } from '../../types/employee';
import { QueryParams } from '../api/base';

// Query keys for employees
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  statistics: () => [...employeeKeys.all, 'statistics'] as const,
  properties: (id: string) => [...employeeKeys.all, 'properties', id] as const,
};

// Get employee statistics
export const useEmployeeStatistics = () => {
  return useQuery({
    queryKey: employeeKeys.statistics(),
    queryFn: () => employeesAPI.statistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes - statistics can be cached longer
  });
};

// Get list of employees
export const useEmployees = (params?: EmployeeQueryParams) => {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeesAPI.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes - same as properties
  });
};

// Get single employee
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeesAPI.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - same as properties
  });
};

// Create employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeData) => employeesAPI.create(data),
    onSuccess: (response: any) => {
      // Invalidate and refetch employees lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      
      // If employee was created successfully and has an id, invalidate specific employee detail
      if (response?.data?.id) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(response.data.id.toString()) });
      }
    },
  });
};

// Update employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      employeesAPI.update(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate and refetch employees lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      // Invalidate specific employee detail
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      // Update the employee detail cache with the new data
      if (response?.data) {
        queryClient.setQueryData(employeeKeys.detail(id), response);
      }
    },
  });
};

// Delete employee (soft delete)
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesAPI.delete(id),
    onSuccess: (_, id) => {
      // Remove the specific employee from cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) });
      // Invalidate and refetch employees lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

// Restore employee
export const useRestoreEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesAPI.restore(id),
    onSuccess: (data, id) => {
      // Update the specific employee in cache
      queryClient.setQueryData(
        employeeKeys.detail(id),
        data
      );
      // Invalidate and refetch employees lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

// Force delete employee (permanent delete)
export const useForceDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesAPI.forceDelete(id),
    onSuccess: (_, id) => {
      // Remove the specific employee from cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) });
      // Invalidate and refetch employees lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

// Get employee properties
export const useEmployeeProperties = (id: string, params?: QueryParams) => {
  return useQuery({
    queryKey: employeeKeys.properties(id),
    queryFn: () => employeesAPI.getProperties(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - same as properties
  });
};

// Assign property to employee
export const useAssignProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      property_id: number;
      employee_id: number;
      assignment_type: 'referral' | 'handler';
      notes?: string;
    }) => employeesAPI.assignProperty(data),
    onSuccess: (_, variables) => {
      // Invalidate employee properties for the specific employee
      queryClient.invalidateQueries({ queryKey: employeeKeys.properties(variables.employee_id.toString()) });
      // Invalidate employees lists to update property counts
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

// Unassign property from employee
export const useUnassignProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => employeesAPI.unassignProperty(assignmentId),
    onSuccess: () => {
      // Invalidate all employee properties queries
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.all, 'properties'] });
      // Invalidate employees lists to update property counts
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};
