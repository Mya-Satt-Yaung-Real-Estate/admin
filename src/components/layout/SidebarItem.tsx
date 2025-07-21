import React, { useState } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { SidebarItemProps, MenuItem } from '@/types';

interface SidebarItemDropdownProps extends SidebarItemProps {
  childrenItems?: MenuItem[];
  currentPath: string;
  isCollapsed: boolean;
  onClick: (path: string) => void;
}

const SidebarItemDropdown: React.FC<SidebarItemDropdownProps> = ({
  text,
  icon,
  isSelected,
  isCollapsed,
  childrenItems = [],
  currentPath,
  onClick,
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };
  // Collapse dropdown on mobile when a child is clicked
  const handleChildClick = (path: string) => {
    if (isMobile) setOpen(false);
    onClick(path);
  };

  return (
    <>
      <ListItem disablePadding sx={{ position: 'relative' }}>
        <ListItemButton
          selected={isSelected || open}
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={`dropdown-list-${text}`}
          sx={{
            minHeight: 52,
            px: isCollapsed ? 1 : 2,
            borderRadius: '0 8px 8px 0',
            marginRight: 1,
            marginLeft: 0,
            transition: 'all 0.2s ease-in-out',
            backgroundColor: open ? 'rgba(59, 136, 128, 0.08)' : 'transparent',
            color: open ? 'primary.main' : 'text.secondary',
            fontWeight: open ? 600 : 400,
            '&:hover': {
              backgroundColor: 'rgba(59, 136, 128, 0.04)',
              color: 'primary.main',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(59, 136, 128, 0.08)',
              color: 'primary.main',
              fontWeight: 600,
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
              '& .MuiListItemText-primary': {
                color: 'primary.main',
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isCollapsed ? 32 : 40,
              color: open ? 'primary.main' : 'inherit',
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
                  fontWeight: open ? 600 : 400,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            />
          )}
          {!isCollapsed && (
            <IconButton
              size="small"
              onClick={handleToggle}
              edge="end"
              aria-label={open ? `Collapse ${text}` : `Expand ${text}`}
              sx={{ ml: 1, color: 'inherit' }}
              tabIndex={0}
            >
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </ListItemButton>
      </ListItem>
      <Collapse in={open && !isCollapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding id={`dropdown-list-${text}`}>
          {childrenItems.map((child) => (
            <SidebarItem
              key={child.text}
              text={child.text}
              icon={icon}
              path={child.path!}
              isSelected={currentPath === child.path}
              isCollapsed={isCollapsed}
              onClick={handleChildClick}
              sx={{
                pl: isCollapsed ? 2 : 5,
                py: 1.2,
                borderLeft: currentPath === child.path ? '3px solid #3B8880' : '3px solid transparent',
                backgroundColor: currentPath === child.path ? 'rgba(59, 136, 128, 0.10)' : 'transparent',
                fontWeight: currentPath === child.path ? 600 : 400,
                color: currentPath === child.path ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(59, 136, 128, 0.08)',
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const SidebarItem: React.FC<SidebarItemProps & {
  childrenItems?: MenuItem[];
  currentPath?: string;
}> = ({
  text,
  icon,
  path,
  isSelected,
  isCollapsed,
  onClick,
  childrenItems,
  currentPath,
  sx,
}) => {
  if (childrenItems && childrenItems.length > 0 && currentPath !== undefined) {
    return (
      <SidebarItemDropdown
        text={text}
        icon={icon}
        isSelected={isSelected}
        isCollapsed={isCollapsed}
        childrenItems={childrenItems}
        currentPath={currentPath}
        onClick={onClick}
        path={path || ''}
      />
    );
  }
  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={isSelected}
        onClick={() => path && onClick(path)}
        sx={{
          minHeight: 48,
          px: isCollapsed ? 1 : 2,
          position: 'relative',
          borderRadius: '0 8px 8px 0',
          marginRight: 1,
          marginLeft: 0,
          transition: 'all 0.2s ease-in-out',
          backgroundColor: 'transparent',
          color: 'text.secondary',
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 136, 128, 0.08)',
            color: 'primary.main',
            fontWeight: 600,
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
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
              color: 'primary.main',
            },
            '&:hover': {
              backgroundColor: 'rgba(59, 136, 128, 0.12)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(59, 136, 128, 0.04)',
            color: 'primary.main',
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
          },
          ...sx,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: isCollapsed ? 0 : 40,
            color: 'inherit',
            transition: 'all 0.2s ease-in-out',
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