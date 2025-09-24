import React from 'react';
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
  FormHelperText,
  Divider,
  Autocomplete,
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
  phone: Yup.string().when('user_type', {
    is: 'company',
    then: (schema) => schema.required('Phone number is required'),
    otherwise: (schema) => schema.optional(),
  }),
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
      user_type: 'individual' as 'individual' | 'company',
      member_level: 'silver' as 'bronze' | 'silver' | 'gold' | 'platinum',
      is_active: 'true' as string,
      // Company-specific fields
      company_name: '',
      company_type_id: '',
    phone: '',
      address: '',
      region_id: '',
      township_id: '',
      description: '',
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
        };

        // Add company-specific fields if user type is company
        if (values.user_type === 'company') {
          userData.company_name = values.company_name;
          userData.company_type_id = Number(values.company_type_id);
          userData.phone = values.phone;
          userData.address = values.address;
          userData.region_id = Number(values.region_id);
          userData.township_id = Number(values.township_id);
          userData.description = values.description;
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
        showError(error.message || 'Failed to create user');
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
      formik.setFieldValue('phone', '');
      formik.setFieldValue('address', '');
      formik.setFieldValue('region_id', '');
      formik.setFieldValue('township_id', '');
      formik.setFieldValue('description', '');
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
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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