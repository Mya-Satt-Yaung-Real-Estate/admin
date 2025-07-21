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
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
    password: '',
  },
  {
    id: 2,
    name: 'Bob Manager',
    email: 'bob.manager@example.com',
    role: 'Admin',
    status: 'inactive',
    avatar: 'BM',
    password: '',
  },
];

const AdminEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const admin = mockAdmins.find(a => a.id === Number(id));

  const [formData, setFormData] = useState(() =>
    admin ? { ...admin, confirmPassword: '' } : {
      name: '', email: '', role: 'Admin', status: 'active', avatar: '', password: '', confirmPassword: ''
    }
  );
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Updating admin:', formData);
      setIsSubmitting(false);
      navigate(`/admins/${id}`);
    }, 1500);
  };

  const generateAvatar = () => {
    const initials = formData.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase();
    setFormData((prev: any) => ({ ...prev, avatar: initials }));
  };

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
        title="Edit Admin User"
        breadcrumbs={`Dashboard / Admin Users / ${admin.name} / Edit`}
        subtitle="Update admin user information"
        actionButton={{
          text: 'Back to Admin',
          icon: <ArrowBackIcon />,
          onClick: () => navigate(`/admins/${id}`)
        }}
      />
      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Super Admin">Super Admin</MenuItem>
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
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                {formData.avatar || 'NA'}
              </Avatar>
              <Box>
                <Button
                  variant="outlined"
                  onClick={generateAvatar}
                  disabled={!formData.name}
                >
                  Regenerate Avatar
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Avatar will be generated from initials
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password (leave blank to keep current)"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
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
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/admins/${id}`)}
            startIcon={<CancelIcon />}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={<SaveIcon />}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminEditPage; 