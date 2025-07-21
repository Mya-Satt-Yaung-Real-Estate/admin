// Layout Component Types
export interface AdminLayoutProps {
  children: React.ReactNode;
}

export interface LogoProps {
  collapsed?: boolean;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: string;
  subtitle?: string;
  actionButton?: {
    text: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
}

export interface SidebarItemProps {
  text: string;
  icon: React.ReactNode;
  path: string;
  isSelected: boolean;
  isCollapsed: boolean;
  onClick: (path: string) => void;
}

export interface SidebarProps {
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

export interface TopBarProps {
  menuItems: MenuItem[];
  currentPath: string;
  drawerWidth: number;
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

// Menu Types
export interface MenuItem {
  text: string;
  iconName: string;
  path: string;
}

// Layout Constants
export const DRAWER_WIDTH = 240; 