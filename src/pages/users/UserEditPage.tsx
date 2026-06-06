import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Grid,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Fingerprint as FingerprintIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import SingleImageUpload from '../../components/ui/SingleImageUpload';
import { Media } from '../../types/media';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { 
  PageLoadingState, 
  PageErrorState, 
  StatusChip,
  ActionAlert,
} from '../../components/ui';
import { useUser, useUpdateUser, useClearBiometricUser } from '../../services/queries/users';
import { UpdateRegularUserData } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';
import { useAlertSystem } from '../../hooks';
import { MEMBER_LEVEL_OPTIONS } from '../../constants/memberLevels';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Edit User Status',
  description: 'Update user account status',
  backButtonPath: '/users',
} as const;

const EDIT_PROFILE_PHOTO_UPLOAD_HEIGHTS = {
  dropzoneHeight: 320,
  previewImageHeight: 240,
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<boolean>(true);
  const [memberLevel, setMemberLevel] = useState<string>('silver');
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [showOnPropertyDetail, setShowOnPropertyDetail] = useState(false);
  const [ourMarket, setOurMarket] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [profileImage, setProfileImage] = useState<Media | null>(null);
  const [profileImageDirty, setProfileImageDirty] = useState(false);

  // Hooks
  const { alert, showSuccess, showError } = useAlertSystem();
  
  // Queries and mutations
  const { data: userData, isLoading, error } = useUser(slug || '');
  const updateUserMutation = useUpdateUser();
  const clearBiometricMutation = useClearBiometricUser();

  // Computed values
  const user = userData?.data?.user;

  // Initialize status when user data loads
  React.useEffect(() => {
    if (user) {
      setStatus(user.is_active);
      setMemberLevel(user.member_level);
      setVerificationStatus(typeof user.verification_status === 'string' ? user.verification_status || 'pending' : 'pending');
      setShowOnHomepage(Boolean(user.company_profile?.show_on_homepage));
      setShowOnPropertyDetail(Boolean(user.company_profile?.show_on_property_detail));
      setOurMarket(Boolean(user.company_profile?.our_market));
      setHasChanges(false);
      setProfileImageDirty(false);
      if (user.profile_media_id != null && user.profile_image_url) {
        setProfileImage({
          id: user.profile_media_id,
          type: 'image',
          filename: 'profile',
          size: 0,
          formatted_size: '',
          mime_type: 'image/jpeg',
          is_primary: true,
          status: 'completed',
          url: user.profile_image_url,
          created_at: new Date().toISOString(),
        });
      } else {
        setProfileImage(null);
      }
    }
  }, [user]);

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);
  
  const handleStatusChange = (newStatus: boolean) => {
    setStatus(newStatus);
  };

  const handleMemberLevelChange = (newMemberLevel: string) => {
    setMemberLevel(newMemberLevel);
  };

  const handleVerificationStatusChange = (newVerificationStatus: string) => {
    setVerificationStatus(newVerificationStatus);
    if (newVerificationStatus !== 'approved') {
      setShowOnHomepage(false);
      setShowOnPropertyDetail(false);
      setOurMarket(false);
    }
  };

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

  // New useEffect to track changes
  React.useEffect(() => {
    if (!user) return;
    const statusChanged = Boolean(status) !== Boolean(user.is_active);
    const memberLevelChanged = memberLevel !== user.member_level;
    let verificationStatusChanged = false;
    let showOnHomepageChanged = false;
    let showOnPropertyDetailChanged = false;
    let ourMarketChanged = false;
    if (user.user_type === 'company') {
      verificationStatusChanged = verificationStatus !== (typeof user.verification_status === 'string' ? user.verification_status || 'pending' : 'pending');
      showOnHomepageChanged = showOnHomepage !== Boolean(user.company_profile?.show_on_homepage);
      showOnPropertyDetailChanged = showOnPropertyDetail !== Boolean(user.company_profile?.show_on_property_detail);
      ourMarketChanged = ourMarket !== Boolean(user.company_profile?.our_market);
    }
    setHasChanges(
      statusChanged || memberLevelChanged || verificationStatusChanged || showOnHomepageChanged || showOnPropertyDetailChanged || ourMarketChanged || profileImageDirty
    );
  }, [status, memberLevel, verificationStatus, showOnHomepage, showOnPropertyDetail, ourMarket, user, profileImageDirty]);

  const handleSubmit = async () => {
    if (!user || !hasChanges) return;

    const updateData: UpdateRegularUserData = {
      is_active: status,
      member_level: memberLevel as 'bronze' | 'silver' | 'gold' | 'platinum',
    };

    if (user.user_type === 'company') {
      updateData.verification_status = verificationStatus as 'pending' | 'approved';
      updateData.show_on_homepage = showOnHomepage;
      updateData.show_on_property_detail = showOnPropertyDetail;
      updateData.our_market = ourMarket;
    }

    if (profileImageDirty) {
      updateData.media_id = profileImage?.id ?? null;
    }

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

  const handleProfileImageUpload = (media: Media) => {
    setProfileImage(media);
    setProfileImageDirty(true);
  };

  const handleProfileImageDelete = (_mediaId: number) => {
    setProfileImage(null);
    setProfileImageDirty(true);
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

      <Grid container spacing={3} alignItems="stretch">
        {/* Profile photo */}
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <CardContent
              sx={{
                p: 3,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Profile photo
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <SingleImageUpload
                  uploadedImage={profileImage}
                  onImageUpload={handleProfileImageUpload}
                  onImageDelete={handleProfileImageDelete}
                  onUploadError={(msg) => showError(msg, true)}
                  dropzoneHeight={EDIT_PROFILE_PHOTO_UPLOAD_HEIGHTS.dropzoneHeight}
                  previewImageHeight={EDIT_PROFILE_PHOTO_UPLOAD_HEIGHTS.previewImageHeight}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Information */}
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                  User Information
                </Typography>
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
              </Box>
              
              <List
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
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
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Name"
                    secondary={user.name}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone Number"
                    secondary={user.phone || user.company_profile?.phone_number || 'N/A'}
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

                {user.user_type === 'company' && user.company_profile && (
                  <>
                    <Divider sx={{ my: 1, gridColumn: '1 / -1' }} />
                    <ListItem sx={{ gridColumn: '1 / -1' }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            Company Information
                          </Typography>
                        }
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company Name"
                        secondary={user.company_profile.company_name || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <StarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company Type"
                        secondary={user.company_profile.company_type_name || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company Phone"
                        secondary={user.company_profile.phone_number || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Location"
                        secondary={user.company_profile.location_en || user.company_profile.location_mm || 'N/A'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Business Address"
                        secondary={user.company_profile.address || 'N/A'}
                      />
                    </ListItem>

                    {user.company_profile.description && (
                      <ListItem sx={{ gridColumn: '1 / -1' }}>
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Description"
                          secondary={user.company_profile.description}
                        />
                      </ListItem>
                    )}
                  </>
                )}
                
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

        {/* Account Settings Edit Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Change the user's account status, member level, and company verification settings.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={user.user_type === 'company' ? 4 : 6}>
                <FormControl fullWidth>
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
              </Grid>

              <Grid item xs={12} md={user.user_type === 'company' ? 4 : 6}>
                <FormControl fullWidth>
                  <InputLabel>Member Level</InputLabel>
                  <Select
                    value={memberLevel}
                    label="Member Level"
                    onChange={(e) => handleMemberLevelChange(e.target.value)}
                  >
                    {MEMBER_LEVEL_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {user.user_type === 'company' && (
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Verification Status</InputLabel>
                    <Select
                      value={verificationStatus}
                      label="Verification Status"
                      onChange={(e) => handleVerificationStatusChange(e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {user.user_type === 'company' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Status / Options
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnHomepage}
                      onChange={(_, checked) => setShowOnHomepage(checked)}
                      disabled={verificationStatus !== 'approved'}
                    />
                  }
                  label="Show on homepage (partner logos)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnPropertyDetail}
                      onChange={(_, checked) => setShowOnPropertyDetail(checked)}
                      disabled={verificationStatus !== 'approved'}
                    />
                  }
                  label="Show on property detail (partner logos)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={ourMarket}
                      onChange={(_, checked) => setOurMarket(checked)}
                      disabled={verificationStatus !== 'approved'}
                    />
                  }
                  label="Are you Jade Market?"
                />
              </Box>
              {verificationStatus !== 'approved' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  Approve the company first to enable this and Jade Market.
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Actions Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            {hasChanges && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You have unsaved changes. Click "Save Changes" to apply the new settings.
              </Alert>
            )}

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Current Status: <StatusChip status={user.is_active ? 'active' : 'inactive'} />
                </Typography>
                {user.user_type === 'company' && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Current Verification Status: <StatusChip status={typeof user.verification_status === 'string' ? user.verification_status || 'pending' : 'pending'} statusType="verification_status" />
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  Current Member Level: <strong>{user.member_level}</strong>
                </Typography>
              </Box>
              
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