import React from 'react';
import { Box, Typography } from '@mui/material';
import { LogoProps } from '@/types';

const Logo: React.FC<LogoProps> = ({ 
  collapsed = false, 
  size = 'medium',
  showText = true 
}) => {
  const getLogoSize = () => {
    switch (size) {
      case 'small':
        return collapsed ? 24 : 28;
      case 'large':
        return collapsed ? 40 : 48;
      default:
        return collapsed ? 32 : 40;
    }
  };

  const logoSize = getLogoSize();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="img"
        src="/project_logo.png"
        alt="Project Logo"
        sx={{
          width: logoSize,
          height: logoSize,
          objectFit: 'contain',
          borderRadius: '4px'
        }}
      />
      {showText && !collapsed && (
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            color: 'primary.main', // Now uses brand color
            fontSize: size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.25rem'
          }}
        >
          Admin
        </Typography>
      )}
    </Box>
  );
};

export default Logo; 