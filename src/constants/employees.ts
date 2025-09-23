// Employee-related constants
export const EMPLOYEE_POSITIONS = [
  { value: 'Property Manager', label: 'Property Manager' },
  { value: 'Sales Representative', label: 'Sales Representative' },
  { value: 'Senior Sales Representative', label: 'Senior Sales Representative' },
  { value: 'Team Lead', label: 'Team Lead' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Assistant Manager', label: 'Assistant Manager' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Senior Manager', label: 'Senior Manager' },
  { value: 'Director', label: 'Director' },
  { value: 'Executive', label: 'Executive' },
] as const;

export const EMPLOYEE_DEPARTMENTS = [
  { value: 'Sales', label: 'Sales' },
  { value: 'Property Management', label: 'Property Management' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Customer Service', label: 'Customer Service' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Administration', label: 'Administration' },
  { value: 'Other', label: 'Other...' },
] as const;

export const EMPLOYEE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
] as const;

// Helper functions to get labels
export const getPositionLabel = (value: string): string => {
  const position = EMPLOYEE_POSITIONS.find(p => p.value === value);
  return position?.label || value;
};

export const getDepartmentLabel = (value: string): string => {
  const department = EMPLOYEE_DEPARTMENTS.find(d => d.value === value);
  return department?.label || value;
};

export const getStatusLabel = (value: string): string => {
  const status = EMPLOYEE_STATUSES.find(s => s.value === value);
  return status?.label || value;
};

// Type definitions for better TypeScript support
export type EmployeePosition = typeof EMPLOYEE_POSITIONS[number]['value'];
export type EmployeeDepartment = typeof EMPLOYEE_DEPARTMENTS[number]['value'];
export type EmployeeStatus = typeof EMPLOYEE_STATUSES[number]['value'];

