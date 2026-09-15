import React, { useState, useCallback } from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  LocationOn as LocationOnIcon,
  Campaign as CampaignIcon,
  RequestQuote as RequestQuoteIcon,
  HomeWork as HomeWorkIcon,
  EventNote as EventNoteIcon,
  EventAvailable as EventAvailableIcon,
  DynamicFeed as DynamicFeedIcon,
  Category as CategoryIcon,
  Newspaper as NewspaperIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  List as ListIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Security as SecurityIcon,
  Key as KeyIcon,
  Feedback as FeedbackIcon,
  LiveHelp as LiveHelpIcon,
  AccountBalance as AccountBalanceIcon,
  AccessTime as AccessTimeIcon,
  PersonAdd as PersonAddIcon,
  ShoppingCart as ShoppingCartIcon,
  FolderSpecial as WantingListIcon,
  Handshake as ShareProfitIcon,
  Speed as SpeedIcon,
  AttachMoney as AttachMoneyIcon,
  Percent as PercentIcon,
  YouTube as YouTubeIcon,
  PhotoLibrary as ActivitiesIcon,
} from '@mui/icons-material';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import { MenuItem } from '@/types';
import {
  hasDeveloperAccess,
  isMarketerOnlyAccess,
  MARKETER_ALLOWED_MENU_ITEMS,
} from '@/constants/accessControl';

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

export const getIconComponent = (iconName: string): React.ReactNode => {
  switch (iconName) {
    // Main navigation icons
    case 'Dashboard':
      return <DashboardIcon />;
    case 'RequestQuote':
      return <RequestQuoteIcon />;
    case 'People':
      return <PeopleIcon />;
    case 'Feedback':
      return <FeedbackIcon />;
    case 'HomeWork':
      return <HomeWorkIcon />;
    case 'Campaign':
      return <CampaignIcon />;
    
    // Event icons
    case 'EventNote':
      return <EventNoteIcon />;
    case 'EventAvailable':
      return <EventAvailableIcon />;
    
    // CMS icons
    case 'DynamicFeed':
      return <DynamicFeedIcon />;
    case 'Category':
      return <CategoryIcon />;
    case 'Newspaper':
      return <NewspaperIcon />;
    case 'School':
      return <SchoolIcon />;
    
    // Master data icons
    case 'Assessment':
      return <AssessmentIcon />;
    case 'LocationOn':
      return <LocationOnIcon />;
    case 'Home':
      return <HomeIcon />;
    case 'List':
      return <ListIcon />;
    case 'Star':
      return <StarIcon />;
    case 'Business':
      return <BusinessIcon />;
    
    // Settings and admin icons
    case 'Settings':
      return <SettingsIcon />;
    case 'AdminPanelSettings':
      return <AdminPanelSettingsIcon />;
    case 'Security':
      return <SecurityIcon />;
    case 'Key':
      return <KeyIcon />;
    
    // Additional icons
    case 'AccessTime':
      return <AccessTimeIcon />;
    case 'PersonAdd':
      return <PersonAddIcon />;
    case 'ShoppingCart':
      return <ShoppingCartIcon />;
    
    // Legacy icons (for backward compatibility)
    case 'Event':
      return <EventNoteIcon />;
    case 'Article':
      return <NewspaperIcon />;
    case 'QuestionMarkIcon':
      return <LiveHelpIcon />;
    case 'AccountBalance':
      return <AccountBalanceIcon />;
    case 'WantingList':
      return <WantingListIcon />;
    case 'ShareProfit':
      return <ShareProfitIcon />;
    case 'Activities':
      return <ActivitiesIcon />;
    case 'Speed':
      return <SpeedIcon />;
    case 'AttachMoney':
      return <AttachMoneyIcon />;
    case 'Percent':
      return <PercentIcon />;
    case 'YouTube':
      return <YouTubeIcon />;
    
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
  
  // Track which dropdown is currently open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Handle navigation and dropdown management
  const handleNavigate = useCallback((path: string) => {
    // Close any open dropdown when navigating to a non-dropdown item
    setOpenDropdown(null);
    onNavigate(path);
  }, [onNavigate]);

  /**
   * ''  = user closed this (or any) dropdown — do not auto-reopen
   * null = after navigate — auto-open parent of active child
   * name = that parent is explicitly open
   */
  const handleDropdownToggle = useCallback((dropdownText: string) => {
    setOpenDropdown(dropdownText === '' ? '' : dropdownText);
  }, []);

  // Developer / marketer access control
  const { user } = useAuthStore();
  const marketerOnlyAccess = isMarketerOnlyAccess(user?.email);

  // Filter menu items based on access control
  const allMenuItems = menuItems.filter((item) => {
    if (marketerOnlyAccess) {
      if (item.isDivider) {
        return false;
      }

      return MARKETER_ALLOWED_MENU_ITEMS.includes(item.text);
    }

    if (item.requiresDeveloperAccess) {
      return hasDeveloperAccess(user?.email);
    }

    return true;
  });

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
          {allMenuItems.map((item, index) => {
            // Handle divider items
            if (item.isDivider) {
              return (
                <Divider 
                  key={`divider-${index}`}
                  sx={{ 
                    my: 1, 
                    borderColor: 'divider',
                    borderWidth: 1,
                    opacity: 0.8,
                  }} 
                />
              );
            }
            
            // Handle regular menu items
            return (
              <SidebarItem
                key={item.text}
                text={item.text}
                icon={getIconComponent(item.iconName)}
                path={item.path}
                isSelected={currentPath === item.path}
                isCollapsed={isCollapsed}
                onClick={handleNavigate}
                childrenItems={item.children}
                currentPath={currentPath}
                openDropdown={openDropdown}
                onDropdownToggle={handleDropdownToggle}
              />
            );
          })}
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