import React from 'react';
import { Box, Paper, Typography, Chip, Grid, Divider, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const mockRoles = [
  { id: 1, name: 'Super Admin', permissions: ['manage users', 'manage roles', 'manage permissions'], createdAt: '2023-01-01' },
  { id: 2, name: 'Admin', permissions: ['manage users'], createdAt: '2023-03-12' },
  { id: 3, name: 'Editor', permissions: ['edit content'], createdAt: '2023-05-20' },
];

const RoleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = mockRoles.find(r => r.id === Number(id));

  if (!role) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Role not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Role Details"
        breadcrumbs={`Dashboard / Admin Management / Roles / ${role.name}`}
        subtitle="View detailed information about this role"
        actionButton={{
          text: 'Back to Roles',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/roles')
        }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{role.name}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Permissions:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {role.permissions.map((perm) => (
                <Chip key={perm} label={perm} size="small" />
              ))}
            </Box>
            <Typography variant="body2" color="textSecondary">Created: {role.createdAt}</Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/roles/${role.id}/edit`)}
                fullWidth
              >
                Edit Role
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleDetailPage; 