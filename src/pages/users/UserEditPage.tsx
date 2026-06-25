import React, { useState } from 'react';
import {
  Box,
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
  Home as HomeIcon,
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
import { UpdateRegularUserData, getRegularUserDisplayName } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';
import { useAlertSystem } from '../../hooks';
import { MEMBER_LEVEL_OPTIONS } from '../../constants/memberLevels';
import { DETAIL_ICON_SX, detailListSx, USER_EDIT_IMAGE_MIN_HEIGHT } from './userPageShared';

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
  const [memberLevel, setMemberLevel] = useState<string>('silver');
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [showOnPropertyDetail, setShowOnPropertyDetail] = useState(false);
  const [ourMarket, setOurMarket] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [profileImage, setProfileImage] = useState<Media | null>(null);
  const [profileImageDirty, setProfileImageDirty] = useState(false);
  const [coverImage, setCoverImage] = useState<Media | null>(null);
  const [coverImageDirty, setCoverImageDirty] = useState(false);

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
      setCoverImageDirty(false);
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
      if (user.cover_image_url) {
        setCoverImage({
          id: 0,
          type: 'image',
          filename: 'cover',
          size: 0,
          formatted_size: '',
          mime_type: 'image/jpeg',
          is_primary: false,
          status: 'completed',
          url: user.cover_image_url,
          created_at: new Date().toISOString(),
        });
      } else {
        setCoverImage(null);
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
      statusChanged || memberLevelChanged || verificationStatusChanged || showOnHomepageChanged || showOnPropertyDetailChanged || ourMarketChanged || profileImageDirty || coverImageDirty
    );
  }, [status, memberLevel, verificationStatus, showOnHomepage, showOnPropertyDetail, ourMarket, user, profileImageDirty, coverImageDirty]);

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

    if (coverImageDirty) {
      updateData.cover_media_id = coverImage?.id ? coverImage.id : null;
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

  const handleCoverImageUpload = (media: Media) => {
    setCoverImage(media);
    setCoverImageDirty(true);
  };

  const handleCoverImageDelete = (_mediaId: number) => {
    setCoverImage(null);
    setCoverImageDirty(true);
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
        subtitle={`Update status for ${getRegularUserDisplayName(user)}`}
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
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <SingleImageUpload
                  fillContainer
                  compact
                  uploadedImage={profileImage}
                  onImageUpload={handleProfileImageUpload}
                  onImageDelete={handleProfileImageDelete}
                  onUploadError={(msg) => showError(msg, true)}
                />
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
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <SingleImageUpload
                  fillContainer
                  compact
                  uploadedImage={coverImage}
                  onImageUpload={handleCoverImageUpload}
                  onImageDelete={handleCoverImageDelete}
                  onUploadError={(msg) => showError(msg, true)}
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

        {/* Account Settings Edit Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
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
            </CardContent>
          </Card>
        </Grid>

        {user.user_type === 'company' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
              <Typography variant="h6" gutterBottom>
                Status / Options
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnHomepage}
                      onChange={(_, checked) => setShowOnHomepage(checked)}
                      disabled={verificationStatus !== 'approved'}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon sx={{ ...DETAIL_ICON_SX.home, fontSize: 20 }} />
                      Show on homepage (partner logos)
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnPropertyDetail}
                      onChange={(_, checked) => setShowOnPropertyDetail(checked)}
                      disabled={verificationStatus !== 'approved'}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon sx={{ ...DETAIL_ICON_SX.home, fontSize: 20 }} />
                      Show on property detail (partner logos)
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={ourMarket}
                      onChange={(_, checked) => setOurMarket(checked)}
                      disabled={verificationStatus !== 'approved'}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ ...DETAIL_ICON_SX.star, fontSize: 20 }} />
                      Are you Jade Market?
                    </Box>
                  }
                />
              </Box>
              {verificationStatus !== 'approved' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  Approve the company first to enable this and Jade Market.
                </Typography>
              )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Actions Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserEditPage; 