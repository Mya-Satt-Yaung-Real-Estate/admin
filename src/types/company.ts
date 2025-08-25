// Company Type Types
export interface CompanyType {
  id: number;
  name_en: string;
  name_mm: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyTypeData {
  name_en: string;
  name_mm: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCompanyTypeData {
  name_en?: string;
  name_mm?: string;
  description?: string;
  is_active?: boolean;
}

export interface CompanyTypeFilters {
  searchTerm: string;
  statusFilter: string;
}
