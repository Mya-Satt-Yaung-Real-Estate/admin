// AD Types based on AdsController API documentation
export interface AD {
  id: number;
  user_id: number;
  title_en: string | null;
  title_mm: string | null;
  description_en: string | null;
  description_mm: string | null;
  link: string | null;
  link_type: 'button_link' | 'text_link' | 'image_link' | null;
  link_text?: string | null;
  text_color_code?: string | null;
  price?: number;
  status: boolean;
  is_paid: boolean;
  is_published: boolean;
  display_location: 'homepage_block' | 'home-page-asidebar' | 'detail-page-asidebar' | 'detail-page-asidebar-2' | 'home_grid_ads';
  grid_index?: number | null;
  payment_date?: string | null;
  start_at?: string;
  end_at?: string;
  media_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // User info (company-owned ads)
  user?: {
    id: number;
    name: string;
    slug?: string;
    email?: string;
    phone?: string | null;
    user_type: 'admin' | 'individual' | 'company';
    company_id?: number;
    company_name?: string;
    company_slug?: string;
    company_phone?: string | null;
  };

  // Media info
  media?: {
    id: number;
    filename: string;
    url: string;
    thumbnail_url?: string;
    type: 'image' | 'video';
    size?: number;
    mime_type?: string;
    is_primary: boolean;
    status: 'completed' | 'uploading' | 'failed';
  };
  
  // Status flags
  is_deleted?: boolean;
  is_active?: boolean;
}

export interface ADFormData {
  title_en: string | null;
  title_mm: string | null;
  description_en: string | null;
  description_mm: string | null;
  link: string | null;
  link_type: 'button_link' | 'text_link' | 'image_link' | null;
  link_text?: string | null;
  text_color_code?: string | null;
  price?: number;
  status: boolean;
  is_paid: boolean;
  is_published: boolean;
  display_location: 'homepage_block' | 'home-page-asidebar' | 'detail-page-asidebar' | 'detail-page-asidebar-2' | 'home_grid_ads';
  grid_index?: number | null;
  payment_date?: string | null;
  start_at?: string;
  end_at?: string;
  media_id: number;
  /** Required for all display locations except Home page Main Slider. */
  user_id?: number | null;
}

export interface ADFilters {
  // Pagination
  page?: number;
  per_page?: number;

  // Search and filters
  search?: string;
  status?: string;
  display_location?: string;
  is_paid?: boolean;
  is_published?: boolean;
  user_id?: number;
  date_from?: string;
  date_to?: string;

  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';

  [key: string]: any;
}

export interface ADListResponse {
  success: boolean;
  message: string;
  data: AD[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

export interface ADResponse {
  success: boolean;
  message: string;
  data: AD;
}

export interface ADStatistics {
  total: number;
  active: number;
  inactive: number;
  paid: number;
  unpaid: number;
  homepage_slider: number;
  homepage_asidebar: number;
  detail_page_asidebar: number;
  /** Present when API returns per-location breakdown for second detail sidebar slot */
  detail_page_asidebar_2?: number;
}

export interface ADStatisticsResponse {
  success: boolean;
  message: string;
  data: ADStatistics;
}

// Display location limits
export const DISPLAY_LOCATION_LIMITS = {
  'homepage_block': 3,       // Maximum 3 active ads per block slot (grid_index 1–2)
  'home-page-asidebar': 3,   // Maximum 3 active ads
  'detail-page-asidebar': 3, // Maximum 3 active ads
  'detail-page-asidebar-2': 3, // Maximum 3 active ads (second sidebar strip)
  'home_grid_ads': 3,        // Per grid slot (grid_index 1–4)
} as const;

// Status options
export const AD_STATUSES = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
] as const;

// Link type options
export const AD_LINK_TYPES = [
  { value: 'button_link', label: 'Button Link' },
  { value: 'text_link', label: 'Text Link' },
  { value: 'image_link', label: 'Image Link' },
] as const;

// Constant and helper: Only ads outside the main slider require a company user.
export const AD_DISPLAY_LOCATION_MAIN_SLIDER = 'home-page-asidebar' as const;

export function adRequiresCompanyUser(displayLocation: string): boolean {
  return Boolean(displayLocation) && displayLocation !== AD_DISPLAY_LOCATION_MAIN_SLIDER;
}

export function adUsesGridIndex(displayLocation: string): boolean {
  return displayLocation === 'home_grid_ads' || displayLocation === 'homepage_block';
}

export function adGridIndexMax(displayLocation: string): number {
  if (displayLocation === 'home_grid_ads') return 4;
  if (displayLocation === 'homepage_block') return 2;
  return 0;
}

export function adGridSlotLabel(displayLocation: string, gridIndex: number): string {
  if (displayLocation === 'homepage_block') {
    return gridIndex === 1 ? 'Left' : gridIndex === 2 ? 'Right' : `Slot ${gridIndex}`;
  }
  return `Grid ${gridIndex}`;
}

/** Coerce API/form values to a slot number or null. */
export function normalizeAdGridIndex(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Default slot when a location requires grid_index but legacy data has none. */
export function defaultAdGridIndex(displayLocation: string, gridIndex: unknown): number | null {
  const normalized = normalizeAdGridIndex(gridIndex);
  if (normalized != null) return normalized;
  return adUsesGridIndex(displayLocation) ? 1 : null;
}

/** MUI Select value — always string for reliable MenuItem matching. */
export function adGridIndexSelectValue(gridIndex: number | null | undefined): string {
  const n = normalizeAdGridIndex(gridIndex);
  return n != null ? String(n) : '';
}

export function applyDisplayLocationSlotDefaults(
  displayLocation: string,
  currentGridIndex: unknown
): number | null {
  if (!adUsesGridIndex(displayLocation)) return null;
  const max = adGridIndexMax(displayLocation);
  const current = normalizeAdGridIndex(currentGridIndex);
  if (current == null || current < 1 || current > max) return 1;
  return current;
}

export interface AdCompanyColumnInfo {
  userName: string;
  companyName: string;
  phone: string;
}

export function getAdCompanyColumnInfo(ad: AD): AdCompanyColumnInfo | null {
  if (!ad.user || ad.user.user_type !== 'company') {
    return null;
  }

  const phone =
    String(ad.user.phone ?? ad.user.company_phone ?? '').trim() || '—';

  return {
    userName: ad.user.name,
    companyName: ad.user.company_name ?? ad.user.name,
    phone,
  };
}

const AD_OPTIONAL_NULLABLE_STRING_FIELDS = [
  'title_en',
  'title_mm',
  'description_en',
  'description_mm',
  'link',
  'link_text',
  'text_color_code',
  'payment_date',
] as const;

/**
 * Convert cleared optional AD form fields to null before API submit.
 */
export function normalizeAdFormPayload<T extends Partial<ADFormData>>(data: T): T {
  const result = { ...data } as Record<string, unknown>;

  for (const field of AD_OPTIONAL_NULLABLE_STRING_FIELDS) {
    const value = result[field];
    if (value === '' || value === undefined) {
      result[field] = null;
    }
  }

  if (result.price === '' || result.price === undefined) {
    result.price = null;
  }

  if (!result.link) {
    result.link_text = null;
  }

  return result as T;
}

// Fields that should be touched (set to true) when the form is submitted.
export const AD_FORM_SUBMIT_TOUCH_FIELDS: Record<string, boolean> = {
  display_location: true,
  start_at: true,
  end_at: true,
  status: true,
  media_id: true,
  link_text: true,
  user_id: true,
  grid_index: true,
  link: true,
  title_en: true,
  title_mm: true,
  description_en: true,
  description_mm: true,
  text_color_code: true,
};

// Return the first error message string from a (possibly nested) Yup errors object.
export function getFirstYupFormError(errors: Record<string, unknown>): string | null {
  for (const value of Object.values(errors)) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (value && typeof value === 'object') {
      const nested = getFirstYupFormError(value as Record<string, unknown>);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

// Mark every field in the "errors" object as touched (set to true)
export function buildTouchedFieldsForFormErrors(errors: Record<string, unknown>): Record<string, boolean> {
  return Object.keys(errors).reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
}

export const AD_END_DATE_WARNING =
  'The end date is today. Set a future end date if you want this ad to stay active longer.';

export const AD_ACTIVE_PAST_SCHEDULE_MESSAGE =
  'Cannot set this AD to Active — the schedule has already ended. Extend the end date to today or later or keep status Inactive.';

function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseEndDate(endAt: string): string | null 
{
  // If endAt is already in 'YYYY-MM-DD' format, return it directly.
  if (/^\d{4}-\d{2}-\d{2}$/.test(endAt)) {
    return endAt;
  }

  // If endAt is in MySQL DATETIME format, extract and return the YYYY-MM-DD part
  const mysqlDatetime = endAt.match(/^(\d{4}-\d{2}-\d{2}) \d{2}:\d{2}:\d{2}$/);
  if (mysqlDatetime) {
    return mysqlDatetime[1];
  }

  const parsed = new Date(endAt);
  return Number.isNaN(parsed.getTime()) ? null : localDateString(parsed);
}

/** Show UI warning when end date is today or earlier. */
export function isAdEndDateExpired(endAt: string | null | undefined): boolean {
  if (!endAt) return false;
  const end = parseEndDate(endAt);
  return end !== null && end <= localDateString(new Date());
}

/** End date is before today (matches API: active allowed when end date is today or later). */
export function isAdEndDateBeforeToday(endAt: string | null | undefined): boolean {
  if (!endAt) return false;
  const end = parseEndDate(endAt);
  return end !== null && end < localDateString(new Date());
}

/** Entire schedule has ended (both dates set and end date is before today). */
export function isAdScheduleFullyPast(
  startAt: string | null | undefined,
  endAt: string | null | undefined
): boolean {
  if (!startAt || !endAt) return false;
  return isAdEndDateBeforeToday(endAt);
}

/** Active status conflicts with a schedule that has already ended. */
export function isAdActiveWithPastSchedule(
  status: boolean,
  startAt: string | null | undefined,
  endAt: string | null | undefined
): boolean {
  return Boolean(status) && isAdScheduleFullyPast(startAt, endAt);
}

// Display location options
export const AD_DISPLAY_LOCATIONS = [
  { value: 'homepage_block', label: 'Homepage Block' },
  { value: 'home-page-asidebar', label: 'Home page Main Slider' },
  { value: 'detail-page-asidebar', label: 'Detail Page Sidebar 1' },
  { value: 'detail-page-asidebar-2', label: 'Detail Page Sidebar 2' },
  { value: 'home_grid_ads', label: 'Home Grid ADS' },
] as const;