// Lawyer Types based on API Analysis
export interface Lawyer {
  id: number;
  name: string;
  slug: string;
  title: string;
  region_id: number;
  township_id: number;
  region: {
    name_mm: string;
    name_en: string;
  };
  township: {
    name_mm: string;
    name_en: string;
  };
  address?: string;
  experience_years: number;
  phone?: string;
  email?: string;
  specialization: string;
  skillful_languages: string[];
  services?: string[];
  about?: string;
  education: string[];
  certifications: string[];
  status: boolean;
  images?: string;
  media?: {
    id: number;
    file_name: string;
    file_url: string;
    mime_type: string;
    size: number;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateLawyerData {
  name: string;
  title: string;
  region_id: number;
  township_id: number;
  address?: string;
  experience_years: number;
  phone?: string;
  email?: string;
  specialization: string;
  skillful_languages: string[];
  services?: string[];
  about?: string;
  education: string[];
  certifications: string[];
  media_id: number;
}

export interface LawyerFormData {
  name: string;
  title: string;
  region_id?: number;
  township_id?: number;
  address?: string;
  experience_years?: number;
  phone?: string;
  email?: string;
  specialization: string;
  skillful_languages: string[];
  services?: string[];
  about?: string;
  education: string[];
  certifications: string[];
  media_id?: number;
  status?: boolean;
}

export interface UpdateLawyerData {
  name?: string;
  title?: string;
  region_id?: number;
  township_id?: number;
  address?: string;
  experience_years?: number;
  phone?: string;
  email?: string;
  specialization?: string;
  skillful_languages?: string[];
  services?: string[];
  about?: string;
  education?: string[];
  certifications?: string[];
  media_id?: number;
  status?: boolean;
}

export interface LawyerQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  region_id?: number;
  township_id?: number;
  specialization?: string;
  status?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// Lawyer Statistics Response
export interface LawyerStatistics {
  total_lawyers: number;
  active_lawyers: number;
  inactive_lawyers: number;
  by_region: Array<{
    region_name: string;
    count: number;
  }>;
  by_specialization: Array<{
    specialization: string;
    count: number;
  }>;
}
