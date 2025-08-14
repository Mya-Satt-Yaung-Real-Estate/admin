import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, EnhancedMultiSelect } from '../../components/ui';
import { useAdminUser, useUpdateAdminUser } from '../../services/queries/adminUsers';
import { useRoles } from '../../services/queries/roles';
import { UpdateAdminUserData } from '../../types/admin';

const AdminEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const adminSlug = slug || '';


  const [formData, setFormData] = useState<UpdateAdminUserData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    is_active: true,
    role_ids: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateAdminUserData, string>>>({});

  // Queries
  const { data: adminData, isLoading: adminLoading, error: adminError } = useAdminUser(adminSlug);
  const updateAdminMutation = useUpdateAdminUser();
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles({
    per_page: 100,
    sort_by: 'name',
    sort_direction: 'asc',
  });

  // Initialize form data when admin data is loaded
  useEffect(() => {
    if (adminData?.data) {
      const admin = adminData.data;
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        password: '',
        password_confirmation: '',
        is_active: admin.is_active,
        role_ids: admin.roles?.map(role => role.id) || [],
      });
    }
  }, [adminData]);

  const handleInputChange = (field: keyof UpdateAdminUserData, value: string | boolean | number[]) => {
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
    const newErrors: Partial<Record<keyof UpdateAdminUserData, string>> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    if (formData.role_ids && formData.role_ids.length === 0) {
      newErrors.role_ids = 'At least one role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Only include password fields if password is being changed
      const updateData: UpdateAdminUserData = {
        name: formData.name,
        email: formData.email,
        is_active: formData.is_active,
        role_ids: formData.role_ids,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password_confirmation;
      }

      await updateAdminMutation.mutateAsync({ slug: adminSlug, data: updateData });
      navigate('/admins?success=' + encodeURIComponent('Admin user updated successfully!'));
    } catch (error: any) {
      console.error('Error updating admin:', error);
      
      // Handle API validation errors
      if (error.errors) {
        const apiErrors: Partial<Record<keyof UpdateAdminUserData, string>> = {};
        Object.entries(error.errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            apiErrors[key as keyof UpdateAdminUserData] = value[0] as string;
          }
        });
        setErrors(apiErrors);
      } else {
        navigate('/admins?error=' + encodeURIComponent(error.message || 'Failed to update admin user. Please try again.'));
      }
    }
  };

  // Loading states
  if (adminLoading || rolesLoading) {
    return (
      <Box>
        <PageHeader title="Edit Admin User" />
        <PageLoadingState 
          title="Loading Admin Data"
          message="Please wait while we load the admin user and roles..."
        />
      </Box>
    );
  }

  // Error states
  if (adminError) {
    return (
      <Box>
        <PageHeader title="Edit Admin User" />
        <PageErrorState 
          error={adminError}
          title="Failed to Load Admin"
          message="Unable to load admin user data. Please try again."
        />
      </Box>
    );
  }

  if (rolesError) {
    return (
      <Box>
        <PageHeader title="Edit Admin User" />
        <PageErrorState 
          error={rolesError}
          title="Failed to Load Roles"
          message="Unable to load roles. Please try again."
        />
      </Box>
    );
  }

  if (!adminData?.data) {
    return (
      <Box>
        <PageHeader title="Edit Admin User" />
        <PageErrorState 
          error={{ message: 'Admin user not found' }}
          title="Admin Not Found"
          message="The admin user you're looking for doesn't exist."
        />
      </Box>
    );
  }

  const admin = adminData.data;
  const roles = rolesData?.data || [];

  return (
    <Box>
      <PageHeader 
        title="Edit Admin User"
        subtitle={`Update information for ${admin.name}`}
        actionButton={{
          text: 'Back to Admin',
          icon: <ArrowBackIcon />,
          onClick: () => navigate(`/admins/${adminSlug}`)
        }}
      />
      
      <Paper sx={{ p: 3 }}>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name || ''}
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
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password (leave blank to keep current)"
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.password_confirmation || ''}
                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <EnhancedMultiSelect
                label="Roles"
                value={formData.role_ids || []}
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
                  value={formData.is_active?.toString() || 'true'}
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
              onClick={() => navigate(`/admins/${adminSlug}`)}
              disabled={updateAdminMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateAdminMutation.isPending}
            >
              {updateAdminMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminEditPage; 