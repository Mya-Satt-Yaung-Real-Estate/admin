import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';

export interface PageEmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionButton?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  secondaryActionButton?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  variant?: 'default' | 'centered' | 'minimal';
  minHeight?: string | number;
  showIcon?: boolean;
}

const PageEmptyState: React.FC<PageEmptyStateProps> = ({
  title = 'No Data Found',
  message = 'There are no items matching your current criteria.',
  icon,
  actionButton,
  secondaryActionButton,
  variant = 'default',
  minHeight = '200px',
  showIcon = true,
}) => {
  const defaultIcon = <SearchIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  const displayIcon = icon || defaultIcon;

  const renderContent = () => (
    <Box sx={{ textAlign: 'center' }}>
      {showIcon && (
        <Box sx={{ mb: 2 }}>
          {displayIcon}
        </Box>
      )}
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {actionButton && (
          <Button 
            variant={actionButton.variant || 'contained'}
            color={actionButton.color || 'primary'}
            startIcon={actionButton.icon}
            onClick={actionButton.onClick}
          >
            {actionButton.text}
          </Button>
        )}
        
        {secondaryActionButton && (
          <Button 
            variant={secondaryActionButton.variant || 'outlined'}
            color={secondaryActionButton.color || 'primary'}
            startIcon={secondaryActionButton.icon}
            onClick={secondaryActionButton.onClick}
          >
            {secondaryActionButton.text}
          </Button>
        )}
      </Box>
    </Box>
  );

  if (variant === 'minimal') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          {showIcon && <Box sx={{ mb: 1 }}>{displayIcon}</Box>}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {actionButton && (
            <Button 
              size="small"
              variant={actionButton.variant || 'text'}
              startIcon={actionButton.icon}
              onClick={actionButton.onClick}
            >
              {actionButton.text}
            </Button>
          )}
        </Box>
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

export default PageEmptyState;
