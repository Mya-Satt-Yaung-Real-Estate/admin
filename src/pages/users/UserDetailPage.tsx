import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { 
  PageLoadingState, 
  PageErrorState, 
  StatusChip,
  UserPointStatistics,
  UserPointPackages,
  UserPointTransactions,
  UserPropertyStatistics,
  ActionAlert,
} from '../../components/ui';
import { useUser } from '../../services/queries/users';
import { formatDate } from '../../constants/dateFormats';
import { useAlertSystem } from '../../hooks';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'User Details',
  description: 'View detailed information about the user',
  backButtonPath: '/users',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // Hooks
  const { alert } = useAlertSystem();
  
  // Queries
  const { data: userData, isLoading, error } = useUser(slug || '');

  // Computed values
  const user = userData?.data?.user;

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);
  const handleEdit = () => navigate(`/users/${slug}/edit`);

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

  const getUserTypeIcon = () => {
    return user.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />;
  };

  const getUserTypeColor = () => {
    return user.user_type === 'company' ? 'primary.main' : 'secondary.main';
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <ActionAlert {...alert} />
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / User Management / User Details"
        subtitle={`Viewing details for ${user.name}`}
        actionButton={{
          text: 'Back to Users',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <Grid container spacing={3}>
        {/* User Profile Card */}
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
              
              <Box sx={{ 
                mt: 2, 
                mb: 2, 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap', 
                justifyContent: 'center' 
              }}>
                <Chip
                  label={user.user_type === 'company' ? 'Company' : 'Individual'}
                  color={user.user_type === 'company' ? 'primary' : 'secondary'}
                  size="small"
                />
                <StatusChip status={user.is_active ? 'active' : 'inactive'} /> 
                {user.user_type === 'company' && (
                  <StatusChip 
                    status={user.verification_status || 'pending'} 
                    statusType="verification_status"
                  />
                )}
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mt: 2 }}
              >
                Edit User
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* User Details */}
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
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Level"
                    secondary={user.member_level}
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

        {/* Property Statistics */}
        <Grid item xs={12}>
          <UserPropertyStatistics
            totalProperties={user.property_statistics?.total_properties || user.property_count || 0}
            activeProperties={user.property_statistics?.active_properties || 0}
            soldProperties={user.property_statistics?.sold_properties || 0}
            rentedProperties={user.property_statistics?.rented_properties || 0}
            expiredProperties={user.property_statistics?.expired_properties || 0}
            draftProperties={user.property_statistics?.draft_properties || 0}
          />
        </Grid>

        {/* Point Statistics */}
        <Grid item xs={12}>
          <UserPointStatistics
            pointBalance={user.point_balance || 0}
            totalPointsAllocated={user.total_points_allocated || 0}
            totalPointsConsumed={user.total_points_consumed || 0}
            pointPackagesCount={user.point_packages_count || 0}
          />
        </Grid>

        {/* Point Packages */}
        <Grid item xs={12} md={6}>
          <UserPointPackages pointPackages={user.point_packages || []} />
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <UserPointTransactions transactions={user.recent_transactions || []} />
        </Grid>

        {/* Company Profile (if company user) */}
        {user.user_type === 'company' && user.company_profile && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Company Profile
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Company Name"
                          secondary={user.company_profile.company_name}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Company Type"
                          secondary={user.company_profile.company_type_name}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Phone Number"
                          secondary={user.company_profile.phone_number}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Location (English)"
                          secondary={user.company_profile.location_en}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Location (Myanmar)"
                          secondary={user.company_profile.location_mm}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <VisibilityIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="View Count"
                          secondary={user.company_profile.view_count}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary={user.company_profile.address}
                      />
                    </ListItem>
                    
                    {user.company_profile.website && (
                      <ListItem>
                        <ListItemIcon>
                          <LanguageIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Website"
                          secondary={
                            <a 
                              href={user.company_profile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'inherit' }}
                            >
                              {user.company_profile.website}
                            </a>
                          }
                        />
                      </ListItem>
                    )}
                    
                    {user.company_profile.description && (
                      <ListItem>
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Description"
                          secondary={user.company_profile.description}
                        />
                      </ListItem>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Data Availability Notice */}
        {(!user.point_balance && !user.total_points_allocated && !user.total_points_consumed) && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Note:</strong> Point system data is not available for this user. 
                This may indicate that the user hasn't purchased any point packages yet, 
                or the point system integration is not fully configured.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UserDetailPage; 