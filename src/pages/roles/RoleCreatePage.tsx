import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, EnhancedMultiSelect } from '../../components/ui';
import { useCreateRole } from '../../services/queries/roles';
import { usePermissions } from '../../services/queries/permissions';
import { CreateRoleData } from '../../types/role';
import { useAlertSystem } from '../../hooks';
import { ActionAlert } from '../../components/ui';

const RoleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch permissions data
  const { data: permissionsResponse, isLoading: isLoadingPermissions, error: permissionsError } = usePermissions();
  const createRoleMutation = useCreateRole();

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // Extract permissions data
  const permissions = permissionsResponse?.data || [];

  // Form state
  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    description: '',
    is_active: true,
    permissions: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle form field changes
  const handleFieldChange = (field: keyof CreateRoleData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
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
    createRoleMutation.mutate(formData, {
      onSuccess: () => {
        navigate('/roles?success=' + encodeURIComponent('Role created successfully!'));
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to create role. Please try again.';
        showError(errorMessage, true);
      },
    });
  };

  // Loading state
  if (isLoadingPermissions) {
    return <PageLoadingState title="Loading Permissions" />;
  }

  // Error state
  if (permissionsError) {
    return (
      <PageErrorState
        error={permissionsError}
        title="Error Loading Permissions"
        message={permissionsError.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Role"
        breadcrumbs="Dashboard / Admin Management / Roles / Create"
        subtitle="Add a new role with specific permissions"
        actionButton={{
          text: 'Back to Roles',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/roles')
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

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
                onClick={() => navigate('/roles')}
                disabled={createRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={createRoleMutation.isPending}
              >
                {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RoleCreatePage; 