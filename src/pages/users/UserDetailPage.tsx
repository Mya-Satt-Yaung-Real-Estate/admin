import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  Fingerprint as FingerprintIcon,
  Home as HomeIcon,
  Map as MapIcon,
  Devices as DevicesIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { 
  PageLoadingState, 
  PageErrorState, 
  UserPointStatistics,
  UserPointPackages,
  UserPointTransactions,
  UserPropertyStatistics,
  ActionAlert,
} from '../../components/ui';
import { useUser, useClearBiometricUser, useRevokeUser } from '../../services/queries/users';
import { getRegularUserDisplayName } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';
import { useAlertSystem } from '../../hooks';
import { DEFAULT_COVER_IMAGE, DETAIL_ICON_SX, detailListSx, USER_EDIT_IMAGE_MIN_HEIGHT } from './userPageShared';

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
  const { alert, showSuccess, showError } = useAlertSystem();

  // Queries
  const { data: userData, isLoading, error } = useUser(slug || '');
  const clearBiometricMutation = useClearBiometricUser();
  const revokeUserMutation = useRevokeUser();

  // Computed values
  const user = userData?.data?.user;

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);
  const handleEdit = () => navigate(`/users/${slug}/edit`);

  const handleClearBiometric = async () => {
    if (!slug) return;
    if (!window.confirm('Clear biometric data for this user? They will need to enable biometric again from the app.')) return;
    try {
      await clearBiometricMutation.mutateAsync(slug);
      showSuccess('Biometric data cleared. User can enable it again from the app.');
    } catch (err: any) {
      showError(err?.message || 'Failed to clear biometric data.', true);
    }
  };

  const handleRevokeUser = async () => {
    if (!slug) return;
    if (!window.confirm('Revoke this user? They will be logged out and cannot log in until reactivated.')) return;
    try {
      const response = await revokeUserMutation.mutateAsync(slug);
      const tokensRevoked = response?.data?.tokens_revoked ?? 0;
      showSuccess(`User revoked. ${tokensRevoked} session(s) terminated.`);
    } catch (err: any) {
      showError(err?.message || 'Failed to revoke user.', true);
    }
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
        breadcrumbs="Dashboard / User Management / User Details"
        subtitle={`Viewing details for ${getRegularUserDisplayName(user)}`}
        actionButton={{
          text: 'Back to Users',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <Grid container spacing={3} alignItems="flex-start">
        {/* Profile photo */}
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom alignSelf="flex-start" width="100%">
                Profile photo
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: USER_EDIT_IMAGE_MIN_HEIGHT,
                  flexShrink: 0,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  boxSizing: 'border-box',
                  border: '2px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user.profile_image_url ? (
                  <Box
                    component="img"
                    src={user.profile_image_url}
                    alt={`${getRegularUserDisplayName(user)} profile`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <PersonIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cover photo */}
        <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Cover photo
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: USER_EDIT_IMAGE_MIN_HEIGHT,
                  flexShrink: 0,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  boxSizing: 'border-box',
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  component="img"
                  src={user.cover_image_url || DEFAULT_COVER_IMAGE}
                  alt={`${getRegularUserDisplayName(user)} cover`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Information — full width */}
        <Grid item xs={12}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                  User Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<BlockIcon />}
                    onClick={handleRevokeUser}
                    disabled={!user.is_active || revokeUserMutation.isPending}
                  >
                    {revokeUserMutation.isPending ? 'Revoking…' : 'Revoke User'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<FingerprintIcon />}
                    onClick={handleClearBiometric}
                    disabled={!user.biometric_enabled || clearBiometricMutation.isPending}
                  >
                    {clearBiometricMutation.isPending ? 'Clearing…' : 'Clear Biometric Data'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Edit User
                  </Button>
                </Box>
              </Box>
              
              <List sx={detailListSx}>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon sx={DETAIL_ICON_SX.person} />
                  </ListItemIcon>
                  <ListItemText
                    primary={user.user_type === 'company' ? 'Account Name' : 'Name'}
                    secondary={user.name}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon sx={DETAIL_ICON_SX.phone} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone Number"
                    secondary={user.phone || user.company_profile?.phone_number || 'N/A'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon sx={DETAIL_ICON_SX.business} />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Type"
                    secondary={user.user_type === 'company' ? 'Company' : 'Individual'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <StarIcon sx={DETAIL_ICON_SX.star} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Level"
                    secondary={user.member_level}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <MapIcon sx={DETAIL_ICON_SX.map} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Map Pins Access"
                    secondary={user.map_pins_access ? 'Enabled' : 'Disabled'}
                  />
                </ListItem>

                {user.user_type !== 'company' && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon sx={DETAIL_ICON_SX.calendar} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created"
                      secondary={user.created_at ? formatDate(user.created_at) : 'N/A'}
                    />
                  </ListItem>
                )}
              </List>

              {user.user_type === 'company' && user.company_profile && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Company Information
                  </Typography>
                  <List sx={detailListSx}>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon sx={DETAIL_ICON_SX.business} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company Name"
                        secondary={user.company_profile.company_name || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <StarIcon sx={DETAIL_ICON_SX.star} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company Type"
                        secondary={user.company_profile.company_type_name || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon sx={DETAIL_ICON_SX.phone} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company Phone"
                        secondary={user.company_profile.phone_number || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon sx={DETAIL_ICON_SX.location} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Location"
                        secondary={user.company_profile.location_en || user.company_profile.location_mm || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon sx={DETAIL_ICON_SX.business} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Business Address"
                        secondary={user.company_profile.address || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon sx={DETAIL_ICON_SX.calendar} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Created"
                        secondary={user.created_at ? formatDate(user.created_at) : 'N/A'}
                      />
                    </ListItem>

                    {user.company_profile.description && (
                      <ListItem sx={{ gridColumn: { xs: '1', lg: '1 / -1' } }}>
                        <ListItemIcon>
                          <DescriptionIcon sx={DETAIL_ICON_SX.description} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Description"
                          secondary={user.company_profile.description}
                        />
                      </ListItem>
                    )}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {user.user_type === 'company' && user.company_profile && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status / Options
                </Typography>

                <List
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    columnGap: 3,
                    rowGap: 0.5,
                    '& .MuiListItem-root': {
                      px: 0,
                      alignItems: 'flex-start',
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 36,
                      mt: 0.5,
                    },
                  }}
                >
                  <ListItem>
                    <ListItemIcon>
                      <HomeIcon sx={DETAIL_ICON_SX.home} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Show on homepage"
                      secondary={
                        user.company_profile.show_on_homepage ? (
                          <Typography component="span" variant="body2" color="success.main" fontWeight={500}>
                            Yes
                          </Typography>
                        ) : (
                          <Typography component="span" variant="body2" color="error.main" fontWeight={500}>
                            No
                          </Typography>
                        )
                      }
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <HomeIcon sx={DETAIL_ICON_SX.home} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Show on property detail"
                      secondary={
                        user.company_profile.show_on_property_detail ? (
                          <Typography component="span" variant="body2" color="success.main" fontWeight={500}>
                            Yes
                          </Typography>
                        ) : (
                          <Typography component="span" variant="body2" color="error.main" fontWeight={500}>
                            No
                          </Typography>
                        )
                      }
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <StarIcon sx={DETAIL_ICON_SX.star} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Are you Jade Market?"
                      secondary={
                        user.company_profile.our_market ? (
                          <Typography component="span" variant="body2" color="success.main" fontWeight={500}>
                            Yes
                          </Typography>
                        ) : (
                          <Typography component="span" variant="body2" color="error.main" fontWeight={500}>
                            No
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DevicesIcon color="action" />
                <Typography variant="h6">
                  Registered Devices ({user.devices?.length ?? 0})
                </Typography>
              </Box>

              {user.devices && user.devices.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Device</TableCell>
                        <TableCell>Platform</TableCell>
                        <TableCell>OS</TableCell>
                        <TableCell>App</TableCell>
                        <TableCell>Last seen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {user.devices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell>
                            {device.device_name || device.device_model || device.device_id}
                          </TableCell>
                          <TableCell>{device.platform}</TableCell>
                          <TableCell>{device.os_version || '—'}</TableCell>
                          <TableCell>{device.app_version || '—'}</TableCell>
                          <TableCell>
                            {device.last_seen_at ? formatDate(device.last_seen_at) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No mobile devices registered yet.
                </Typography>
              )}
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