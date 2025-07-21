import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { MenuItem } from '@/types/layout';

interface TopBarProps {
  menuItems: MenuItem[];
  currentPath: string;
  drawerWidth: number;
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  menuItems,
  currentPath,
  drawerWidth,
  isCollapsed,
  isMobile,
  onToggleSidebar,
}) => {
  const theme = useTheme();
  const currentDrawerWidth = isMobile ? drawerWidth : (isCollapsed ? 64 : drawerWidth);
  
  // Find the current page title, handling both direct paths and nested paths
  const findCurrentPageTitle = (items: MenuItem[]): string => {
    for (const item of items) {
      if (item.path === currentPath) {
        return item.text;
      }
      if (item.children) {
        const childTitle = findCurrentPageTitle(item.children);
        if (childTitle) {
          return childTitle;
        }
      }
    }
    return 'Dashboard';
  };

  const currentPageTitle = findCurrentPageTitle(menuItems);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { md: `${currentDrawerWidth}px` },
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          noWrap 
          component="div"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {currentPageTitle}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 