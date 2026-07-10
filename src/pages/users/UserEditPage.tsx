import React, { useMemo, useState } from 'react';
import {
  Box,
  TextField,
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
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Fingerprint as FingerprintIcon,
  Home as HomeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
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
import { useCompanyTypes } from '../../services/queries/companies';
import { useRegions, useTownships } from '../../services/queries/locations';
import { RegularUser, UpdateRegularUserData, getRegularUserDisplayName } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';
import { useAlertSystem } from '../../hooks';
import { MEMBER_LEVEL_OPTIONS, MemberLevel } from '../../constants/memberLevels';
import {
  DETAIL_ICON_SX,
  USER_EDIT_IMAGE_MIN_HEIGHT,
  optionalFieldLabel,
  requiredFieldLabel,
  USER_FORM_HINT,
  USER_EDIT_SUBMIT_TOUCH_FIELDS,
  getFirstYupFormError,
  buildTouchedFieldsForFormErrors,
  editUserValidationSchema,
} from './userPageShared';

const PAGE_CONFIG = {
  title: 'Edit User',
  description: 'Update user account details',
  backButtonPath: '/users',
} as const;

const EMPTY_FORM_VALUES = {
  name: '',
  email: '',
  user_type: 'individual' as 'individual' | 'company',
  member_level: 'silver' as MemberLevel,
  is_active: 'true' as string,
  company_name: '',
  company_type_id: '',
  address: '',
  region_id: '',
  township_id: '',
  description: '',
  verification_status: 'pending' as 'pending' | 'approved' | 'rejected',
  show_on_homepage: false,
  show_on_property_detail: false,
  our_market: false,
};

function buildEditInitialValues(user: RegularUser) {
  return {
    name: user.name,
    email: user.email || '',
    user_type: user.user_type,
    member_level: user.member_level,
    is_active: user.is_active ? 'true' : 'false',
    company_name: user.company_profile?.company_name || '',
    company_type_id: user.company_profile?.company_type_id?.toString() || '',
    address: user.company_profile?.address || '',
    region_id: user.company_profile?.region_id?.toString() || '',
    township_id: user.company_profile?.township_id?.toString() || '',
    description: user.company_profile?.description || '',
    verification_status: (user.verification_status || 'pending') as 'pending' | 'approved' | 'rejected',
    show_on_homepage: Boolean(user.company_profile?.show_on_homepage),
    show_on_property_detail: Boolean(user.company_profile?.show_on_property_detail),
    our_market: Boolean(user.company_profile?.our_market),
  };
}

function buildProfileMedia(user: RegularUser): Media | null {
  if (user.profile_media_id != null && user.profile_image_url) {
    return {
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
    };
  }
  return null;
}

function buildCoverMedia(user: RegularUser): Media | null {
  if (user.cover_image_url) {
    return {
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
    };
  }
  return null;
}

const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [profileImage, setProfileImage] = useState<Media | null>(null);
  const [profileImageDirty, setProfileImageDirty] = useState(false);
  const [coverImage, setCoverImage] = useState<Media | null>(null);
  const [coverImageDirty, setCoverImageDirty] = useState(false);
  const [imagesInitialized, setImagesInitialized] = useState(false);

  const { alert, showSuccess, showError } = useAlertSystem();

  const { data: userData, isLoading: loadingUser, error } = useUser(slug || '');
  const { data: companyTypesData, isLoading: loadingCompanyTypes } = useCompanyTypes();
  const { data: regionsData, isLoading: loadingRegions } = useRegions();
  const { data: townshipsData, isLoading: loadingTownships } = useTownships();
  const updateUserMutation = useUpdateUser();
  const clearBiometricMutation = useClearBiometricUser();

  const user = userData?.data?.user;

  React.useEffect(() => {
    if (!user || imagesInitialized) return;
    setProfileImage(buildProfileMedia(user));
    setCoverImage(buildCoverMedia(user));
    setProfileImageDirty(false);
    setCoverImageDirty(false);
    setImagesInitialized(true);
  }, [user, imagesInitialized]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: user ? buildEditInitialValues(user) : EMPTY_FORM_VALUES,
    validationSchema: editUserValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      if (!user || !slug) return;

      const updateData: UpdateRegularUserData = {
        name: values.name.trim(),
        member_level: values.member_level,
        is_active: values.is_active === 'true',
      };

      const trimmedEmail = values.email.trim();
      updateData.email = trimmedEmail || undefined;

      if (values.user_type === 'company') {
        updateData.company_name = values.company_name;
        updateData.company_type_id = Number(values.company_type_id);
        updateData.address = values.address;
        updateData.region_id = Number(values.region_id);
        updateData.township_id = Number(values.township_id);
        updateData.description = values.description || undefined;
        updateData.verification_status = values.verification_status;
        updateData.show_on_homepage = values.show_on_homepage;
        updateData.show_on_property_detail = values.show_on_property_detail;
        updateData.our_market = values.our_market;
      }

      if (profileImageDirty) {
        updateData.media_id = profileImage?.id ?? null;
      }

      if (coverImageDirty) {
        updateData.cover_media_id = coverImage?.id ? coverImage.id : null;
      }

      try {
        await updateUserMutation.mutateAsync({ slug, data: updateData });
        navigate(`/users/${slug}?success=${encodeURIComponent('User updated successfully!')}`);
      } catch (err: any) {
        if (err.errors) {
          Object.keys(err.errors).forEach((fieldName) => {
            formik.setFieldError(fieldName, err.errors[fieldName][0]);
          });
          showError(err.message || 'Please fix the errors below.', true);
        } else {
          showError(err?.message || 'Failed to update user. Please try again.', true);
        }
      }
    },
  });

  const filteredTownships = useMemo(
    () =>
      townshipsData?.data?.filter(
        (township) => township.region_id === Number(formik.values.region_id)
      ) || [],
    [townshipsData?.data, formik.values.region_id]
  );

  const hasChanges = formik.dirty || profileImageDirty || coverImageDirty;

  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);

  const handleVerificationStatusChange = (verificationStatus: 'pending' | 'approved' | 'rejected') => {
    formik.setFieldValue('verification_status', verificationStatus);
    if (verificationStatus !== 'approved') {
      formik.setFieldValue('show_on_homepage', false);
      formik.setFieldValue('show_on_property_detail', false);
      formik.setFieldValue('our_market', false);
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

  const handleSaveClick = async () => {
    const validationErrors = await formik.validateForm();
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      formik.setTouched({
        ...USER_EDIT_SUBMIT_TOUCH_FIELDS,
        ...buildTouchedFieldsForFormErrors(validationErrors as Record<string, unknown>),
      });
      showError(
        getFirstYupFormError(validationErrors as Record<string, unknown>)
          ?? 'Please fix the validation errors before saving.'
      );
      return;
    }
    formik.submitForm();
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

  const showFieldError = (field: keyof typeof formik.values) =>
    (formik.touched[field] || formik.submitCount > 0) && Boolean(formik.errors[field]);

  const fieldHelperText = (field: keyof typeof formik.values) =>
    (formik.touched[field] || formik.submitCount > 0) ? (formik.errors[field] as string | undefined) : undefined;

  const isLoading = loadingUser || loadingCompanyTypes || loadingRegions || loadingTownships;

  if (isLoading) {
    return <PageLoadingState title="Loading User Details" />;
  }

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

  const phoneDisplay = user.phone || user.company_profile?.phone_number || 'N/A';
  const isCompany = formik.values.user_type === 'company';

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <ActionAlert {...alert} />
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / User Management / Edit User"
        subtitle={`Update details for ${getRegularUserDisplayName(user)}`}
        actionButton={{
          text: 'Back to Users',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom alignSelf="flex-start" width="100%">
                  {optionalFieldLabel('Profile photo')}
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

          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {optionalFieldLabel('Cover photo')}
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

          <Grid item xs={12}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Typography variant="h6">User Information</Typography>
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {USER_FORM_HINT} Phone number and user type cannot be changed.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label={requiredFieldLabel(isCompany ? 'Account Name' : 'Full Name')}
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={showFieldError('name')}
                      helperText={fieldHelperText('name')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label={optionalFieldLabel('Email Address')}
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={showFieldError('email')}
                      helperText={fieldHelperText('email')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={phoneDisplay}
                      disabled
                      helperText="Phone number cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="User Type"
                      value={isCompany ? 'Company' : 'Individual'}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Created"
                      value={user.created_at ? formatDate(user.created_at) : 'N/A'}
                      disabled
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Account Settings</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Change the user's account status and member level.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={isCompany ? 4 : 6}>
                    <FormControl fullWidth error={showFieldError('member_level')}>
                      <InputLabel>{requiredFieldLabel('Member Level')}</InputLabel>
                      <Select
                        value={formik.values.member_level}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label={requiredFieldLabel('Member Level')}
                        name="member_level"
                      >
                        {MEMBER_LEVEL_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {showFieldError('member_level') && (
                        <FormHelperText error>{fieldHelperText('member_level')}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={isCompany ? 4 : 6}>
                    <FormControl fullWidth>
                      <InputLabel>{optionalFieldLabel('Account Status')}</InputLabel>
                      <Select
                        value={formik.values.is_active}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label={optionalFieldLabel('Account Status')}
                        name="is_active"
                      >
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {isCompany && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>{optionalFieldLabel('Verification Status')}</InputLabel>
                        <Select
                          value={formik.values.verification_status}
                          label={optionalFieldLabel('Verification Status')}
                          onChange={(e) => handleVerificationStatusChange(e.target.value as 'pending' | 'approved' | 'rejected')}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {isCompany && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Company Information</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="company_name"
                        name="company_name"
                        label={requiredFieldLabel('Company Name')}
                        value={formik.values.company_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={showFieldError('company_name')}
                        helperText={fieldHelperText('company_name')}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={companyTypesData?.data || []}
                        getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
                        value={companyTypesData?.data?.find((type) => type.id === Number(formik.values.company_type_id)) || null}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('company_type_id', newValue?.id ?? '');
                          formik.setFieldTouched('company_type_id', true, false);
                        }}
                        onBlur={() => formik.setFieldTouched('company_type_id', true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={requiredFieldLabel('Company Type')}
                            error={showFieldError('company_type_id')}
                            helperText={fieldHelperText('company_type_id')}
                          />
                        )}
                        filterOptions={(options, { inputValue }) => {
                          const searchTerm = inputValue.toLowerCase();
                          return options.filter(
                            (option) =>
                              option.name_en.toLowerCase().includes(searchTerm) ||
                              option.name_mm.toLowerCase().includes(searchTerm)
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={regionsData?.data || []}
                        getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
                        value={regionsData?.data?.find((region) => region.id === Number(formik.values.region_id)) || null}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('region_id', newValue?.id ?? '');
                          formik.setFieldValue('township_id', '');
                          formik.setFieldTouched('region_id', true, false);
                        }}
                        onBlur={() => formik.setFieldTouched('region_id', true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={requiredFieldLabel('Region')}
                            error={showFieldError('region_id')}
                            helperText={fieldHelperText('region_id')}
                          />
                        )}
                        filterOptions={(options, { inputValue }) => {
                          const searchTerm = inputValue.toLowerCase();
                          return options.filter(
                            (option) =>
                              option.name_en.toLowerCase().includes(searchTerm) ||
                              option.name_mm.toLowerCase().includes(searchTerm)
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={filteredTownships}
                        getOptionLabel={(option) => `${option.name_en} (${option.name_mm})`}
                        value={filteredTownships.find((township) => township.id === Number(formik.values.township_id)) || null}
                        onChange={(_, newValue) => {
                          formik.setFieldValue('township_id', newValue?.id ?? '');
                          formik.setFieldTouched('township_id', true, false);
                        }}
                        onBlur={() => formik.setFieldTouched('township_id', true)}
                        disabled={!formik.values.region_id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={requiredFieldLabel('Township')}
                            error={showFieldError('township_id')}
                            helperText={fieldHelperText('township_id')}
                          />
                        )}
                        filterOptions={(options, { inputValue }) => {
                          const searchTerm = inputValue.toLowerCase();
                          return options.filter(
                            (option) =>
                              option.name_en.toLowerCase().includes(searchTerm) ||
                              option.name_mm.toLowerCase().includes(searchTerm)
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="address"
                        name="address"
                        label={requiredFieldLabel('Business Address')}
                        multiline
                        rows={3}
                        value={formik.values.address}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={showFieldError('address')}
                        helperText={fieldHelperText('address')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="description"
                        name="description"
                        label={optionalFieldLabel('Company Description')}
                        multiline
                        rows={3}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={showFieldError('description')}
                        helperText={fieldHelperText('description')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {isCompany && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Status / Options</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.show_on_homepage}
                          onChange={(_, checked) => formik.setFieldValue('show_on_homepage', checked)}
                          disabled={formik.values.verification_status !== 'approved'}
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
                          checked={formik.values.show_on_property_detail}
                          onChange={(_, checked) => formik.setFieldValue('show_on_property_detail', checked)}
                          disabled={formik.values.verification_status !== 'approved'}
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
                          checked={formik.values.our_market}
                          onChange={(_, checked) => formik.setFieldValue('our_market', checked)}
                          disabled={formik.values.verification_status !== 'approved'}
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
                  {formik.values.verification_status !== 'approved' && (
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                      Approve the company first to enable homepage, property detail, and Jade Market options.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                {hasChanges && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
                  </Alert>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    pt: hasChanges ? 0 : 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Current Status: <StatusChip status={user.is_active ? 'active' : 'inactive'} />
                    </Typography>
                    {isCompany && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Current Verification Status:{' '}
                        <StatusChip
                          status={typeof user.verification_status === 'string' ? user.verification_status || 'pending' : 'pending'}
                          statusType="verification_status"
                        />
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      Current Member Level: <strong>{user.member_level}</strong>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={handleBack} startIcon={<CancelIcon />}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveClick}
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
      </form>
    </Box>
  );
};

export default UserEditPage;
