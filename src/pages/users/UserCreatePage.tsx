import React, { useState } from 'react';
import {
  Box,
  Paper,
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
  Divider,
  Autocomplete,
  Card,
  CardContent,
  Switch,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { useCreateUser } from '../../services/queries/users';
import { useCompanyTypes } from '../../services/queries/companies';
import { useRegions, useTownships } from '../../services/queries/locations';
import { CreateRegularUserData } from '../../types/user';
import { useAlertSystem } from '../../hooks';
import { MEMBER_LEVEL_OPTIONS } from '../../constants/memberLevels';
import { USER_PROFILE_PHOTO_UPLOAD_HEIGHTS } from '../../constants/profilePhotoUpload';
import SingleImageUpload from '../../components/ui/SingleImageUpload';
import { Media } from '../../types/media';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const createUserSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  user_type: Yup.string()
    .required('User type is required')
    .oneOf(['individual', 'company'], 'Invalid user type'),
  member_level: Yup.string()
    .required('Member level is required')
    .oneOf(['bronze', 'silver', 'gold', 'platinum'], 'Invalid member level'),
  is_active: Yup.boolean(),
  // Company-specific fields
  company_name: Yup.string().when('user_type', {
    is: 'company',
    then: (schema) => schema.required('Company name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  company_type_id: Yup.number().when('user_type', {
    is: 'company',
    then: (schema) => schema.required('Company type is required'),
    otherwise: (schema) => schema.optional(),
  }),
  
  phone: Yup.string()
  .required('Phone number is required'),
  
  address: Yup.string().when('user_type', {
    is: 'company',
    then: (schema) => schema.required('Address is required'),
    otherwise: (schema) => schema.optional(),
  }),
  region_id: Yup.number().when('user_type', {
    is: 'company',
    then: (schema) => schema.required('Region is required'),
    otherwise: (schema) => schema.optional(),
  }),
  township_id: Yup.number().when('user_type', {
    is: 'company',
    then: (schema) => schema.required('Township is required'),
    otherwise: (schema) => schema.optional(),
  }),
  description: Yup.string().optional(),
});

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
      password: '',
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
    validationSchema: createUserSchema,
    onSubmit: async (values) => {
      try {
        const userData: CreateRegularUserData = {
          name: values.name,
          email: values.email,
          password: values.password,
          user_type: values.user_type,
          member_level: values.member_level,
          is_active: values.is_active === 'true',
          phone: values.phone,
        };

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

  if (isLoading) {
    return <PageLoadingState />;
  }

  return (
    <Box>
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

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3} alignItems="stretch">
            {/* Left: account fields (same md split as user edit: 8 / 4) */}
            <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
              <Grid container spacing={3} sx={{ width: '100%' }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name *"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address *"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number *"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password *"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>User Type *</InputLabel>
                    <Select
                      value={formik.values.user_type}
                      onChange={(e) => handleUserTypeChange(e.target.value as 'individual' | 'company')}
                      onBlur={formik.handleBlur}
                      error={formik.touched.user_type && Boolean(formik.errors.user_type)}
                      label="User Type *"
                    >
                      <MenuItem value="individual">Individual User</MenuItem>
                      <MenuItem value="company">Company User</MenuItem>
                    </Select>
                    {formik.touched.user_type && formik.errors.user_type && (
                      <FormHelperText error>{formik.errors.user_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Member Level *</InputLabel>
                    <Select
                      value={formik.values.member_level}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.member_level && Boolean(formik.errors.member_level)}
                      label="Member Level *"
                      name="member_level"
                    >
                      {MEMBER_LEVEL_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.member_level && formik.errors.member_level && (
                      <FormHelperText error>{formik.errors.member_level}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formik.values.is_active}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Status"
                      name="is_active"
                    >
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Right: profile photo */}
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Profile photo
                  </Typography>
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <SingleImageUpload
                      uploadedImage={profileImage}
                      onImageUpload={setProfileImage}
                      onImageDelete={() => {
                        setProfileImage(null);
                      }}
                      onUploadError={(msg) => showError(msg)}
                      dropzoneHeight={USER_PROFILE_PHOTO_UPLOAD_HEIGHTS.dropzoneHeight}
                      previewImageHeight={USER_PROFILE_PHOTO_UPLOAD_HEIGHTS.previewImageHeight}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Company Information - Only show for company users */}
            {formik.values.user_type === 'company' && (
              <>
            <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Company Information
                </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="company_name"
                    name="company_name"
                    label="Company Name *"
                    value={formik.values.company_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                    helperText={formik.touched.company_name && formik.errors.company_name}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={companyTypesData?.data || []}
                    getOptionLabel={(option) => 
                      `${option.name_en} (${option.name_mm})`
                    }
                    value={companyTypesData?.data?.find(type => type.id === Number(formik.values.company_type_id)) || null}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('company_type_id', newValue?.id || 0);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Company Type *"
                        error={formik.touched.company_type_id && Boolean(formik.errors.company_type_id)}
                        helperText={formik.touched.company_type_id && formik.errors.company_type_id}
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const searchTerm = inputValue.toLowerCase();
                      return options.filter((option) =>
                        option.name_en.toLowerCase().includes(searchTerm) ||
                        option.name_mm.toLowerCase().includes(searchTerm)
                      );
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={regionsData?.data || []}
                    getOptionLabel={(option) => 
                      `${option.name_en} (${option.name_mm})`
                    }
                    value={regionsData?.data?.find(region => region.id === Number(formik.values.region_id)) || null}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('region_id', newValue?.id || 0);
                      formik.setFieldValue('township_id', 0); // Reset township when region changes
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Region *"
                        error={formik.touched.region_id && Boolean(formik.errors.region_id)}
                        helperText={formik.touched.region_id && formik.errors.region_id}
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const searchTerm = inputValue.toLowerCase();
                      return options.filter((option) =>
                        option.name_en.toLowerCase().includes(searchTerm) ||
                        option.name_mm.toLowerCase().includes(searchTerm)
                      );
                    }}
                  />
          </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={filteredTownships}
                    getOptionLabel={(option) => 
                      `${option.name_en} (${option.name_mm})`
                    }
                    value={filteredTownships.find(township => township.id === Number(formik.values.township_id)) || null}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('township_id', newValue?.id || 0);
                    }}
                    disabled={!formik.values.region_id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Township *"
                        error={formik.touched.township_id && Boolean(formik.errors.township_id)}
                        helperText={formik.touched.township_id && formik.errors.township_id}
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const searchTerm = inputValue.toLowerCase();
                      return options.filter((option) =>
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
                    label="Business Address *"
                    multiline
                    rows={3}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                    id="description"
                    name="description"
                    label="Company Description (Optional)"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Verification Status</InputLabel>
                <Select
                  value={formik.values.verification_status}
                  label="Verification Status"
                  onChange={(e) => handleVerificationStatusChange(e.target.value as 'pending' | 'approved')}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Partner Logo Display
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.show_on_homepage}
                    onChange={(_, checked) => formik.setFieldValue('show_on_homepage', checked)}
                    disabled={formik.values.verification_status !== 'approved'}
                  />
                }
                label="Show on homepage (partner logos)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.show_on_property_detail}
                    onChange={(_, checked) => formik.setFieldValue('show_on_property_detail', checked)}
                    disabled={formik.values.verification_status !== 'approved'}
                  />
                }
                label="Show on property detail (partner logos)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.our_market}
                    onChange={(_, checked) => formik.setFieldValue('our_market', checked)}
                    disabled={formik.values.verification_status !== 'approved'}
                  />
                }
                label="Are you Jade Market?"
              />
              {formik.values.verification_status !== 'approved' && (
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  Approve the company first to enable partner logo display and Jade Market.
                </Typography>
              )}
            </Grid>
              </>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
                  variant="outlined"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
                  Cancel
          </Button>
              <Button
                  type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                  disabled={createUserMutation.isPending || !formik.isValid}
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
          </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UserCreatePage; 