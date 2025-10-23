import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/api/notifications';
import { useNotificationStore } from '../stores/notificationStore';
import { pusherService } from '../services/pusher';
import { AdminNotification } from '../services/api/notifications';

export const useNotifications = (adminId?: number) => {
  const queryClient = useQueryClient();
  const {
    notifications,
    unreadCount,
    stats,
    isLoading,
    error,
    setNotifications,
    addNotification,
    removeNotification,
    setUnreadCount,
    incrementUnreadCount,
    setStats,
    setLoading,
    setError,
    markAsRead: markAsReadStore,
    markAllAsRead: markAllAsReadStore,
    clearNotifications,
  } = useNotificationStore();

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => {
      return notificationApi.getNotifications();
    },
    enabled: !!adminId,
    retry: false,
  });

  // Fetch stats
  const {
    data: statsData,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['admin-notifications-stats'],
    queryFn: () => notificationApi.getStats(),
    enabled: !!adminId,
    retry: false,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: (_, id) => {
      markAsReadStore(id);
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-stats'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      markAllAsReadStore();
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-stats'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationApi.deleteNotification(id),
    onSuccess: (_, id) => {
      removeNotification(id);
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-stats'] });
    },
  });

  // Delete all notifications mutation
  const deleteAllNotificationsMutation = useMutation({
    mutationFn: () => notificationApi.deleteAllNotifications(),
    onSuccess: () => {
      clearNotifications();
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-stats'] });
    },
  });

      // Update store when data changes
      useEffect(() => {
        if (notificationsData && 'data' in notificationsData) {
          setNotifications(notificationsData.data || []);
          setUnreadCount(notificationsData.meta?.unread_count || 0);
        } else if (notificationsError) {
          // Set empty data on error
          setNotifications([]);
          setUnreadCount(0);
        }
      }, [notificationsData, notificationsError, setNotifications, setUnreadCount]);

  useEffect(() => {
    if (statsData && 'total' in statsData) {
      setStats(statsData);
    }
  }, [statsData, setStats]);

  useEffect(() => {
    setLoading(isLoadingNotifications || isLoadingStats);
  }, [isLoadingNotifications, isLoadingStats, setLoading]);

  useEffect(() => {
    setError(notificationsError?.message || null);
  }, [notificationsError, setError]);

  // Setup Pusher connection
  useEffect(() => {
    if (!adminId) return;

    // Connect to Pusher
    pusherService.connect(adminId);

    // Listen for push notifications
    pusherService.onPushNotification(() => {
    });

    // Listen for bell count updates
    pusherService.onBellCountUpdate((count) => {
      setUnreadCount(count);
    });

    // Listen for new notifications
    pusherService.onNewNotification((notification: AdminNotification) => {
      addNotification(notification);
      // Don't increment count here - the bell-count-update event will handle it
    });

    // Request notification permission
    pusherService.requestNotificationPermission();

    return () => {
      pusherService.disconnect();
    };
  }, [adminId, addNotification, incrementUnreadCount, setUnreadCount]);

  // Actions
  const markAsRead = useCallback((id: number) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback((id: number) => {
    deleteNotificationMutation.mutate(id);
  }, [deleteNotificationMutation]);

  const deleteAllNotifications = useCallback(() => {
    deleteAllNotificationsMutation.mutate();
  }, [deleteAllNotificationsMutation]);

  return {
    // Data
    notifications,
    unreadCount,
    stats,
    isLoading,
    error,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetchNotifications,
    
    // Mutations
    markAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
    deleteAllNotificationsMutation,
  };
};
