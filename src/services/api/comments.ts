// Comments API functions
import { apiRequest, QueryParams } from './base';

export interface Comment {
  id: number;
  user_id: number;
  property_id: number;
  parent_id: number | null;
  comment: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user: {
    id: number;
    name: string;
    slug: string;
    email: string;
    email_verified_at: string | null;
    user_type: string;
    member_level: string;
    original_user_type: string;
    is_active: boolean;
    last_login_at: string | null;
    last_active_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  replies: Comment[];
}

export interface CommentsResponse {
  property: {
    id: number;
    title_en: string;
    title_mm: string;
    comment_count: number;
  };
  comments: Comment[];
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

export const commentsAPI = {
  // Get comments for a specific property
  getPropertyComments: (propertyId: number, params?: QueryParams) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest<CommentsResponse>(`/property-comments/property/${propertyId}${queryString}`);
  },

  // Get a specific comment
  getComment: (commentId: number) =>
    apiRequest<Comment>(`/property-comments/${commentId}`),

  // Delete a comment
  deleteComment: (commentId: number) =>
    apiRequest(`/property-comments/${commentId}`, { method: 'DELETE' }),

  // Force delete a comment (permanent deletion)
  forceDeleteComment: (commentId: number) =>
    apiRequest(`/property-comments/${commentId}/force`, { method: 'DELETE' }),

  // Get comments statistics
  getStatistics: () =>
    apiRequest('/property-comments/statistics'),
};

