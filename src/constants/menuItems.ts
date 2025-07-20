import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { MenuItem, DRAWER_WIDTH } from '@/types';

export const MENU_ITEMS: MenuItem[] = [
  { 
    text: 'Dashboard', 
    iconName: 'Dashboard', 
    path: '/dashboard' 
  },
  { 
    text: 'User Management', 
    iconName: 'People', 
    path: '/users' 
  },
  { 
    text: 'Analytics', 
    iconName: 'Assessment', 
    path: '/analytics' 
  },
  { 
    text: 'Settings', 
    iconName: 'Settings', 
    path: '/settings' 
  },
];

export { DRAWER_WIDTH }; 