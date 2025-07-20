import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  breadcrumbs?: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  breadcrumbs, 
  subtitle 
}) => {
  const breadcrumbItems = breadcrumbs?.split(' / ') || [];

  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          {breadcrumbItems.map((item, index) => (
            <Link
              key={index}
              color={index === breadcrumbItems.length - 1 ? 'text.primary' : 'inherit'}
              href="#"
              underline="hover"
              sx={{ 
                fontWeight: index === breadcrumbItems.length - 1 ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {item}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader; 