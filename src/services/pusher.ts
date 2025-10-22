import Pusher from 'pusher-js';

class PusherService {
  private pusher: Pusher | null = null;
  private channel: any = null;
  private adminId: number | null = null;

  constructor() {
    this.initializePusher();
  }

  private initializePusher() {
    this.pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    });
  }

  /**
   * Connect to admin notifications channel
   */
  connect(adminId: number) {
    if (!this.pusher) {
      console.error('❌ Pusher not initialized');
      return;
    }

    this.adminId = adminId;
    this.channel = this.pusher.subscribe(`admin-notifications.${adminId}`);
    
    console.log(`🔗 Connected to admin notifications channel for admin ${adminId}`);
    console.log(`📡 Pusher connection state: ${this.getConnectionState()}`);
  }

  /**
   * Listen for push notifications
   */
  onPushNotification(callback: (data: any) => void) {
    if (!this.channel) {
      console.error('Not connected to channel');
      return;
    }

    this.channel.bind('push-notification', (data: any) => {
      console.log('Received push notification:', data);
      
      // Show browser notification
      this.showBrowserNotification(data);
      
      // Call the callback
      callback(data);
    });
  }

  /**
   * Listen for bell count updates
   */
  onBellCountUpdate(callback: (count: number) => void) {
    if (!this.channel) {
      console.error('Not connected to channel');
      return;
    }

    this.channel.bind('bell-count-update', (data: any) => {
      console.log('Bell count updated:', data.count);
      callback(data.count);
    });
  }

  /**
   * Listen for new notifications
   */
  onNewNotification(callback: (notification: any) => void) {
    if (!this.channel) {
      console.error('Not connected to channel');
      return;
    }

    this.channel.bind('new-notification', (data: any) => {
      console.log('New notification received:', data);
      callback(data.notification);
    });
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(data: any) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.body,
        icon: '/jade.png',
        badge: '/jade.png',
        tag: data.type,
        data: data.data
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(data.title, {
            body: data.body,
            icon: '/jade.png',
            badge: '/jade.png',
            tag: data.type,
            data: data.data
          });
        }
      });
    }
  }

  /**
   * Request notification permission
   */
  requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.resolve('denied');
    }

    if (Notification.permission === 'granted') {
      return Promise.resolve('granted');
    }

    return Notification.requestPermission();
  }

  /**
   * Disconnect from channel
   */
  disconnect() {
    if (this.channel) {
      this.pusher?.unsubscribe(`admin-notifications.${this.adminId}`);
      this.channel = null;
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    return this.pusher?.connection?.state || 'disconnected';
  }
}

export const pusherService = new PusherService();
export default pusherService;
