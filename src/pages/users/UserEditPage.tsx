import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { 
  PageLoadingState, 
  PageErrorState, 
  StatusChip,
  ActionAlert,
} from '../../components/ui';
import { useUser, useUpdateUser } from '../../services/queries/users';
import { UpdateRegularUserData } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';
import { useAlertSystem } from '../../hooks';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Edit User Status',
  description: 'Update user account status',
  backButtonPath: '/users',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Hooks
  const { alert, showError } = useAlertSystem();
  
  // Queries and mutations
  const { data: userData, isLoading, error } = useUser(slug || '');
  const updateUserMutation = useUpdateUser();

  // Computed values
  const user = userData?.data?.user;

  // Initialize status when user data loads
  React.useEffect(() => {
    if (user) {
      setStatus(user.is_active);
      setHasChanges(false);
    }
  }, [user]);

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);
  
  const handleStatusChange = (newStatus: boolean) => {
    setStatus(newStatus);
    setHasChanges(newStatus !== user?.is_active);
  };

  const handleSubmit = async () => {
    if (!user || !hasChanges) return;

    const updateData: UpdateRegularUserData = {
      is_active: status,
    };

    try {
      await updateUserMutation.mutateAsync({
        slug: slug!,
        data: updateData,
      });
      
      // Navigate back to user detail page with success message
      navigate(`/users/${slug}?success=${encodeURIComponent('User status updated successfully!')}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update user status. Please try again.';
      showError(errorMessage, true);
    }
  };

  const getUserTypeIcon = () => {
    return user?.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />;
  };

  const getUserTypeColor = () => {
    return user?.user_type === 'company' ? 'primary.main' : 'secondary.main';
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading User Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading User"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!user) {
    return (
      <PageErrorState
        error={new Error('User not found')}
        title="User Not Found"
        message="The requested user could not be found."
        onRetry={handleBack}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <ActionAlert {...alert} />
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / User Management / Edit User Status"
        subtitle={`Update status for ${user.name}`}
        actionButton={{
          text: 'Back to Users',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <Grid container spacing={3}>
        {/* User Overview Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: getUserTypeColor(),
                  fontSize: '2rem',
                }}
              >
                {getUserTypeIcon()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                {user.user_type === 'company' ? 'Company User' : 'Individual User'}
              </Typography>

              <StatusChip status={user.is_active ? 'active' : 'inactive'} />
            </CardContent>
          </Card>
        </Grid>

        {/* User Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Name"
                    secondary={user.name}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Type"
                    secondary={user.user_type === 'company' ? 'Company' : 'Individual'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={user.created_at ? formatDate(user.created_at) : 'N/A'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Edit Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Change the user's account status. Active users can access the platform, 
              while inactive users will be restricted from logging in.
            </Typography>

            {hasChanges && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You have unsaved changes. Click "Save Changes" to apply the new status.
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ maxWidth: 300 }}>
                <InputLabel>Account Status</InputLabel>
                <Select
                  value={status ? 'active' : 'inactive'}
                  label="Account Status"
                  onChange={(e) => handleStatusChange(e.target.value === 'active')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" color="textSecondary">
                Current Status: <StatusChip status={user.is_active ? 'active' : 'inactive'} />
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!hasChanges || updateUserMutation.isPending}
                  startIcon={<SaveIcon />}
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserEditPage; 