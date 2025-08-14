import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, EnhancedMultiSelect } from '../../components/ui';
import { useRole, useUpdateRole } from '../../services/queries/roles';
import { usePermissions } from '../../services/queries/permissions';
import { UpdateRoleData } from '../../types/role';

const RoleEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch role and permissions data
  const { data: roleResponse, isLoading: isLoadingRole, error: roleError } = useRole(slug || '');
  const { data: permissionsResponse, isLoading: isLoadingPermissions, error: permissionsError } = usePermissions();
  const updateRoleMutation = useUpdateRole();

  // Extract data
  const role = roleResponse?.data;
  const permissions = permissionsResponse?.data || [];

  // Form state
  const [formData, setFormData] = useState<UpdateRoleData>({
    name: '',
    description: '',
    is_active: true,
    permissions: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when role is loaded
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        is_active: role.is_active,
        permissions: role.permissions?.map(p => p.id) || [],
      });
    }
  }, [role]);

  // Handle form field changes
  const handleFieldChange = (field: keyof UpdateRoleData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!slug) return;

    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Role name is required';
    }
    if (!formData.permissions || formData.permissions.length === 0) {
      newErrors.permissions = 'Select at least one permission';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Submit form
    updateRoleMutation.mutate(
      { slug, data: formData },
      {
        onSuccess: () => {
          navigate('/roles?success=' + encodeURIComponent('Role updated successfully!'));
        },
        onError: () => {
          navigate('/roles?error=' + encodeURIComponent('Failed to update role. Please try again.'));
        },
      }
    );
  };

  // Loading state
  if (isLoadingRole || isLoadingPermissions) {
    return <PageLoadingState title="Loading Role Details" />;
  }

  // Error state
  if (roleError || permissionsError) {
    return (
      <PageErrorState
        error={roleError || permissionsError}
        title="Error Loading Role"
        message={roleError?.message || permissionsError?.message}
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
        title="Edit Role"
        breadcrumbs={`Dashboard / Admin Management / Roles / ${role.name} / Edit`}
        subtitle="Update role information and permissions"
        actionButton={{
          text: 'Back to Role',
          icon: <ArrowBackIcon />,
          onClick: () => navigate(`/roles/${slug}`)
        }}
      />



      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Role Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role Name"
              value={formData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => handleFieldChange('is_active', e.target.value === 'true')}
                label="Status"
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              multiline
              rows={3}
              helperText="Optional description for this role"
            />
          </Grid>

          {/* Permissions */}
          <Grid item xs={12}>
            <EnhancedMultiSelect
              label="Permissions"
              value={formData.permissions || []}
              onChange={(selected) => handleFieldChange('permissions', selected)}
              options={permissions}
              error={!!errors.permissions}
              helperText={errors.permissions}
              required
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate(`/roles/${slug}`)}
                disabled={updateRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RoleEditPage; 