import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Chip, 
  Grid, 
  Divider, 
  Button,
  Alert,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useAdminUser, useDeleteAdminUser } from '../../services/queries';
import { PageLoadingState, PageErrorState } from '../../components/ui';
import { getUserInitials, formatLastLogin } from '../../utils';
import { getStatusDisplay } from '../../utils';

const AdminDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const adminSlug = slug || '';

  // Queries
  const { data: adminData, isLoading, error } = useAdminUser(adminSlug);
  const deleteAdminMutation = useDeleteAdminUser();

  const handleDelete = async () => {
    if (!adminData?.data) return;
    
    if (window.confirm(`Are you sure you want to delete ${adminData.data.name}? This action cannot be undone.`)) {
      try {
        await deleteAdminMutation.mutateAsync(adminSlug);
        navigate('/admins');
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Admin Details" />
        <PageLoadingState 
          title="Loading Admin Details"
          message="Please wait while we load the admin user information..."
        />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <PageHeader title="Admin Details" />
        <PageErrorState 
          error={error}
          title="Failed to Load Admin"
          message="Unable to load admin user details. Please try again."
        />
      </Box>
    );
  }

  if (!adminData?.data) {
    return (
      <Box>
        <PageHeader title="Admin Details" />
        <PageErrorState 
          error={{ message: 'Admin user not found' }}
          title="Admin Not Found"
          message="The admin user you're looking for doesn't exist."
        />
      </Box>
    );
  }

  const admin = adminData.data;
  const statusDisplay = getStatusDisplay(admin.is_active);

  return (
    <Box>
      <PageHeader
        title="Admin Details"
        subtitle={`View detailed information about ${admin.name}`}
        actionButton={{
          text: 'Back to Admins',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/admins')
        }}
      />

      {/* Success/Error alerts */}
      {deleteAdminMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Admin user deleted successfully!
        </Alert>
      )}

      {deleteAdminMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteAdminMutation.error?.message || 'Failed to delete admin user. Please try again.'}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'primary.main', 
                fontSize: '2rem', 
                mx: 'auto', 
                mb: 2 
              }}
            >
              {getUserInitials(admin.name)}
            </Avatar>
            <Typography variant="h5" gutterBottom>{admin.name}</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>{admin.email}</Typography>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2, flexWrap: 'wrap' }}>
              {admin.roles?.map((role) => (
                <Chip 
                  key={role.id}
                  label={role.name} 
                  color="primary" 
                  size="small" 
                  variant="outlined" 
                />
              ))}
              <Chip 
                label={statusDisplay.label}
                color={statusDisplay.color}
                size="small"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>User Type:</strong> {admin.user_type}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Member Level:</strong> {admin.member_level}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Last Login:</strong> {formatLastLogin(admin.last_login_at)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Last Active:</strong> {formatLastLogin(admin.last_active_at)}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Email Verified:</strong> {admin.email_verified_at ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Created:</strong> {new Date(admin.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Updated:</strong> {new Date(admin.updated_at).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admins/${adminSlug}/edit`)}
                fullWidth
              >
                Edit Admin
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={deleteAdminMutation.isPending}
                fullWidth
              >
                {deleteAdminMutation.isPending ? 'Deleting...' : 'Delete Admin'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Permissions Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Permissions</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {admin.permissions && admin.permissions.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {admin.permissions.map((permission) => (
                  <Chip 
                    key={permission.id}
                    label={permission.name} 
                    size="small" 
                    variant="outlined"
                    color="secondary"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No specific permissions assigned. Permissions are inherited from roles.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDetailPage; 