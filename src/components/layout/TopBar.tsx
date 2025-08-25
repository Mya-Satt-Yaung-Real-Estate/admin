import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import { 
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { MenuItem as MenuItemType } from '@/types/layout';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogout } from '@/services/queries/auth';
import { useNavigate } from 'react-router-dom';
import LogoutDialog from '@/components/ui/LogoutDialog';
import { getUserInitials } from '@/utils';

interface TopBarProps {
  menuItems: MenuItemType[];
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
  const navigate = useNavigate();
  const { user, logout: logoutStore } = useAuthStore();
  const logoutMutation = useLogout();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  
  const currentDrawerWidth = isMobile ? drawerWidth : (isCollapsed ? 64 : drawerWidth);
  
  // Find the current page title, handling both direct paths and nested paths
  const findCurrentPageTitle = (items: MenuItemType[]): string => {
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

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Call the logout API
      await logoutMutation.mutateAsync();
      
      // Clear local auth state
      logoutStore();
      
      // Close the dialog
      setLogoutDialogOpen(false);
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      logoutStore();
      setLogoutDialogOpen(false);
      navigate('/login');
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleSettings = () => {
    handleProfileMenuClose();
    navigate('/settings');
  };

  return (
    <>
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
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box>

          {/* User Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              {user?.name ? (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {getUserInitials(user.name)}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Box>

          {/* User Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User Info */}
            <MenuItem disabled>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={user?.name || 'User'} 
                secondary={user?.email || 'user@example.com'}
              />
            </MenuItem>
            
            <Divider />
            
            {/* Settings */}
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            
            {/* Logout */}
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={logoutMutation.isPending}
      />
    </>
  );
};

export default TopBar; 