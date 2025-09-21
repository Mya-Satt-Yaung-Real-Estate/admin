import React from 'react';
import { Box, Typography } from '@mui/material';
import PageHeader from '../../components/layout/PageHeader';

const BookingCreatePage: React.FC = () => {
  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Booking"
        breadcrumbs="Dashboard / Booking Management / Create Booking"
        subtitle="Create a new booking"
      />
      
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Create Booking Page - Coming Soon
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          This page will allow creating new bookings.
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingCreatePage;
