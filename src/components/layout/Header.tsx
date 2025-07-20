import React from 'react';
import {
  Box,
  Typography,
  Avatar
} from '@mui/material';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  return (
    <Box 
      sx={{ 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        px: { xs: 2, sm: 3, md: 4 },
        py: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 0,
        width: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#1E293B',
            fontSize: '1.5rem',
            fontWeight: 700
          }}
        >
          Admin Panel
        </Typography>
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

export default Header; 