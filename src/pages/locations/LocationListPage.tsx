import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import PageHeader from '../../components/layout/PageHeader';
import { useRegions } from '../../services/queries/locations';

const LocationListPage: React.FC = () => {
  const { data: regionsData, isLoading, error } = useRegions();

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Locations" />
        <Paper sx={{ p: 3 }}>
          <Typography>Loading locations...</Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Locations" />
        <Paper sx={{ p: 3 }}>
          <Alert severity="error">
            Error loading locations: {error.message}
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Locations" />
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Regions ({regionsData?.data?.length || 0})
        </Typography>
        <Typography color="text.secondary">
          Location management will be implemented here using real API data.
        </Typography>
        {/* TODO: Implement full location list with regions and townships */}
      </Paper>
    </Box>
  );
};

export default LocationListPage; 