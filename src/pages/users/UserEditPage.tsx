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
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'Normal User' | 'Company User';
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  location: string;
  bio: string;
  isActive: boolean;
  sendEmailNotification: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Normal User' | 'Company User';
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  lastLogin: string;
  createdAt: string;
  phone?: string;
  location?: string;
  bio?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'JD',
    lastLogin: '2024-01-15 10:30',
    createdAt: '2023-06-15',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Real estate enthusiast looking for investment opportunities in the city.'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'JS',
    lastLogin: '2024-01-14 15:45',
    createdAt: '2023-08-20',
    phone: '+1 (555) 234-5678',
    location: 'Los Angeles, CA',
    bio: 'Real estate agent specializing in luxury properties and commercial real estate.'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Company User',
    status: 'inactive',
    avatar: 'MJ',
    lastLogin: '2024-01-10 09:15',
    createdAt: '2023-09-10',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    bio: 'Property owner and real estate investor with portfolio across multiple states.'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'Normal User',
    status: 'pending',
    avatar: 'SW',
    lastLogin: 'Never',
    createdAt: '2024-01-12',
    phone: '+1 (555) 456-7890',
    location: 'Miami, FL',
    bio: 'First-time homebuyer looking for family-friendly neighborhoods.'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'DB',
    lastLogin: '2024-01-13 14:20',
    createdAt: '2023-11-05',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    bio: 'Tech professional seeking modern apartments in downtown area.'
  }
];

const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Normal User',
    status: 'pending',
    avatar: '',
    location: '',
    bio: '',
    isActive: true,
    sendEmailNotification: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const user = mockUsers.find(u => u.id === parseInt(id));
      if (user) {
        const [firstName, ...lastNameParts] = user.name.split(' ');
        const lastName = lastNameParts.join(' ');
        
        setFormData({
          firstName: firstName || '',
          lastName: lastName || '',
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          location: user.location || '',
          bio: user.bio || '',
          isActive: user.status === 'active',
          sendEmailNotification: false,
        });
      }
    }
  }, [id]);

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
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
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Updating user:', formData);
      setIsSubmitting(false);
      navigate('/users');
    }, 1500);
  };

  const handleDelete = () => {
    // Handle delete logic
    console.log('Deleting user:', id);
    navigate('/users');
  };

  const generateAvatar = () => {
    const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    setFormData(prev => ({ ...prev, avatar: initials }));
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit User"
        breadcrumbs="Dashboard / User Management / Edit User"
        subtitle="Update user information and settings"
        actionButton={{
          text: 'Back to Users',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/users')
        }}
      />

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
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
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                }}
              >
                {formData.avatar || 'U'}
              </Avatar>
              <Button
                variant="outlined"
                onClick={generateAvatar}
                disabled={!formData.firstName || !formData.lastName}
              >
                Generate Avatar
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Role & Status */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Role & Status
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => handleInputChange('role', e.target.value)}
                error={!!errors.role}
              >
                <MenuItem value="Normal User">Normal User (Real Estate Seeker)</MenuItem>
                <MenuItem value="Company User">Company User (Agency/Owner)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, State"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              multiline
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
              }
              label="Account Active"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.sendEmailNotification}
                  onChange={(e) => handleInputChange('sendEmailNotification', e.target.checked)}
                />
              }
              label="Send Email Notifications"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                startIcon={<DeleteIcon />}
              >
                Delete User
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserEditPage; 