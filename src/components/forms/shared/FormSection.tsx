import React from 'react';
import { Card, CardContent, Typography, Divider, Box } from '@mui/material';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  sx?: any;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  subtitle, 
  children, 
  sx = {} 
}) => {
  return (
    <Card sx={{ mb: 2, ...sx }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
};
