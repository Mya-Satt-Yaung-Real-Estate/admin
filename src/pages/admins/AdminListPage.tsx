import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import PageHeader from '../../components/layout/PageHeader';
import { useAdminUsers } from '../../services/queries/adminUsers';

const AdminListPage: React.FC = () => {
  const { data: adminsData, isLoading, error } = useAdminUsers();

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Admin Users" />
        <Paper sx={{ p: 3 }}>
          <Typography>Loading admin users...</Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Admin Users" />
        <Paper sx={{ p: 3 }}>
          <Alert severity="error">
            Error loading admin users: {error.message}
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Admin Users" />
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Admin Users ({adminsData?.data?.length || 0})
        </Typography>
        <Typography color="text.secondary">
          Admin user management will be implemented here using real API data.
        </Typography>
        {/* TODO: Implement full admin list with filtering, pagination, and actions */}
      </Paper>
    </Box>
  );
};

export default AdminListPage; 