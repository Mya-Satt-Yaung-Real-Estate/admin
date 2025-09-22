import React from 'react';
import { Box, Typography } from '@mui/material';
import PageHeader from '../../components/layout/PageHeader';

const BookingEditPage: React.FC = () => {
  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit Booking"
        breadcrumbs="Dashboard / Booking Management / Edit Booking"
        subtitle="Edit booking information"
      />
      
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Edit Booking Page - Coming Soon
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          This page will allow editing existing bookings.
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingEditPage;
