import { create } from 'zustand';
import { AdminNotification, NotificationStats } from '../services/api/notifications';

interface NotificationState {
  notifications: AdminNotification[];
  unreadCount: number;
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNotifications: (notifications: AdminNotification[]) => void;
  addNotification: (notification: AdminNotification) => void;
  updateNotification: (id: number, updates: Partial<AdminNotification>) => void;
  removeNotification: (id: number) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setStats: (stats: NotificationStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  stats: null,
  isLoading: false,
  error: null,

  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
  
  updateNotification: (id, updates) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === id ? { ...notification, ...updates } : notification
    ),
  })),
  
  removeNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id);
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notification && !notification.is_read 
        ? state.unreadCount - 1 
        : state.unreadCount,
    };
  }),
  
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },
  
  incrementUnreadCount: () => set((state) => ({ 
    unreadCount: state.unreadCount + 1 
  })),
  
  decrementUnreadCount: () => set((state) => ({ 
    unreadCount: Math.max(0, state.unreadCount - 1) 
  })),
  
  setStats: (stats) => set({ stats }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  markAsRead: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id);
    if (notification && !notification.is_read) {
      return {
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ),
        unreadCount: state.unreadCount - 1,
      };
    }
    return state;
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({
      ...n,
      is_read: true,
      read_at: new Date().toISOString(),
    })),
    unreadCount: 0,
  })),
  
  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0,
    stats: null,
    error: null,
  }),
}));
