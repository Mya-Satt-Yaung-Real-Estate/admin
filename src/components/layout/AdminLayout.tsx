import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '../../hooks/useLayout';
import { MENU_ITEMS } from '../../constants/menuItems';
import { DRAWER_WIDTH } from '@/types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { AdminLayoutProps } from '@/types';

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useLayout();

  // Default sidebar to open on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const isSidebarVisible = isMobile ? sidebarOpen : !sidebarCollapsed;
  const currentDrawerWidth = isMobile ? DRAWER_WIDTH : (sidebarCollapsed ? 64 : DRAWER_WIDTH);

  return (
    <Box sx={{ display: 'flex', marginLeft: 0, width: '100%' }}>
      <TopBar
        menuItems={MENU_ITEMS}
        currentPath={location.pathname}
        drawerWidth={DRAWER_WIDTH}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        onToggleSidebar={handleToggleSidebar}
      />

      <Sidebar
        menuItems={MENU_ITEMS}
        currentPath={location.pathname}
        isOpen={isSidebarVisible}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        drawerWidth={DRAWER_WIDTH}
        onClose={closeSidebar}
        onNavigate={handleNavigation}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          marginLeft: 0,
          marginTop: '64px', // AppBar height
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 