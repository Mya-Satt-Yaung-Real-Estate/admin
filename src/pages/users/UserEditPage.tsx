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
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
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
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  lastLogin: string;
  createdAt: string;
  phone?: string;
  department?: string;
  location?: string;
  bio?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    avatar: 'JD',
    lastLogin: '2024-01-15 10:30',
    createdAt: '2023-06-15',
    phone: '+1 (555) 123-4567',
    department: 'IT',
    location: 'New York, NY',
    bio: 'Senior IT Administrator with 8+ years of experience in system administration and user management.'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    avatar: 'JS',
    lastLogin: '2024-01-14 15:45',
    createdAt: '2023-08-20',
    phone: '+1 (555) 234-5678',
    department: 'Marketing',
    location: 'Los Angeles, CA',
    bio: 'Marketing Specialist focused on digital campaigns and brand development.'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Manager',
    status: 'inactive',
    avatar: 'MJ',
    lastLogin: '2024-01-10 09:15',
    createdAt: '2023-09-10',
    phone: '+1 (555) 345-6789',
    department: 'Sales',
    location: 'Chicago, IL',
    bio: 'Sales Manager with expertise in B2B sales and team leadership.'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'User',
    status: 'pending',
    avatar: 'SW',
    lastLogin: 'Never',
    createdAt: '2024-01-12',
    phone: '+1 (555) 456-7890',
    department: 'HR',
    location: 'Austin, TX',
    bio: 'HR Coordinator specializing in recruitment and employee relations.'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'User',
    status: 'active',
    avatar: 'DB',
    lastLogin: '2024-01-13 14:20',
    createdAt: '2023-11-05',
    phone: '+1 (555) 567-8901',
    department: 'Finance',
    location: 'Seattle, WA',
    bio: 'Financial Analyst with strong background in budgeting and financial planning.'
  }
];

const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'User',
    department: '',
    status: 'pending',
    avatar: '',
    location: '',
    bio: '',
    isActive: true,
    sendEmailNotification: false,
  });
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const userId = parseInt(id || '1');
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      const [firstName, ...lastNameParts] = foundUser.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        email: foundUser.email,
        phone: foundUser.phone || '',
        role: foundUser.role,
        department: foundUser.department || '',
        status: foundUser.status,
        avatar: foundUser.avatar,
        location: foundUser.location || '',
        bio: foundUser.bio || '',
        isActive: foundUser.status === 'active',
        sendEmailNotification: false,
      });
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
    const newErrors: Partial<UserFormData> = {};

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
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
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
      navigate(`/users/${id}`);
    }, 1500);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Simulate delete API call
    setTimeout(() => {
      console.log('Deleting user:', user?.id);
      navigate('/users');
    }, 1000);
  };

  const generateAvatar = () => {
    const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    setFormData(prev => ({ ...prev, avatar: initials }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">User not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit User"
        breadcrumbs={`Dashboard / Users / ${user.name} / Edit`}
        subtitle="Update user information and settings"
        actionButton={{
          text: 'Back to User',
          icon: <ArrowBackIcon />,
          onClick: () => navigate(`/users/${id}`)
        }}
      />

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                mx: 'auto',
                mb: 2
              }}
            >
              {formData.avatar}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {formData.firstName} {formData.lastName}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {formData.email}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
              <Chip
                label={formData.role}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Chip
                label={formData.status}
                color={getStatusColor(formData.status) as any}
                size="small"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                variant="outlined"
                onClick={generateAvatar}
                disabled={!formData.firstName || !formData.lastName}
                fullWidth
                sx={{ mb: 1 }}
              >
                Regenerate Avatar
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                fullWidth
                startIcon={<DeleteIcon />}
              >
                Delete User
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            
            <Grid container spacing={3}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.department}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.department}
                    label="Department"
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Sales">Sales</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Operations">Operations</MenuItem>
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
              <Grid item xs={12} sm={6}>
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
                  label="Send email notification about changes"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/users/${id}`)}
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
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Paper sx={{ p: 3, maxWidth: 400, width: '100%', mx: 2 }}>
            <Typography variant="h6" gutterBottom>
              Delete User
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to delete {user.name}? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default UserEditPage; 