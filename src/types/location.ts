// Location Types based on API Documentation
export interface Region {
  id: number;
  name_mm: string;
  name_en: string;
  slug: string;
  description?: string;
  is_active: boolean;
  townships?: Township[];
}

export interface Township {
  id: number;
  region_id: number;
  name_mm: string;
  name_en: string;
  slug: string;
  is_active: boolean;
  description?: string;
  region?: Region;
}

export interface CreateRegionData {
  name_mm: string;
  name_en: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateRegionData {
  name_mm?: string;
  name_en?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateTownshipData {
  region_id: number;
  name_mm: string;
  name_en: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateTownshipData {
  region_id?: number;
  name_mm?: string;
  name_en?: string;
  description?: string;
  is_active?: boolean;
}

// Form data types for components
export interface RegionFormData {
  name_en: string;
  name_mm: string;
  is_active: boolean;
  description: string;
}

export interface TownshipFormData {
  name_en: string;
  name_mm: string;
  region_id: number;
  is_active: boolean;
  description: string;
}

export interface LocationFilters {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
} 