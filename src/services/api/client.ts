import { apiRequest } from './base';

// Create a simple API client that wraps the existing apiRequest function
export const api = {
  get: async (endpoint: string, config?: { params?: any }) => {
    const queryString = config?.params ? `?${new URLSearchParams(config.params).toString()}` : '';
    return apiRequest(`${endpoint}${queryString}`, { method: 'GET' });
  },
  
  post: async (endpoint: string, data?: any) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put: async (endpoint: string, data?: any) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  patch: async (endpoint: string, data?: any) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (endpoint: string) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  },
};

