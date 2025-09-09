// News Article Category Types based on API Documentation

export interface NewsArticleCategory {
  id: number;
  name_en: string;
  name_mm: string;
  slug: string;
  description?: string;
  is_active: boolean;
  type: 'news_update' | 'knowledge_hub';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateNewsArticleCategoryData {
  name_en: string;
  name_mm: string;
  description?: string;
  type: 'news_update' | 'knowledge_hub';
  is_active?: boolean;
}

export interface UpdateNewsArticleCategoryData {
  name_en?: string;
  name_mm?: string;
  description?: string;
  type?: 'news_update' | 'knowledge_hub';
  is_active?: boolean;
}

export interface NewsArticleCategoryFilters {
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
