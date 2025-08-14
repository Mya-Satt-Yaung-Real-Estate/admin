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
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, EnhancedMultiSelect } from '../../components/ui';
import { useCreateAdminUser } from '../../services/queries/adminUsers';
import { useRoles } from '../../services/queries/roles';
import { CreateAdminUserData } from '../../types/admin';

const AdminCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAdminUserData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    is_active: true,
    role_ids: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAdminUserData, string>>>({});

  // Queries
  const createAdminMutation = useCreateAdminUser();
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles({
    per_page: 100, // Get all roles for selection
    sort_by: 'name',
    sort_direction: 'asc',
  });

  const handleInputChange = (field: keyof CreateAdminUserData, value: string | boolean | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAdminUserData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    if (formData.role_ids.length === 0) {
      newErrors.role_ids = 'At least one role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createAdminMutation.mutateAsync(formData);
      navigate('/admins?success=' + encodeURIComponent('Admin user created successfully!'));
    } catch (error: any) {
      console.error('Error creating admin:', error);
      
      // Handle API validation errors
      if (error.errors) {
        const apiErrors: Partial<Record<keyof CreateAdminUserData, string>> = {};
        Object.entries(error.errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            apiErrors[key as keyof CreateAdminUserData] = value[0] as string;
          }
        });
        setErrors(apiErrors);
      } else {
        navigate('/admins?error=' + encodeURIComponent(error.message || 'Failed to create admin user. Please try again.'));
      }
    }
  };

  // Loading state for roles
  if (rolesLoading) {
    return (
      <Box>
        <PageHeader title="Create Admin Users" />
        <PageLoadingState 
          title="Loading Roles"
          message="Please wait while we load available roles..."
        />
      </Box>
    );
  }

  // Error state for roles
  if (rolesError) {
    return (
      <Box>
        <PageHeader title="Create Admin Users" />
        <PageErrorState 
          error={rolesError}
          title="Failed to Load Roles"
          message="Unable to load roles. Please try again."
        />
      </Box>
    );
  }

  const roles = rolesData?.data || [];

  return (
    <Box>
      <PageHeader 
        title="Create Admin Users"
        subtitle="Add a new administrator to the system"
        actionButton={{
          text: 'Back to Admins',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/admins')
        }}
      />
      
      <Paper sx={{ p: 3 }}>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <EnhancedMultiSelect
                label="Roles"
                value={formData.role_ids}
                onChange={(selected) => handleInputChange('role_ids', selected)}
                options={roles}
                error={!!errors.role_ids}
                helperText={errors.role_ids}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.is_active.toString()}
                  onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                  label="Status"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admins')}
              disabled={createAdminMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createAdminMutation.isPending}
            >
              {createAdminMutation.isPending ? 'Creating...' : 'Create Admin User'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminCreatePage; 