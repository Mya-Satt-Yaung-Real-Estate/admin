import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Grid, 
  Divider, 
  Button,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, DeleteConfirmationDialog, StatusChip } from '../../components/ui';
import { useRole, useDeleteRole } from '../../services/queries/roles';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { formatDate } from '../../constants/dateFormats';


const RoleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch role data
  const { data: roleResponse, isLoading, error } = useRole(slug || '');
  const deleteRoleMutation = useDeleteRole();

  // Alert system hook
  const { showSuccess, showError } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // Extract role data
  const role = roleResponse?.data;

  // Handle delete role
  const handleDeleteRole = () => {
    if (!role) return;
    
    openDeleteConfirmation(
      role.name,
      'role',
      async () => {
        try {
          await deleteRoleMutation.mutateAsync(role.slug);
          showSuccess(`${role.name} deleted successfully!`, true);
          navigate('/roles');
        } catch (error) {
          showError('Failed to delete role. Please try again.', true);
        }
      }
    );
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Role Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Role"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!role) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Role Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The role you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/roles')}
        >
          Back to Roles
        </Button>
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

      {/* Delete success alert */}
      {deleteRoleMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Role deleted successfully!
        </Alert>
      )}

      {/* Delete error alert */}
      {deleteRoleMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to delete role: {deleteRoleMutation.error?.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Role Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {role.name}
                </Typography>
                <StatusChip status={role.is_active} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit Role">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/roles/${role.slug}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Role">
                  <IconButton
                    color="error"
                    onClick={handleDeleteRole}
                    disabled={deleteRoleMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {role.description || 'No description provided'}
              </Typography>
            </Box>

            {/* Permissions */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Permissions ({role.permissions?.length || 0})
              </Typography>
              {role.permissions && role.permissions.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {role.permissions.map((permission) => (
                    <Chip
                      key={permission.id}
                      label={permission.name}
                      size="small"
                      variant="outlined"
                      color="primary"
                      icon={<SecurityIcon />}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No permissions assigned to this role
                </Typography>
              )}
            </Box>

            {/* Timestamps */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Timestamps
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Created: {formatDate(role.created_at, 'display')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Last Updated: {formatDate(role.updated_at, 'display')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteRoleMutation.isPending}
        error={deleteRoleMutation.error?.message || null}
      />
    </Box>
  );
};

export default RoleDetailPage; 