import React, { useState } from 'react';
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
  Grid,
  FormHelperText,
  Autocomplete,
  Card,
  CardContent,
  Switch,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { useCreateUser } from '../../services/queries/users';
import { useCompanyTypes } from '../../services/queries/companies';
import { useRegions, useTownships } from '../../services/queries/locations';
import { CreateRegularUserData } from '../../types/user';
import { useAlertSystem } from '../../hooks';
import { MEMBER_LEVEL_OPTIONS } from '../../constants/memberLevels';
import {
  DETAIL_ICON_SX,
  USER_EDIT_IMAGE_MIN_HEIGHT,
  optionalFieldLabel,
  requiredFieldLabel,
  USER_FORM_HINT,
  USER_CREATE_SUBMIT_TOUCH_FIELDS,
  getFirstYupFormError,
  buildTouchedFieldsForFormErrors,
  createUserValidationSchema,
} from './userPageShared';
import SingleImageUpload from '../../components/ui/SingleImageUpload';
import { Media } from '../../types/media';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Create User',
  description: 'Create a new individual or company user',
  backButtonPath: '/users',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError } = useAlertSystem();
  const [profileImage, setProfileImage] = useState<Media | null>(null);
  const [coverImage, setCoverImage] = useState<Media | null>(null);

  // Queries
  const { data: companyTypesData, isLoading: loadingCompanyTypes } = useCompanyTypes();
  const { data: regionsData, isLoading: loadingRegions } = useRegions();
  const { data: townshipsData, isLoading: loadingTownships } = useTownships();

  // Mutations
  const createUserMutation = useCreateUser();

  // Form state
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      user_type: 'individual' as 'individual' | 'company',
      member_level: 'silver' as 'bronze' | 'silver' | 'gold' | 'platinum',
      is_active: 'true' as string,
      // Company-specific fields
      company_name: '',
      company_type_id: '',
      address: '',
      region_id: '',
      township_id: '',
      description: '',
      verification_status: 'pending' as 'pending' | 'approved',
      show_on_homepage: false,
      show_on_property_detail: false,
      our_market: false,
    },
    validationSchema: createUserValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        const userData: CreateRegularUserData = {
          name: values.name,
          user_type: values.user_type,
          member_level: values.member_level,
          is_active: values.is_active === 'true',
          phone: values.phone,
        };

        const trimmedEmail = values.email.trim();
        if (trimmedEmail) {
          userData.email = trimmedEmail;
        }

        // Add company-specific fields if user type is company
        if (values.user_type === 'company') {
          userData.company_name = values.company_name;
          userData.company_type_id = Number(values.company_type_id);
          userData.address = values.address;
          userData.region_id = Number(values.region_id);
          userData.township_id = Number(values.township_id);
          userData.description = values.description;
          userData.verification_status = values.verification_status;
          userData.show_on_homepage = values.show_on_homepage;
          userData.show_on_property_detail = values.show_on_property_detail;
          userData.our_market = values.our_market;
        }

        if (profileImage) {
          userData.media_id = profileImage.id;
        }

        if (coverImage) {
          userData.cover_media_id = coverImage.id;
        }

        const response = await createUserMutation.mutateAsync(userData);
        
        showSuccess('User created successfully!');
        
        // Navigate to user detail page
        if (response.data?.data?.user?.slug) {
          navigate(`/users/${response.data.data.user.slug}`, {
            state: { 
              message: 'User created successfully!',
              trialPoints: response.data.data.trial_points 
            }
          });
        } else {
          navigate('/users');
        }
      } catch (error: any) {
        if (error.errors) {
          Object.keys(error.errors).forEach((fieldName) => {
            formik.setFieldError(fieldName, error.errors[fieldName][0]);
          });
          showError(error.message || 'Please fix the errors below.');
        } else {
          showError(error.message || 'Failed to create user');
        }
      }
    },
  });

  // Filter townships based on selected region
  const filteredTownships = townshipsData?.data?.filter(
    (township) => township.region_id === Number(formik.values.region_id)
  ) || [];

  // Loading state
  const isLoading = loadingCompanyTypes || loadingRegions || loadingTownships;

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);

  const handleUserTypeChange = (userType: 'individual' | 'company') => {
    formik.setFieldValue('user_type', userType);
    
    // Clear company fields when switching to individual
    if (userType === 'individual') {
      formik.setFieldValue('company_name', '');
      formik.setFieldValue('company_type_id', '');
      formik.setFieldValue('address', '');
      formik.setFieldValue('region_id', '');
      formik.setFieldValue('township_id', '');
      formik.setFieldValue('description', '');
      formik.setFieldValue('verification_status', 'pending');
      formik.setFieldValue('show_on_homepage', false);
      formik.setFieldValue('show_on_property_detail', false);
      formik.setFieldValue('our_market', false);
      formik.setErrors({
        ...formik.errors,
        company_name: undefined,
        company_type_id: undefined,
        address: undefined,
        region_id: undefined,
        township_id: undefined,
        description: undefined,
      });
    }
  };

  const handleVerificationStatusChange = (verificationStatus: 'pending' | 'approved') => {
    formik.setFieldValue('verification_status', verificationStatus);
    if (verificationStatus !== 'approved') {
      formik.setFieldValue('show_on_homepage', false);
      formik.setFieldValue('show_on_property_detail', false);
      formik.setFieldValue('our_market', false);
    }
  };

  const handleCreateClick = async () => {
    const validationErrors = await formik.validateForm();
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      formik.setTouched({
        ...USER_CREATE_SUBMIT_TOUCH_FIELDS,
        ...buildTouchedFieldsForFormErrors(validationErrors as Record<string, unknown>),
      });
      showError(
        getFirstYupFormError(validationErrors as Record<string, unknown>)
          ?? 'Please fix the validation errors before creating.'
      );
      return;
    }
    formik.submitForm();
  };

  const showFieldError = (field: keyof typeof formik.values) =>
    (formik.touched[field] || formik.submitCount > 0) && Boolean(formik.errors[field]);

  const fieldHelperText = (field: keyof typeof formik.values) =>
    (formik.touched[field] || formik.submitCount > 0) ? (formik.errors[field] as string | undefined) : undefined;

  if (isLoading) {
    return <PageLoadingState />;
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs="Dashboard / User Management / Create User"
        actionButton={{
          text: 'Back to Users',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <ActionAlert
        success={alert.success}
        error={alert.error}
        onClose={alert.onClose}
      />

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3} alignItems="flex-start" sx={{ mt: 0 }}>
          {/* Profile photo */}
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
                    onImageUpload={setProfileImage}
                    onImageDelete={() => setProfileImage(null)}
                    onUploadError={(msg) => showError(msg)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cover photo */}
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
                    onImageUpload={setCoverImage}
                    onImageDelete={() => setCoverImage(null)}
                    onUploadError={(msg) => showError(msg)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Information */}
          <Grid item xs={12}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {USER_FORM_HINT}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label={requiredFieldLabel('Full Name')}
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
                      id="phone"
                      name="phone"
                      label={requiredFieldLabel('Phone Number')}
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={showFieldError('phone')}
                      helperText={fieldHelperText('phone')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Set the user type, member level, and account status.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={formik.values.user_type === 'company' ? 4 : 6}>
                    <FormControl fullWidth error={showFieldError('user_type')}>
                      <InputLabel>{requiredFieldLabel('User Type')}</InputLabel>
                      <Select
                        name="user_type"
                        value={formik.values.user_type}
                        onChange={(e) => handleUserTypeChange(e.target.value as 'individual' | 'company')}
                        onBlur={formik.handleBlur}
                        label={requiredFieldLabel('User Type')}
                      >
                        <MenuItem value="individual">Individual User</MenuItem>
                        <MenuItem value="company">Company User</MenuItem>
                      </Select>
                      {showFieldError('user_type') && (
                        <FormHelperText error>{fieldHelperText('user_type')}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={formik.values.user_type === 'company' ? 4 : 6}>
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
                  <Grid item xs={12} md={formik.values.user_type === 'company' ? 4 : 6}>
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
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Company Information */}
          {formik.values.user_type === 'company' && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
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
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>{optionalFieldLabel('Verification Status')}</InputLabel>
                        <Select
                          value={formik.values.verification_status}
                          label={optionalFieldLabel('Verification Status')}
                          onChange={(e) => handleVerificationStatusChange(e.target.value as 'pending' | 'approved')}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Status / Options (company only) */}
          {formik.values.user_type === 'company' && (
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
                      Approve the company first to enable partner logo display and Jade Market.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Button variant="outlined" onClick={handleBack} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={createUserMutation.isPending}
                    onClick={handleCreateClick}
                  >
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default UserCreatePage; 