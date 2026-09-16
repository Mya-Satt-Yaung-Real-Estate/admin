/**
 * Admin V2 Property Notes types (list / show).
 */

export interface PropertyNoteUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  user_type: string | null;
}

export interface PropertyNoteNamedRef {
  id: number;
  name_en: string;
  name_mm: string;
  slug?: string;
}

export interface PropertyNotePrimaryImage {
  id: number;
  url?: string | null;
  thumbnail_url?: string | null;
  small_url?: string | null;
  medium_url?: string | null;
  is_primary?: boolean;
  [key: string]: unknown;
}

export type PropertyNoteStatus = 'active' | 'sold' | 'rented';

export interface PropertyNote {
  id: number;
  note_code: string;
  status: PropertyNoteStatus | string;
  is_locked: boolean;
  ward: string | null;
  road: string | null;
  length_ft: number | null;
  width_ft: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  listing_type: PropertyNoteNamedRef | null;
  region: Omit<PropertyNoteNamedRef, 'slug'> | null;
  township: Omit<PropertyNoteNamedRef, 'slug'> | null;
  user: PropertyNoteUser | null;
  primary_image: PropertyNotePrimaryImage | null;
  /** Present on detail show when images relation is loaded. */
  images?: PropertyNotePrimaryImage[];
}

export interface PropertyNoteStatistics {
  total: number;
  active: number;
  sold: number;
  rented: number;
}

export interface PropertyNoteListFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: PropertyNoteStatus | 'all' | '';
  listing_type_id?: number;
  region_id?: number;
  township_id?: number;
  user_id?: number;
}

export interface PropertyNotesListResponse {
  success: boolean;
  message: string;
  data: PropertyNote[];
  statistics: PropertyNoteStatistics;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
}
