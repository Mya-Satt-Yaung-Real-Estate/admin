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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Fingerprint as FingerprintIcon,
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
import { USER_PROFILE_PHOTO_UPLOAD_HEIGHTS } from '../../constants/profilePhotoUpload';

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
    if (user.user_type === 'company') {
      verificationStatusChanged = verificationStatus !== (typeof user.verification_status === 'string' ? user.verification_status || 'pending' : 'pending');
      showOnHomepageChanged = showOnHomepage !== Boolean(user.company_profile?.show_on_homepage);
    }
    setHasChanges(
      statusChanged || memberLevelChanged || verificationStatusChanged || showOnHomepageChanged || profileImageDirty
    );
  }, [status, memberLevel, verificationStatus, showOnHomepage, user, profileImageDirty]);

  const handleSubmit = async () => {
    if (!user || !hasChanges) return;

    const updateData: UpdateRegularUserData = {
      is_active: status,
      member_level: memberLevel as 'bronze' | 'silver' | 'gold' | 'platinum',
    };

    if (user.user_type === 'company') {
      updateData.verification_status = verificationStatus as 'pending' | 'approved';
      updateData.show_on_homepage = showOnHomepage;
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
                  dropzoneHeight={USER_PROFILE_PHOTO_UPLOAD_HEIGHTS.dropzoneHeight}
                  previewImageHeight={USER_PROFILE_PHOTO_UPLOAD_HEIGHTS.previewImageHeight}
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

                {user.user_type === 'individual' && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={user.phone}
                    />
                  </ListItem>
                )}
                
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
          </Paper>
        </Grid>

        {/* Member Level Edit Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Member Level
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Change the user's member level. Member levels determine the user's privileges 
              and benefits within the platform.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ maxWidth: 300 }}>
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
            </Box>
          </Paper>
        </Grid>

        {/* Verification Status Edit Section */}
        {user.user_type === 'company' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Verification Status
              </Typography>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Change the user's verification status. Approved users may have access to additional features.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ maxWidth: 300 }}>
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
              </Box>

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
              {verificationStatus !== 'approved' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  Approve the company first to enable this.
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