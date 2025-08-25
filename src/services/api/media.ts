import { UploadMediaRequest, UploadMediaResponse } from '../../types/media';

// Frontend API base URL for media uploads (bypassing admin proxy)
const FRONTEND_API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8000/api/v1' // Direct call to backend in development
  : (import.meta.env.VITE_FRONTEND_API_URL || 'https://msy-api.phyozaw.info/api/v1');

export const mediaAPI = {
  // Upload image or video
  upload: async (data: UploadMediaRequest): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('media_type', data.media_type);

    const url = `${FRONTEND_API_BASE_URL}/media`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('admin_token');
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type, let the browser set it with boundary for FormData
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  },

  // Delete media
  delete: async (mediaId: number): Promise<{ success: boolean; message: string }> => {
    const url = `${FRONTEND_API_BASE_URL}/media/${mediaId}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('admin_token');
    
    const config: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Media delete error:', error);
      throw error;
    }
  },
};
