import React, { useState } from 'react';
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
  Avatar,
  Alert,
  Divider,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { AdminFormData } from '../../types/admin';
import { getActiveRoles } from '../../data/mockRoles';

const AdminCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdminFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roleId: 0,
    status: 'active',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AdminFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof AdminFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AdminFormData, string>> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Creating admin:', formData);
      setIsSubmitting(false);
      navigate('/admins');
    }, 1500);
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  const getSelectedRole = () => {
    return getActiveRoles().find(role => role.id === formData.roleId);
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Admin"
        breadcrumbs="Dashboard / Admin Management / Create Admin"
        subtitle="Add a new system administrator"
        actionButton={{
          text: 'Back to Admins',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/admins')
        }}
      />
      
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Admin Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              required
              placeholder="e.g., admin_user"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
              placeholder="e.g., admin@example.com"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
              placeholder="e.g., John"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
              placeholder="e.g., Doe"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.roleId}
                label="Role"
                onChange={(e) => handleInputChange('roleId', e.target.value as number)}
                error={!!errors.roleId}
              >
                <MenuItem value={0} disabled>
                  Select a role
                </MenuItem>
                {getActiveRoles().map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
                error={!!errors.status}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              required
              placeholder="Enter password"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
              placeholder="Confirm password"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Preview Section */}
          {(formData.firstName || formData.lastName) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Typography variant="body2">{getInitials()}</Typography>
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {formData.firstName} {formData.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formData.email}
                  </Typography>
                  {formData.roleId > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      Role: {getSelectedRole()?.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Note:</strong> The admin will be able to log in immediately after creation with the provided credentials.
              </Typography>
            </Alert>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admins')}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={<SaveIcon />}
              >
                {isSubmitting ? 'Creating...' : 'Create Admin'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminCreatePage; 