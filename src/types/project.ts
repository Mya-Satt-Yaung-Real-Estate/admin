import { Media } from './media';
import { RegularUser } from './user';

export type ProjectCondition = 'under_construction' | 'ongoing' | 'upcoming';
export type ProjectPublishStatus = 'draft' | 'published' | 'unpublished';
export type ProjectCurrency = 'MMK' | 'USD' | 'THB' | 'CNY';

export interface ProjectUnitType {
  id?: number;
  name: string;
  area?: string | null;
  price_range?: string | null;
  description?: string | null;
  units?: string | null;
}

export interface ProjectPaymentPlan {
  id?: number;
  name: string;
  description?: string | null;
}

export interface ProjectPropertyType {
  id: number;
  name_en: string;
  name_mm: string;
  slug?: string;
}

export interface ProjectLocationRef {
  id: number;
  name_en: string;
  name_mm: string;
}

export interface ProjectLocation {
  region: ProjectLocationRef | null;
  township: ProjectLocationRef | null;
  address: string | null;
}

export interface ProjectPrice {
  min: number | string | null;
  max: number | string | null;
  currency: ProjectCurrency;
  range?: string | null;
}

export interface ProjectDeveloper {
  id: number;
  name: string;
  user_type: string;
  member_level?: string;
  company_slug?: string | null;
  profile_image_url?: string | null;
}

export interface ProjectContactInfo {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Project {
  id: number;
  user_id?: number;
  slug: string;
  title_en: string;
  title_mm: string;
  developer?: string | ProjectDeveloper | null;
  developer_user_type?: string;
  user?: RegularUser;
  property_type: ProjectPropertyType | null;
  location: ProjectLocation;
  total_units: string;
  completion_text: string;
  condition: ProjectCondition;
  publish_status: ProjectPublishStatus;
  price: ProjectPrice;
  description_en: string;
  description_mm: string;
  features?: string[];
  unit_types?: ProjectUnitType[];
  payment_plans?: ProjectPaymentPlan[];
  contact_info?: ProjectContactInfo;
  is_featured: boolean;
  show_on_homepage: boolean;
  view_count: number;
  primary_image?: Media | null;
  media?: {
    images: Media[];
    primary_image?: Media | null;
  };
  is_deleted: boolean;
  project_mode?: 'platform' | 'developer';
  dates?: {
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
}

export interface ProjectFilters {
  search?: string;
  user_id?: number;
  property_type_id?: number;
  region_id?: number;
  township_id?: number;
  condition?: ProjectCondition;
  publish_status?: ProjectPublishStatus;
  is_featured?: boolean;
  show_on_homepage?: boolean;
  min_price?: number;
  max_price?: number;
  date_from?: string;
  date_to?: string;
  only_trashed?: boolean;
  sort_by?: 'price_min' | 'price_max' | 'created_at' | 'updated_at' | 'view_count' | 'title_en';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ProjectStatistics {
  total: number;
  published: number;
  draft: number;
  unpublished: number;
  featured: number;
  show_on_homepage: number;
  deleted: number;
}

export interface ProjectFormData {
  is_platform_project?: boolean;
  user_id?: number;
  slug?: string;
  title_en: string;
  title_mm: string;
  property_type_id: number;
  region_id: number;
  township_id: number;
  address: string;
  total_units: string;
  completion_text: string;
  condition: ProjectCondition;
  publish_status: ProjectPublishStatus;
  price_min: number;
  price_max: number;
  currency: ProjectCurrency;
  description_en: string;
  description_mm: string;
  features?: string[];
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  is_featured?: boolean;
  show_on_homepage?: boolean;
  media_ids: number[];
  unit_types?: ProjectUnitType[];
  payment_plans?: ProjectPaymentPlan[];
}
