import React from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import { MenuItem } from '@/types';

interface SidebarProps {
  menuItems: MenuItem[];
  currentPath: string;
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  drawerWidth: number;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onToggleCollapse: () => void;
}

const getIconComponent = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'Dashboard':
      return <DashboardIcon />;
    case 'People':
      return <PeopleIcon />;
    case 'Assessment':
      return <AssessmentIcon />;
    case 'Settings':
      return <SettingsIcon />;
    case 'LocationOn':
      return <LocationOnIcon />;
    default:
      return <DashboardIcon />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  currentPath,
  isOpen,
  isCollapsed,
  isMobile,
  drawerWidth,
  onClose,
  onNavigate,
  onToggleCollapse,
}) => {
  const theme = useTheme();
  const currentDrawerWidth = isMobile ? drawerWidth : (isCollapsed ? 64 : drawerWidth);

  // Find the index of the Analytics item
  const analyticsIdx = menuItems.findIndex(item => item.text === 'Analytics');
  // Everything before and including Analytics
  const mainMenu = menuItems.slice(0, analyticsIdx + 1);
  // Everything after Analytics (Settings and Admin Management)
  const secondaryMenu = menuItems.slice(analyticsIdx + 1);

  const sidebarContent = (
    <Box sx={{ 
      marginLeft: 0, 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: isCollapsed ? 1 : 2,
        minHeight: 64,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Logo collapsed={isCollapsed} />
        {!isMobile && (
          <IconButton
            onClick={onToggleCollapse}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                color: 'primary.main',
                backgroundColor: 'rgba(59, 136, 128, 0.04)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        py: 1,
        px: 1,
      }}>
        <List sx={{ p: 0 }}>
          {mainMenu.map((item) => (
            <SidebarItem
              key={item.text}
              text={item.text}
              icon={getIconComponent(item.iconName)}
              path={item.path}
              isSelected={currentPath === item.path}
              isCollapsed={isCollapsed}
              onClick={onNavigate}
              childrenItems={item.children}
              currentPath={currentPath}
            />
          ))}
        </List>
        {secondaryMenu.length > 0 && (
          <Divider sx={{ my: 1, borderColor: 'divider' }} />
        )}
        <List sx={{ p: 0 }}>
          {secondaryMenu.map((item) => (
            <SidebarItem
              key={item.text}
              text={item.text}
              icon={getIconComponent(item.iconName)}
              path={item.path}
              isSelected={currentPath === item.path}
              isCollapsed={isCollapsed}
              onClick={onNavigate}
              childrenItems={item.children}
              currentPath={currentPath}
            />
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: currentDrawerWidth }, 
        flexShrink: { md: 0 },
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: currentDrawerWidth,
            marginLeft: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 