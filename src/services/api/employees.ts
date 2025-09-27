// Employees API functions
import { apiRequest, QueryParams } from './base';
import { buildCleanQueryString } from './properties';
import { Employee, CreateEmployeeData, UpdateEmployeeData, PropertyEmployeeAssignment, PropertyEmployeeReferral } from '../../types/employee';

// Employees-specific query parameters interface
export interface EmployeeQueryParams extends QueryParams {
  status?: string;
  position?: string;
  department?: string;
  deleted?: string;
}

export const employeesAPI = {
  // Get employee statistics
  statistics: () => {
    return apiRequest<{
      total_employees: number;
      active_employees: number;
      inactive_employees: number;
      terminated_employees: number;
      employees_with_properties: number;
      total_property_assignments: number;
      referral_assignments: number;
      handler_assignments: number;
    }>('/employees/statistics');
  },

  // Get list of employees
  list: (params?: EmployeeQueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<Employee[]>(`/employees${queryString}`);
  },

  // Get single employee
  get: (id: string) =>
    apiRequest<Employee>(`/employees/${id}`),

  // Create new employee
  create: (data: CreateEmployeeData) =>
    apiRequest<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update employee
  update: (id: string, data: UpdateEmployeeData) =>
    apiRequest<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete employee (soft delete)
  delete: (id: string) =>
    apiRequest(`/employees/${id}`, { method: 'DELETE' }),

  // Restore employee
  restore: (id: string) =>
    apiRequest<Employee>(`/employees/${id}/restore`, { method: 'POST' }),

  // Force delete employee (permanent delete)
  forceDelete: (id: string) =>
    apiRequest(`/employees/${id}/force`, { method: 'DELETE' }),

  // Get employee properties
  getProperties: (id: string, params?: QueryParams) => {
    const queryString = buildCleanQueryString(params);
    return apiRequest<PropertyEmployeeAssignment[]>(`/employees/${id}/properties${queryString}`);
  },

  // Assign property to employee
  assignProperty: (data: {
    property_id: number;
    employee_id: number;
    assignment_type: 'referral' | 'handler';
    notes?: string;
  }) =>
    apiRequest<PropertyEmployeeAssignment>('/employees/assign-property', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Unassign property from employee
  unassignProperty: (assignmentId: string) =>
    apiRequest(`/employees/unassign-property/${assignmentId}`, { method: 'DELETE' }),

  // Property Employee Referral Management
  // Bulk assign employees to property
  bulkAssignToProperty: (data: {
    property_id: number;
    employee_ids: number[];
    assignment_type: 'referral' | 'handler';
    referral_source?: string;
    referral_notes?: string;
    notes?: string;
  }) => {
    return apiRequest('/property-employee-referrals/bulk-assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get property referrals
  getPropertyReferrals: (propertyId: number) => {
    return apiRequest<PropertyEmployeeReferral[]>(`/property-employee-referrals/property/${propertyId}`);
  },

  // Remove assignment
  removeAssignment: (assignmentId: number) => {
    return apiRequest(`/property-employee-referrals/${assignmentId}`, {
      method: 'DELETE',
    });
  },
};
