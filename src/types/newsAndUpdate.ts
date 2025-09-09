// News & Updates Types based on API Documentation

export interface NewsAndUpdate {
  id: number;
  title_en: string;
  title_mm: string;
  slug: string;
  is_active: boolean;
  category: {
    id: number;
    slug: string;
    name_en: string;
    name_mm: string;
  };
  short_description: string;
  main_content: string;
  view_count: number;
  like_count: number;
  writer_name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  images?: {
    id: number;
    type: string;
    file_name: string;
    url: string;
  };
  tag: string[];
}

export interface CreateNewsAndUpdateData {
  title_en: string;
  title_mm: string;
  news_article_category_id: number;
  short_description: string;
  main_content: string;
  writer_name: string;
  is_active?: boolean;
  tag?: string[];
  media_id: number;
}

export interface UpdateNewsAndUpdateData {
  title_en?: string;
  title_mm?: string;
  news_article_category_id?: number;
  short_description?: string;
  main_content?: string;
  writer_name?: string;
  is_active?: boolean;
  tag?: string[];
  media_id?: number;
}

export interface NewsAndUpdateFilters {
  search?: string;
  category_id?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
