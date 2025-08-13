// Base API configuration and request function
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // Use proxy in development
  : (import.meta.env.VITE_API_URL || 'https://msy-api.phyozaw.info/api/v1/admin');

// Simple API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
  };
}

// API error response type
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

// Simple query parameters
export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  [key: string]: any;
}

// Base API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from localStorage
  const token = localStorage.getItem('admin_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    // Handle API error responses (success: false)
    if (!data.success) {
      const errorResponse = data as ApiErrorResponse;
      throw {
        message: errorResponse.message,
        errors: errorResponse.errors,
        status: response.status,
      };
    }

    // Handle HTTP errors
    if (!response.ok) {
      throw {
        message: data.message || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
      };
    }
    throw error;
  }
}
