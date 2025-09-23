// Employee Types based on API Documentation
export interface Employee {
  id: number;
  employee_id: string | null;
  name: string;
  phone: string;
  email: string;
  position: string;
  department: string | null;
  hire_date: string | null;
  hire_date_formatted: string | null;
  status: 'active' | 'inactive' | 'terminated';
  status_label: string;
  notes: string | null;
  total_properties: number;
  total_referred_properties: number;
  total_handled_properties: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface CreateEmployeeData {
  employee_id?: string | null;
  name: string;
  phone: string;
  email: string;
  position: string;
  department?: string | null;
  hire_date?: string | null;
  status: 'active' | 'inactive' | 'terminated';
  notes?: string | null;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {}

export interface PropertyEmployeeAssignment {
  id: number;
  property_id: number;
  employee_id: number;
  assignment_type: 'referral' | 'handler';
  assignment_type_label: string;
  assigned_at: string;
  assigned_date_formatted: string;
  assigned_by: number | null;
  notes: string | null;
  employee?: Employee;
  property?: {
    id: number;
    title_en: string;
    title_mm: string;
    code: string;
    status: string;
    verification_status: string;
  };
  assigned_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface EmployeeFilters {
  search?: string;
  status?: string;
  position?: string;
  department?: string;
  deleted?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface EmployeeStatistics {
  total_count: number;
  active_count: number;
  inactive_count: number;
  terminated_count: number;
  total_properties: number;
  total_referred_properties: number;
  total_handled_properties: number;
}

