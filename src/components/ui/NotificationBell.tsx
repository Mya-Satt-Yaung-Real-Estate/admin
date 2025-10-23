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
                    bgcolor: notification.is_read ? '#fafafa' : '#ffffff',
                    border: notification.is_read ? '1px solid #e0e0e0' : '1px solid #e3f2fd',
                    borderRadius: 2,
                    mb: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    boxShadow: notification.is_read 
                      ? '0 1px 3px rgba(0,0,0,0.1)' 
                      : '0 2px 8px rgba(25, 118, 210, 0.12)',
                    '&:hover': {
                      bgcolor: notification.is_read ? '#f5f5f5' : '#f8f9ff',
                      transform: 'translateY(-1px)',
                      boxShadow: notification.is_read 
                        ? '0 2px 6px rgba(0,0,0,0.15)' 
                        : '0 4px 12px rgba(25, 118, 210, 0.2)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    // Unread indicator
                    ...(notification.is_read ? {} : {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        bgcolor: 'linear-gradient(180deg, #1976d2 0%, #42a5f5 100%)',
                        borderRadius: '0 2px 2px 0',
                      }
                    }),
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', p: 1 }}>
                    <ListItemIcon sx={{ 
                      minWidth: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: notification.is_read ? '#f0f0f0' : '#e3f2fd',
                      mr: 1,
                    }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{
                                fontWeight: notification.is_read ? 500 : 700,
                                color: notification.is_read ? '#666' : '#1a1a1a',
                                fontSize: '0.9rem',
                                lineHeight: 1.3,
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.is_read && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: '#1976d2',
                                  animation: 'pulse 2s infinite',
                                  '@keyframes pulse': {
                                    '0%': { opacity: 1, transform: 'scale(1)' },
                                    '50%': { opacity: 0.6, transform: 'scale(1.1)' },
                                    '100%': { opacity: 1, transform: 'scale(1)' },
                                  },
                                }}
                              />
                            )}
                          </Box>
                          <Chip
                            label={notification.type.replace('_', ' ')}
                            size="small"
                            color={getNotificationColor(notification.type) as any}
                            variant={notification.is_read ? 'outlined' : 'filled'}
                            sx={{
                              fontSize: '0.65rem',
                              height: 22,
                              fontWeight: 500,
                              opacity: notification.is_read ? 0.8 : 1,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: notification.is_read ? '#999' : '#555',
                              fontWeight: notification.is_read ? 400 : 500,
                              fontSize: '0.8rem',
                              lineHeight: 1.5,
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notification.body}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography 
                              variant="caption" 
                              sx={{
                                color: notification.is_read ? '#bbb' : '#888',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                              }}
                            >
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </Typography>
                            {!notification.is_read && (
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: '#1976d2',
                                  opacity: 0.8,
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                  
                  {/* View Button */}
                  {notification.data.view_button && (
                    <Box sx={{ width: '100%', mt: 1, pl: 6, pr: 1 }}>
                      <Button
                        size="small"
                        variant={notification.is_read ? "outlined" : "contained"}
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Mark notification as read when view button is clicked
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                          // Navigate to the detail page
                          window.location.href = notification.data.view_button.url;
                        }}
                        sx={{ 
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 2,
                          minWidth: 'auto',
                          height: 32,
                          borderRadius: 2,
                          fontWeight: 600,
                          boxShadow: notification.is_read 
                            ? 'none' 
                            : '0 2px 4px rgba(25, 118, 210, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: notification.is_read 
                              ? '0 2px 4px rgba(0,0,0,0.1)' 
                              : '0 4px 8px rgba(25, 118, 210, 0.4)',
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {notification.data.view_button.text}
                      </Button>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};
