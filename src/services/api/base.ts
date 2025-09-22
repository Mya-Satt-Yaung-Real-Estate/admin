// Base API configuration and request function
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // Use proxy in development (now points to localhost:8000)
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

// Simple query parameters - generic interface for all API services
export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  [key: string]: any;
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  try {
    // First check for admin_token (used by the login hook)
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      return adminToken;
    }
    
    // Then check Zustand store
    const authStoreData = localStorage.getItem('auth-storage');
    const authStore = JSON.parse(authStoreData || '{}');
    
    // Zustand stores data in a 'state' property when using persist middleware
    const token = authStore.state?.token || authStore.token || null;
    
    return token;
  } catch (error) {
    console.error('Error parsing auth store:', error);
    return null;
  }
}

// Base API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token
  const token = getAuthToken();
  
  console.log('🌐 API Request:', { url, token: token ? 'Present' : 'Missing', endpoint });
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ API Error: Response is not JSON:', {
        contentType,
        status: response.status,
        statusText: response.statusText,
      });
      
      // Try to get response text for debugging
      const responseText = await response.text();
      console.error('❌ API Error: Response body (first 500 chars):', responseText.substring(0, 500));
      
      // Check if it's an authentication issue
      if (response.status === 200 && responseText.includes('login')) {
        throw {
          message: 'Authentication required. Please log in again.',
          status: 401,
          isAuthError: true,
        };
      }
      
      // Check if it's a redirect to login
      if (response.status === 302 || response.status === 301) {
        throw {
          message: 'Session expired. Please log in again.',
          status: 401,
          isAuthError: true,
        };
      }
      
      throw {
        message: `Server returned ${response.status} ${response.statusText}. Expected JSON but got ${contentType}`,
        status: response.status,
        responseText: responseText.substring(0, 200),
      };
    }

    const data = await response.json();
    
    console.log('📡 API Response:', { 
      url, 
      status: response.status, 
      success: data.success, 
      dataKeys: Object.keys(data),
      hasData: !!data.data 
    });

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
