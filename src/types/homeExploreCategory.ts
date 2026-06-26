export interface HomeExploreCategory {
  id: number;
  title_en: string;
  title_mm: string;
  description_en: string | null;
  description_mm: string | null;
  link_path: string;
  icon_key: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeExploreCategoryQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: 'sort_order' | 'title_en' | 'created_at' | 'updated_at';
  sort_direction?: 'asc' | 'desc';
}

export interface HomeExploreCategoryFormData {
  title_en: string;
  title_mm: string;
  description_en: string | null;
  description_mm: string | null;
  link_path: string;
  icon_key: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface HomeExploreCategoryReorderItem {
  id: number;
  sort_order: number;
}

export const HOME_EXPLORE_CATEGORY_MAX_ACTIVE = 9;

export const HOME_EXPLORE_CATEGORY_ICON_OPTIONS = [
  { value: 'crown', label: 'Crown (Premium)' },
  { value: 'trending_up', label: 'Trending Up (Investor)' },
  { value: 'handshake', label: 'Handshake (Partnership)' },
  { value: 'tag', label: 'Tag (For Sales)' },
  { value: 'badge_check', label: 'Badge Check (Featured)' },
  { value: 'list', label: 'List (Wanted Lists)' },
  { value: 'credit_card', label: 'Credit Card (Installment)' },
  { value: 'megaphone', label: 'Megaphone (Advertisement)' },
  { value: 'building2', label: 'Building (Project)' },
  { value: 'shopping_cart', label: 'Shopping Cart (Marketplace)' },
  { value: 'grid3x3', label: 'Grid (Category)' },
  { value: 'calendar', label: 'Calendar (Event)' },
  { value: 'star', label: 'Star' },
  { value: 'youtube', label: 'YouTube (Home Tour)' },
  { value: 'home', label: 'Home (Default)' },
] as const;
