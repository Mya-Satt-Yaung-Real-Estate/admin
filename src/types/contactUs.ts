// Contact Us types
export interface ContactUs {
  id: number;
  user_name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  subject: string;
  category: string;
  message: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ContactUsFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  user_name?: string;
  email?: string;
  category?: string;
}

export interface ContactUsListResponse {
  success: boolean;
  message: string;
  data: ContactUs[];
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

export interface ContactUsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  user_name?: string;
  email?: string;
  category?: string;
}
