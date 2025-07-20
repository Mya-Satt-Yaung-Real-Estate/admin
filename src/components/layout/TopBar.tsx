import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Code as CodeIcon
} from '@mui/icons-material';

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        backgroundColor: '#374151',
        color: '#ffffff',
        px: { xs: 2, sm: 3, md: 4 },
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #4B5563',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        marginLeft: 0,
        width: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={onToggleSidebar}
          sx={{
            color: '#10B981',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.1)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon sx={{ color: '#10B981', fontSize: '1.25rem' }} />
          <Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 700,
                fontSize: '0.875rem',
                lineHeight: 1
              }}
            >
              Team Admin Panel
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#9CA3AF',
                fontSize: '0.75rem'
              }}
            >
              Superuser
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Avatar 
        sx={{ 
          bgcolor: 'secondary.main',
          width: 32,
          height: 32,
          fontSize: '0.75rem',
          fontWeight: 600
        }}
      >
        SA
      </Avatar>
    </Box>
  );
};

export default TopBar; 