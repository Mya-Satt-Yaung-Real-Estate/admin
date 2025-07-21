import React from 'react';
import { Box, Paper, Typography, Grid, Divider, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const mockPermissions = [
  { id: 1, name: 'manage users', description: 'Can manage users', createdAt: '2023-01-01' },
  { id: 2, name: 'manage roles', description: 'Can manage roles', createdAt: '2023-03-12' },
  { id: 3, name: 'edit content', description: 'Can edit content', createdAt: '2023-05-20' },
];

const PermissionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const permission = mockPermissions.find(p => p.id === Number(id));

  if (!permission) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Permission not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Permission Details"
        breadcrumbs={`Dashboard / Admin Management / Permissions / ${permission.name}`}
        subtitle="View detailed information about this permission"
        actionButton={{
          text: 'Back to Permissions',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/permissions')
        }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{permission.name}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Description:</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{permission.description}</Typography>
            <Typography variant="body2" color="textSecondary">Created: {permission.createdAt}</Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/permissions/${permission.id}/edit`)}
                fullWidth
              >
                Edit Permission
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PermissionDetailPage; 