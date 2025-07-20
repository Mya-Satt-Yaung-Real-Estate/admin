import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

export const useLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Default sidebar to open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  return {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    isMobile,
    isTablet,
    isDesktop,
  };
}; 