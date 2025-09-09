// Feedback types
export interface Feedback {
  id: number;
  user_name: string;
  slug: string;
  email: string;
  phone: string;
  feedback: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  user_name?: string;
  email?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  message: string;
  data: Feedback[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

export interface FeedbackQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  user_name?: string;
  email?: string;
}
