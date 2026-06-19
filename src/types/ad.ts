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
  'homepage_block': 3,       // Maximum 3 active ads
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