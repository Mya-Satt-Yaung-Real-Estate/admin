import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { PageHeaderProps } from '@/types';

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  breadcrumbs, 
  subtitle,
  actionButton
}) => {
  const breadcrumbItems = breadcrumbs?.split(' / ') || [];

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          {breadcrumbs && (
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ mb: 2 }}
            >
              {breadcrumbItems.map((item, index) => (
                <Link
                  key={index}
                  color={index === breadcrumbItems.length - 1 ? 'primary.main' : 'inherit'}
                  href="#"
                  underline="hover"
                  sx={{ 
                    fontWeight: index === breadcrumbItems.length - 1 ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.dark',
                    }
                  }}
                >
                  {item}
                </Link>
              ))}
            </Breadcrumbs>
          )}
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              color: 'primary.main', // Brand color for main title
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actionButton && (
          <Button
            variant="contained"
            startIcon={actionButton.icon}
            onClick={actionButton.onClick}
            sx={{
              ml: 2,
              minWidth: 'auto',
            }}
          >
            {actionButton.text}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader; 