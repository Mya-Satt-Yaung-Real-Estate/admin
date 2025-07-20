import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { LoadingSpinnerProps } from '@/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  color = 'primary' 
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default LoadingSpinner; 