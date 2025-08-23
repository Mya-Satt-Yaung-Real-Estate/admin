import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert, MediaUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateProperty } from '../../services/queries/properties';
import { useUsers } from '../../services/queries/users';
import { usePropertyTypes, usePropertyListingTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import { CreatePropertyData } from '../../types/property';
import { RegularUser } from '../../types/user';
import { Media } from '../../types/media';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  // Dual-mode fields
  is_platform_property: Yup.boolean().required(),
  user_id: Yup.number().when('is_platform_property', {
    is: false,
    then: (schema) => schema.required('User is required for user properties'),
    otherwise: (schema) => schema.optional(),
  }),

  // Basic property information
  property_type_id: Yup.number().required('Property type is required'),
  listing_type_id: Yup.number().required('Listing type is required'),
  title_en: Yup.string().required('English title is required').max(255, 'Title must be 255 characters or less'),
  title_mm: Yup.string().required('Myanmar title is required').max(255, 'Title must be 255 characters or less'),
  description: Yup.string().required('Description is required').max(5000, 'Description must be 5000 characters or less'),
  property_condition: Yup.string().oneOf(['new', 'good', 'fair', 'poor'], 'Invalid property condition').required('Property condition is required'),

  // Location information
  region_id: Yup.number().required('Region is required'),
  township_id: Yup.number().required('Township is required'),
  address: Yup.string().required('Address is required').max(500, 'Address must be 500 characters or less'),
  latitude: Yup.number().min(-90).max(90).optional(),
  longitude: Yup.number().min(-180).max(180).optional(),

  // Property details
  price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
  area_sqft: Yup.number().min(0, 'Area must be positive').required('Area is required'),
  bedrooms: Yup.number().min(0, 'Bedrooms must be positive').optional(),
  bathrooms: Yup.number().min(0, 'Bathrooms must be positive').optional(),
  bank_installment_available: Yup.boolean().optional(),

  // Contact information
  owner_name: Yup.string().required('Owner name is required').max(255, 'Owner name must be 255 characters or less'),
  phone_numbers: Yup.array().of(Yup.string()).min(1, 'At least one phone number is required').required('Phone numbers are required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),

  // Status and settings
  status: Yup.string().oneOf(['draft', 'published', 'sold', 'rented'], 'Invalid status').default('draft'),
  is_featured: Yup.boolean().default(false),
  is_verified: Yup.boolean().default(false),
});

// ============================================================================
// CONSTANTS
// ============================================================================

const PROPERTY_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const PROPERTY_FEATURES = [
  'garden',
  'parking',
  'security',
  'swimming_pool',
  'gym',
  'furnished',
  'air_conditioning',
  'balcony',
  'elevator',
  'backup_power',
  'internet',
  'cable_tv',
  'water_heater',
  'kitchen',
  'laundry',
];

// ============================================================================
// COMPONENT
// ============================================================================

const PropertyCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();

  // API Queries
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: propertyTypes, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: listingTypes, isLoading: listingTypesLoading } = usePropertyListingTypes();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();

  // Create Property Mutation
  const createPropertyMutation = useCreateProperty();

  // Formik Form
  const formik = useFormik({
    initialValues: {
      is_platform_property: true,
      user_id: undefined as number | undefined,
      property_type_id: 0,
      listing_type_id: 0,
      title_en: '',
      title_mm: '',
      description: '',
      property_condition: 'new' as const,
      region_id: 0,
      township_id: 0,
      address: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      price: 0,
      area_sqft: 0,
      bedrooms: undefined as number | undefined,
      bathrooms: undefined as number | undefined,
      bank_installment_available: false,
      owner_name: '',
      phone_numbers: [''],
      email: '',
      status: 'draft' as const,
      is_featured: false,
      is_verified: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const propertyData: CreatePropertyData = {
          ...values,
          features: selectedFeatures,
          phone_numbers: phoneNumbers.filter(phone => phone.trim() !== ''),
          media_ids: uploadedMedia.map(media => media.id),
        };

        const response = await createPropertyMutation.mutateAsync(propertyData);
        // Navigate to property detail page with success message (consistent with other create pages)
        const propertyId = response.data?.id;
        if (propertyId) {
          navigate(`/properties/${propertyId}?success=${encodeURIComponent('Property created successfully!')}`);
        } else {
          navigate('/properties');
        }
      } catch (error: any) {
        console.error('Error creating property:', error);
        showError(error.message || 'Failed to create property. Please try again.');
      }
    },
  });

  // Handle phone number changes
  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhoneNumbers);
    }
  };

  // Handle feature selection
  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Handle media upload
  const handleMediaUpload = (media: Media) => {
    setUploadedMedia(prev => [...prev, media]);
  };

  // Handle media delete
  const handleMediaDelete = (mediaId: number) => {
    setUploadedMedia(prev => prev.filter(media => media.id !== mediaId));
  };

  // Filter townships based on selected region
  const filteredTownships = townships?.data?.filter(township => 
    township.region_id === formik.values.region_id
  ) || [];

  // Loading state
  if (usersLoading || propertyTypesLoading || listingTypesLoading || regionsLoading || townshipsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Create Property"
        subtitle="Add a new property to the system"
        breadcrumbs="Dashboard / Properties / Create Property"
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Create Error Alert */}
      {createPropertyMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: createPropertyMutation.error?.message || 'Failed to create property'
          }}
          sx={{ mb: 2 }}
          onClose={() => createPropertyMutation.reset()}
        />
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Property Mode Selection */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Mode
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.is_platform_property}
                          onChange={(e) => {
                            formik.setFieldValue('is_platform_property', e.target.checked);
                            if (e.target.checked) {
                              formik.setFieldValue('user_id', undefined);
                            }
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon />
                          <Typography>Platform Property</Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!formik.values.is_platform_property}
                          onChange={(e) => {
                            formik.setFieldValue('is_platform_property', !e.target.checked);
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon />
                          <Typography>User Property</Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>

                {!formik.values.is_platform_property && (
                  <Box sx={{ mt: 2 }}>
                    <Autocomplete
                      size="small"
                      options={users?.data || []}
                      getOptionLabel={(option: RegularUser) => 
                        `${option.name} (${option.email}) - ${option.user_type}`
                      }
                      value={users?.data?.find((user: RegularUser) => user.id === formik.values.user_id) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('user_id', newValue?.id || undefined);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select User"
                          error={formik.touched.user_id && Boolean(formik.errors.user_id)}
                          helperText={formik.touched.user_id && formik.errors.user_id}
                        />
                      )}
                      filterOptions={(options, { inputValue }) => {
                        const searchTerm = inputValue.toLowerCase();
                        return options.filter((option) =>
                          option.name.toLowerCase().includes(searchTerm) ||
                          option.email.toLowerCase().includes(searchTerm) ||
                          option.user_type.toLowerCase().includes(searchTerm)
                        );
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      size="small"
                      options={propertyTypes?.data || []}
                      getOptionLabel={(option) => 
                        `${option.name_en} (${option.name_mm})`
                      }
                      value={propertyTypes?.data?.find(type => type.id === formik.values.property_type_id) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('property_type_id', newValue?.id || 0);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Property Type"
                          error={formik.touched.property_type_id && Boolean(formik.errors.property_type_id)}
                          helperText={formik.touched.property_type_id && formik.errors.property_type_id}
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

                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      size="small"
                      options={listingTypes?.data || []}
                      getOptionLabel={(option) => 
                        `${option.name_en} (${option.name_mm})`
                      }
                      value={listingTypes?.data?.find(type => type.id === formik.values.listing_type_id) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('listing_type_id', newValue?.id || 0);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Listing Type"
                          error={formik.touched.listing_type_id && Boolean(formik.errors.listing_type_id)}
                          helperText={formik.touched.listing_type_id && formik.errors.listing_type_id}
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
                      size="small"
                      name="title_en"
                      label="Title (English)"
                      value={formik.values.title_en}
                      onChange={formik.handleChange}
                      error={formik.touched.title_en && Boolean(formik.errors.title_en)}
                      helperText={formik.touched.title_en && formik.errors.title_en}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      name="title_mm"
                      label="Title (Myanmar)"
                      value={formik.values.title_mm}
                      onChange={formik.handleChange}
                      error={formik.touched.title_mm && Boolean(formik.errors.title_mm)}
                      helperText={formik.touched.title_mm && formik.errors.title_mm}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={3}
                      name="description"
                      label="Description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel size="small">Property Condition</InputLabel>
                      <Select
                        name="property_condition"
                        label="Property Condition"
                        size="small"
                        value={formik.values.property_condition}
                        onChange={formik.handleChange}
                        error={formik.touched.property_condition && Boolean(formik.errors.property_condition)}
                      >
                        {PROPERTY_CONDITIONS.map((condition) => (
                          <MenuItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.property_condition && formik.errors.property_condition && (
                        <FormHelperText error>{formik.errors.property_condition}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      size="small"
                      options={regions?.data || []}
                      getOptionLabel={(option) => 
                        `${option.name_en} (${option.name_mm})`
                      }
                      value={regions?.data?.find(region => region.id === formik.values.region_id) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('region_id', newValue?.id || 0);
                        formik.setFieldValue('township_id', 0); // Reset township when region changes
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Region"
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

                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      size="small"
                      options={filteredTownships}
                      getOptionLabel={(option) => 
                        `${option.name_en} (${option.name_mm})`
                      }
                      value={filteredTownships.find(township => township.id === formik.values.township_id) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('township_id', newValue?.id || 0);
                      }}
                      disabled={!formik.values.region_id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Township"
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
                      size="small"
                      name="address"
                      label="Address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="latitude"
                      label="Latitude"
                      type="number"
                      value={formik.values.latitude || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                      helperText={formik.touched.latitude && formik.errors.latitude}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="longitude"
                      label="Longitude"
                      type="number"
                      value={formik.values.longitude || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                      helperText={formik.touched.longitude && formik.errors.longitude}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="price"
                      label="Price"
                      type="number"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      error={formik.touched.price && Boolean(formik.errors.price)}
                      helperText={formik.touched.price && formik.errors.price}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">MMK</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="area_sqft"
                      label="Area (sq ft)"
                      type="number"
                      value={formik.values.area_sqft}
                      onChange={formik.handleChange}
                      error={formik.touched.area_sqft && Boolean(formik.errors.area_sqft)}
                      helperText={formik.touched.area_sqft && formik.errors.area_sqft}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="bedrooms"
                      label="Bedrooms"
                      type="number"
                      value={formik.values.bedrooms || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.bedrooms && Boolean(formik.errors.bedrooms)}
                      helperText={formik.touched.bedrooms && formik.errors.bedrooms}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="bathrooms"
                      label="Bathrooms"
                      type="number"
                      value={formik.values.bathrooms || ''}
                      onChange={formik.handleChange}
                      error={formik.touched.bathrooms && Boolean(formik.errors.bathrooms)}
                      helperText={formik.touched.bathrooms && formik.errors.bathrooms}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="bank_installment_available"
                          checked={formik.values.bank_installment_available}
                          onChange={formik.handleChange}
                        />
                      }
                      label="Bank Installment Available"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Features */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Features
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {PROPERTY_FEATURES.map((feature) => (
                    <Chip
                      key={feature}
                      label={feature.replace('_', ' ').toUpperCase()}
                      onClick={() => handleFeatureToggle(feature)}
                      color={selectedFeatures.includes(feature) ? 'primary' : 'default'}
                      variant={selectedFeatures.includes(feature) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <MediaUpload
                  uploadedMedia={uploadedMedia}
                  onMediaUpload={handleMediaUpload}
                  onMediaDelete={handleMediaDelete}
                  maxFiles={10}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      name="owner_name"
                      label="Owner Name"
                      value={formik.values.owner_name}
                      onChange={formik.handleChange}
                      error={formik.touched.owner_name && Boolean(formik.errors.owner_name)}
                      helperText={formik.touched.owner_name && formik.errors.owner_name}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Phone Numbers
                    </Typography>
                    {phoneNumbers.map((phone, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={phone}
                          onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                          placeholder="Phone number"
                        />
                        {phoneNumbers.length > 1 && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removePhoneNumber(index)}
                            startIcon={<DeleteIcon />}
                          >
                            Remove
                          </Button>
                        )}
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      onClick={addPhoneNumber}
                      startIcon={<AddIcon />}
                    >
                      Add Phone Number
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      name="email"
                      label="Email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Status and Settings */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status & Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel size="small">Status</InputLabel>
                      <Select
                        name="status"
                        label="Status"
                        size="small"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="sold">Sold</MenuItem>
                        <MenuItem value="rented">Rented</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="is_featured"
                          checked={formik.values.is_featured}
                          onChange={formik.handleChange}
                        />
                      }
                      label="Featured Property"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="is_verified"
                          checked={formik.values.is_verified}
                          onChange={formik.handleChange}
                        />
                      }
                      label="Verified Property"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Point System Information */}
            {!formik.values.is_platform_property && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Point System
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Alert severity="info">
                    <Typography variant="body2">
                      Creating a property on behalf of a user will deduct 10 points from their account when the property is published.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    startIcon={createPropertyMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={createPropertyMutation.isPending}
                  >
                    {createPropertyMutation.isPending ? 'Creating...' : 'Create Property'}
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/properties')}
                    disabled={createPropertyMutation.isPending}
                  >
                    Cancel
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

export default PropertyCreatePage;
