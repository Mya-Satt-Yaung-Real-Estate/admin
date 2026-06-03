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

export interface Ward {
  id: number;
  township_id: number;
  ward_name_en: string;
  ward_name_mm: string;
  slug: string;
  township?: Township & {
    region?: Region;
  };
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

export interface CreateWardData {
  township_id: number;
  ward_name_en: string;
  ward_name_mm: string;
}

export interface UpdateWardData {
  township_id?: number;
  ward_name_en?: string;
  ward_name_mm?: string;
}

export interface YarpyatTax {
  id: number;
  ward_id: number;
  name_en: string;
  name_mm: string;
  price: number;
  slug: string;
  ward?: Ward & {
    township?: Township & {
      region?: Region;
    };
  };
}

export type YarpyatTaxConfigType = 'selling' | 'buying';

export interface YarpyatTaxConfig {
  id: number;
  slug: string;
  tax_type: YarpyatTaxConfigType;
  name_en: string;
  name_mm: string;
  percentage: number;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateYarpyatTaxData {
  ward_id: number;
  name_en: string;
  name_mm: string;
  price: number;
}

export interface UpdateYarpyatTaxData {
  ward_id?: number;
  name_en?: string;
  name_mm?: string;
  price?: number;
}

export interface CreateYarpyatTaxConfigData {
  tax_type: YarpyatTaxConfigType;
  name_en: string;
  name_mm: string;
  percentage: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateYarpyatTaxConfigData {
  tax_type?: YarpyatTaxConfigType;
  name_en?: string;
  name_mm?: string;
  percentage?: number;
  sort_order?: number;
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