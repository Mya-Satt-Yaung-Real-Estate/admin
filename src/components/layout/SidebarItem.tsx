import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
          '&:hover': {
            backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
          },
        }}
      >
        <ListItemIcon 
          sx={{ 
            minWidth: isCollapsed ? 32 : 40,
            justifyContent: 'center',
            color: isSelected ? 'white' : 'inherit',
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
              },
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default SidebarItem; 