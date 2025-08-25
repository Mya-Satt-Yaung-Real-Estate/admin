import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import LoadingSpinner from './LoadingSpinner';

export interface PageLoadingStateProps {
  title?: string;
  message?: string;
  showSpinner?: boolean;
  minHeight?: string | number;
  variant?: 'default' | 'centered' | 'minimal';
}

const PageLoadingState: React.FC<PageLoadingStateProps> = ({
  title = 'Loading...',
  message = 'Please wait while we fetch the data.',
  showSpinner = true,
  minHeight = '200px',
  variant = 'default',
}) => {
  const renderContent = () => (
    <Box sx={{ textAlign: 'center' }}>
      {showSpinner && <LoadingSpinner size={40} />}
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ mt: showSpinner ? 2 : 0, mb: 1 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  if (variant === 'minimal') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        {showSpinner && <LoadingSpinner size={40} />}
      </Box>
    );
  }

  if (variant === 'centered') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight,
          py: 4 
        }}
      >
        {renderContent()}
      </Box>
    );
  }

  // default variant
  return (
    <Paper sx={{ p: 3, textAlign: 'center', minHeight }}>
      {renderContent()}
    </Paper>
  );
};

export default PageLoadingState;
