import { api } from './client';

export interface ViewButton {
  text: string;
  url: string;
  action: string;
}

export interface AdminNotification {
  id: number;
  admin_id: number | null; // Nullable for global notifications
  type: 'property' | 'feedback' | 'system_alert';
  title: string;
  body: string;
  data: {
    property_id?: number;
    feedback_id?: number;
    user_name?: string;
    property_title?: string;
    view_button?: ViewButton;
    [key: string]: any;
  };
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  data: AdminNotification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    unread_count: number;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: {
    property: number;
    feedback: number;
    system_alert: number;
  };
}

export const notificationApi = {
  /**
   * Get notifications for the authenticated admin
   */
  getNotifications: async (params?: {
    page?: number;
    per_page?: number;
    type?: string;
    is_read?: boolean;
  }): Promise<NotificationResponse> => {
    try {
      console.log('🌐 API Request - getNotifications with params:', params);
      const response = await api.get('/admin-notifications', { params });
      console.log('🌐 API Response - getNotifications:', response);
      console.log('🌐 API Response data:', response.data);
      return response.data as NotificationResponse;
    } catch (error) {
      // Return empty data if API endpoint doesn't exist yet
      console.warn('Admin notifications API not available yet:', error);
      return {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          unread_count: 0,
        },
      };
    }
  },

  /**
   * Get notification statistics
   */
  getStats: async (): Promise<NotificationStats> => {
    try {
      const response = await api.get('/admin-notifications/stats');
      return response.data as NotificationStats;
    } catch (error) {
      // Return empty stats if API endpoint doesn't exist yet
      console.warn('Admin notification stats API not available yet:', error);
      return {
        total: 0,
        unread: 0,
        by_type: {
          property: 0,
          feedback: 0,
          system_alert: 0,
        },
      };
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    try {
      await api.patch(`/admin-notifications/${id}/read`);
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch('/admin-notifications/mark-all-read');
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error);
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: number): Promise<void> => {
    try {
      await api.delete(`/admin-notifications/${id}`);
    } catch (error) {
      console.warn('Failed to delete notification:', error);
    }
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async (): Promise<void> => {
    try {
      await api.delete('/admin-notifications/delete-all');
    } catch (error) {
      console.error('❌ API - Failed to delete all notifications:', error);
      throw error;
    }
  },
};
