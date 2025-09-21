// Faq Request types

export interface Faq {
  id: number;
  slug: string;
  question_en: string;
  question_mm: string;
  answer_en: string;
  answer_mm: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FaqFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

// API Response types
export interface FaqListResponse {
  success: boolean;
  message: string;
  data: Faq[];
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

export interface FaqDetailResponse {
  success: boolean;
  message: string;
  data: Faq;
}

export interface UpdateFaqData {
  slug?: string;
  question_en?: string;
  question_mm?: string;
  answer_en?: string;
  answer_mm?: string;
  is_active?: boolean;
  order?: number;
}
