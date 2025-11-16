


/**
 * Interface for the Region object within a WantingList
 */
export interface Region {
  id: number;
  name_en: string;
  name_mm: string;
}

/**
 * Interface for the Township object within a WantingList
 */
export interface Township {
  id: number;
  name_en: string;
  name_mm: string;
}

/**
 * Interface for the Property Type object within a WantingList
 */
export interface PropertyType {
  id: number;
  name_en: string;
  name_mm: string;
}

/**
 * Interface for the Preferred Location object within a WantingList
 */
export interface PreferredLocation {
  region: Region;
  township: Township;
}

/**
 * Interface for the Location object within a WantingList
 */
export interface Location {
  region_en: string;
  township_en: string;
  region_mm: string;
  township_mm: string;
}

/**
 * Interface for the Budget object within a WantingList
 */
export interface Budget {
  min_budget: string; // Use string to match the "50000000.00" format
  max_budget: string; // Use string to match the "80000000.00" format
  budget_range: string;
}

/**
 * Interface for the Specifications object within a WantingList
 */
export interface Specifications {
  bedrooms: number;
  bathrooms: number;
  min_area: string | null;
  max_area: string | null;
  area_range: string;
}

/**
 * Interface for the Contact object within a WantingList
 */
export interface Contact {
  name: string;
  phone: string;
  email: string;
}

/**
 * Interface for the Status object within a WantingList
 */
export interface Status {
  verification_status: 'pending' | 'approved' | 'rejected'; // Assuming possible values
  status: 'draft' | 'published' | 'expired' | 'closed'; // Assuming possible values
  is_expired: boolean;
  is_published: boolean;
  expires_at: string | null;
}

/**
 * Interface for the User object within a WantingList
 */
export interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  member_level: string;
}

/**
 * Interface for a single Wanting List item
 */
export interface WantingList {
  id: number;
  slug: string;
  wanted_type: 'buyer' | 'renter' | string; // Based on the documentation
  wanted_type_label: string;
  title: string;
  description: string;
  additional_requirement?: string;
  property_type: PropertyType;
  preferred_location?: PreferredLocation; // Based on API response
  location?: Location; // Alternative format depending on the endpoint
  budget: Budget;
  specifications: Specifications;
  contact: Contact;
  status: Status;
  user?: User; // User who created the wanting list
  created_at: string;
  deleted_at?: string | null; // For soft deletes
  is_active?: boolean; // For status toggling
}

/**
 * Interface for the Pagination metadata
 */
export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  has_more_pages: boolean;
}

/**
 * Interface for the root of the API response
 */
export interface WantingListResponse {
  success: boolean;
  message: string;
  data: WantingList[];
  pagination: Pagination;
}


//******************************************************************************** */

/**
 * Interface for the request body when creating a new WantingList (POST)
 */
export interface CreateWantingListData {
  // Core Fields
  wanted_type: 'buyer' | 'seller' | string;
  title: string;
  description: string;

  // Property Type (usually sent as an ID)
  property_type_id: number;

  // Location (using IDs)
  region_id: number;
  township_id: number;

  // Budget
  min_budget: number; // Use number for input before server formatting
  max_budget: number; // Use number for input before server formatting

  // Specifications
  bedrooms: number;
  bathrooms: number;
  min_area: number;
  max_area: number;

  // Contact
  name: string;
  phone: string;
  email: string;

  // Optional status field
  status?: 'draft' | 'published';
}

/**
 * Interface for the request body when updating an existing WantingList (PUT/PATCH)
 * All fields are optional because updates are often partial.
 */
export interface UpdateWantingListData {
  // Core Fields
  wanted_type?: 'buyer' | 'seller' | string;
  title?: string;
  description?: string;

  // Property Type
  property_type_id?: number;

  // Location
  region_id?: number | null;
  township_id?: number | null;

  // Budget
  min_budget?: number;
  max_budget?: number;

  // Specifications
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;

  // Contact
  name?: string;
  phone?: string;
  email?: string;

  // Optional: Ability to manually update status (e.g., publish/unpublish)
  status?: 'draft' | 'published' | 'closed';
}