export interface KnowledgeHub {
  id: number;
  title_en: string;
  title_mm: string;
  short_description: string;
  main_content: string;
  slug: string;
  view_count: number;
  like_count: number;
  is_active: boolean;
  writer_name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relationships
  category?: {
    id: number;
    name_en: string;
    name_mm: string;
    slug: string;
  };
  
  images?: {
    id: number;
    type: string;
    file_name: string;
    url: string;
  };
  
  tag?: string[];
}

export interface CreateKnowledgeHubData {
  title_en: string;
  title_mm: string;
  short_description: string;
  main_content: string;
  news_article_category_id: number;
  media_id: number;
  writer_name: string;
  tag: string[];
  is_active: boolean;
}

export interface UpdateKnowledgeHubData {
  title_en?: string;
  title_mm?: string;
  short_description?: string;
  main_content?: string;
  news_article_category_id?: number;
  media_id?: number;
  writer_name?: string;
  tag?: string[];
  is_active?: boolean;
}

export interface KnowledgeHubCategory {
  id: number;
  name_en: string;
  name_mm: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
