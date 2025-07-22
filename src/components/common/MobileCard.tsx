import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

export interface MobileCardAction {
  icon: React.ReactNode;
  tooltip: string;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick: () => void;
}

export interface MobileCardProps {
  // Basic info
  title: string;
  subtitle?: string;
  description?: string;
  
  // Avatar/Icon
  avatar?: React.ReactNode;
  avatarText?: string;
  avatarColor?: string;
  
  // Status
  status?: {
    label: string;
    color: 'success' | 'error' | 'warning' | 'info' | 'default';
  };
  
  // Additional chips
  chips?: Array<{
    label: string;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'default';
    variant?: 'filled' | 'outlined';
  }>;
  
  // Actions
  actions?: MobileCardAction[];
  
  // Interaction
  onClick?: () => void;
  clickable?: boolean;
  
  // Styling
  sx?: SxProps<Theme>;
  
  // Children for custom content
  children?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  description,
  avatar,
  avatarText,
  avatarColor = 'primary.main',
  status,
  chips = [],
  actions = [],
  onClick,
  clickable = false,
  sx = {},
  children,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: MobileCardAction) => {
    e.stopPropagation();
    action.onClick();
  };

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable ? {
          backgroundColor: 'action.hover',
          transition: 'background-color 0.2s'
        } : {},
        ...sx,
      }}
      onClick={handleClick}
    >
      {/* Avatar Section */}
      {(avatar || avatarText) && (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            status ? (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: status.color === 'success' ? '#4caf50' : 
                                 status.color === 'error' ? '#f44336' : 
                                 status.color === 'warning' ? '#ff9800' : '#757575'
                }}
              />
            ) : undefined
          }
        >
          <Avatar
            sx={{
              bgcolor: avatarColor,
              width: 48,
              height: 48,
            }}
          >
            {avatar || (
              <Typography variant="body2" fontSize="1rem">
                {avatarText}
              </Typography>
            )}
          </Avatar>
        </Badge>
      )}

      {/* Content Section */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}

        {/* Status and Chips */}
        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {status && (
            <Chip
              label={status.label}
              size="small"
              color={status.color}
              variant="outlined"
            />
          )}
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip.label}
              size="small"
              color={chip.color || 'default'}
              variant={chip.variant || 'outlined'}
            />
          ))}
        </Box>

        {/* Description */}
        {description && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            {description}
          </Typography>
        )}

        {/* Custom Children Content */}
        {children}
      </Box>

      {/* Actions Section */}
      {actions.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {actions.map((action, index) => (
            <Tooltip key={index} title={action.tooltip}>
              <IconButton
                size="small"
                onClick={(e) => handleActionClick(e, action)}
                color={action.color || 'default'}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default MobileCard; 