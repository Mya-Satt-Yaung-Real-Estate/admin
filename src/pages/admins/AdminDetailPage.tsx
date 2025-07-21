import React from 'react';
import { Box, Paper, Typography, Avatar, Chip, Grid, Divider, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const mockAdmins = [
  {
    id: 1,
    name: 'Alice Admin',
    email: 'alice.admin@example.com',
    role: 'Super Admin',
    status: 'active',
    avatar: 'AA',
    lastLogin: '2024-01-15 09:00',
    createdAt: '2023-01-01',
  },
  {
    id: 2,
    name: 'Bob Manager',
    email: 'bob.manager@example.com',
    role: 'Admin',
    status: 'inactive',
    avatar: 'BM',
    lastLogin: '2024-01-10 14:30',
    createdAt: '2023-03-12',
  },
];

const AdminDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const admin = mockAdmins.find(a => a.id === Number(id));

  if (!admin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Admin not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Admin Details"
        breadcrumbs={`Dashboard / Admin Users / ${admin.name}`}
        subtitle="View detailed information about this admin user"
        actionButton={{
          text: 'Back to Admins',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/admins')
        }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2rem', mx: 'auto', mb: 2 }}>
              {admin.avatar}
            </Avatar>
            <Typography variant="h5" gutterBottom>{admin.name}</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>{admin.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
              <Chip label={admin.role} color={admin.role === 'Super Admin' ? 'primary' : 'secondary'} size="small" variant="outlined" />
              <Chip label={admin.status} color={admin.status === 'active' ? 'success' : 'error'} size="small" />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="textSecondary">Last Login: {admin.lastLogin}</Typography>
            <Typography variant="body2" color="textSecondary">Created: {admin.createdAt}</Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admins/${admin.id}/edit`)}
                fullWidth
              >
                Edit Admin
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDetailPage; 