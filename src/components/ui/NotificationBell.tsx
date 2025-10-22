import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  HomeWork as PropertyIcon,
  Feedback as FeedbackIcon,
  Warning as WarningIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  adminId: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ adminId }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
  } = useNotifications(adminId);

  // Debug logging
  console.log('🔔 NotificationBell - adminId:', adminId);
  console.log('🔔 NotificationBell - unreadCount:', unreadCount);
  console.log('🔔 NotificationBell - notifications:', notifications.length);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <PropertyIcon color="primary" />;
      case 'feedback':
        return <FeedbackIcon color="secondary" />;
      case 'system_alert':
        return <WarningIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'primary';
      case 'feedback':
        return 'secondary';
      case 'system_alert':
        return 'warning';
      default:
        return 'default';
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
        sx={{ position: 'relative' }}
      >
        <NotificationsIcon />
        {unreadCount > 0 && (
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          />
        )}
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            <Box>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<MarkEmailReadIcon />}
                  onClick={markAllAsRead}
                  sx={{ mr: 1 }}
                >
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={deleteAllNotifications}
                >
                  Delete All
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {isLoading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={60} />
                </Box>
              ))}
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.slice(0, 10).map((notification) => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type.replace('_', ' ')}
                          size="small"
                          color={getNotificationColor(notification.type) as any}
                          variant="outlined"
                        />
                        {!notification.is_read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {notification.body}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};
