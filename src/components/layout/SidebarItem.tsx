import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import { SidebarItemProps } from '@/types';

const SidebarItem: React.FC<SidebarItemProps> = ({
  text,
  icon,
  path,
  isSelected,
  isCollapsed,
  onClick,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={isSelected}
        onClick={() => onClick(path)}
        sx={{
          minHeight: 48,
          px: isCollapsed ? 1 : 2,
          position: 'relative',
          borderRadius: '0 8px 8px 0',
          marginRight: 1,
          marginLeft: 0,
          transition: 'all 0.2s ease-in-out',
          
          // Default state
          backgroundColor: 'transparent',
          color: 'text.secondary',
          
          // Active state with enhanced visual indicators
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 136, 128, 0.08)', // Light brand background
            color: 'primary.main', // Brand color text
            fontWeight: 600,
            
            // Left border indicator
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: 'primary.main',
              borderRadius: '0 2px 2px 0',
            },
            
            // Icon styling for active state
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
            
            // Text styling for active state
            '& .MuiListItemText-primary': {
              fontWeight: 600,
              color: 'primary.main',
            },
            
            // Hover state for active item
            '&:hover': {
              backgroundColor: 'rgba(59, 136, 128, 0.12)',
              transform: 'translateX(2px)',
            },
          },
          
          // Hover state for inactive items
          '&:hover': {
            backgroundColor: 'rgba(59, 136, 128, 0.04)',
            color: 'primary.main',
            transform: 'translateX(2px)',
            
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
            
            '& .MuiListItemText-primary': {
              color: 'primary.main',
            },
          },
          
          // Focus state
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '-2px',
          },
        }}
      >
        <ListItemIcon 
          sx={{ 
            minWidth: isCollapsed ? 32 : 40,
            justifyContent: 'center',
            color: isSelected ? 'primary.main' : 'text.secondary',
            transition: 'color 0.2s ease-in-out',
          }}
        >
          {icon}
        </ListItemIcon>
        {!isCollapsed && (
          <ListItemText 
            primary={text} 
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: isSelected ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default SidebarItem; 