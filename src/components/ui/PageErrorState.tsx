import React from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import {
  Refresh as RefreshIcon,
  Login as LoginIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export interface PageErrorStateProps {
  error: any;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onLogin?: () => void;
  showRetryButton?: boolean;
  showLoginButton?: boolean;
  variant?: 'default' | 'centered' | 'minimal';
  minHeight?: string | number;
}

const PageErrorState: React.FC<PageErrorStateProps> = ({
  error,
  title,
  message,
  onRetry,
  onLogin,
  showRetryButton = true,
  showLoginButton = true,
  variant = 'default',
  minHeight = '200px',
}) => {
  // Determine if it's an authentication error
  const isAuthError = (error as any)?.isAuthError || 
                     error.message?.includes('Authentication') ||
                     error.message?.includes('login') ||
                     error.message?.includes('401') ||
                     error.message?.includes('403');

  // Default title and message based on error type
  const defaultTitle = isAuthError ? 'Authentication Required' : 'Error Occurred';
  const defaultMessage = isAuthError 
    ? 'Your session has expired. Please log in again to continue.'
    : error.message || 'An unexpected error occurred while loading the data.';

  const finalTitle = title || defaultTitle;
  const finalMessage = message || defaultMessage;

  const renderContent = () => (
    <Box sx={{ textAlign: 'center' }}>
      <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
      
      <Typography variant="h6" color="error" gutterBottom>
        {finalTitle}
      </Typography>
      
      <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
        {finalMessage}
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {isAuthError && showLoginButton && onLogin && (
          <Button 
            variant="contained" 
            startIcon={<LoginIcon />}
            onClick={onLogin}
          >
            Go to Login
          </Button>
        )}
        
        {!isAuthError && showRetryButton && onRetry && (
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Box>
    </Box>
  );

  if (variant === 'minimal') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {finalMessage}
          {!isAuthError && showRetryButton && onRetry && (
            <Button 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          )}
        </Alert>
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

export default PageErrorState;
