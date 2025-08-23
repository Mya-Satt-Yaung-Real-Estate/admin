import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  Autocomplete,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogContent,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  PlayArrow as PlayIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@tanstack/react-query';

import PageHeader from '../../components/layout/PageHeader';
import ActionAlert from '../../components/ui/ActionAlert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MediaUpload from '../../components/ui/MediaUpload';
import { propertiesAPI } from '../../services/api/properties';
import { usersAPI } from '../../services/api/users';
import { locationsAPI } from '../../services/api/locations';
import { useProperty, useUpdateProperty } from '../../services/queries/properties';
import { useAlertSystem } from '../../hooks/useAlertSystem';
import { CreatePropertyData } from '../../types/property';
import { Media } from '../../types/media';
import { RegularUser } from '../../types/user';

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

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const theme = useTheme();
  
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [existingMedia, setExistingMedia] = useState<Media[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  
  // Media viewer state
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoViewerOpen, setVideoViewerOpen] = useState(false);

  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useProperty(Number(id));

  // Fetch users for dropdown
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.getUsers,
  });

  // Fetch property types
  const { data: propertyTypesResponse } = useQuery({
    queryKey: ['property-types'],
    queryFn: propertiesAPI.getPropertyTypes,
  });

  // Fetch listing types
  const { data: listingTypesResponse } = useQuery({
    queryKey: ['listing-types'],
    queryFn: propertiesAPI.getPropertyListingTypes,
  });

  // Fetch regions
  const { data: regionsResponse } = useQuery({
    queryKey: ['regions'],
    queryFn: locationsAPI.getRegions,
  });

  // Fetch townships
  const { data: townshipsResponse } = useQuery({
    queryKey: ['townships'],
    queryFn: locationsAPI.getTownships,
  });

  // Update property mutation
  const updatePropertyMutation = useUpdateProperty();

  // Initialize existing media when property loads
  useEffect(() => {
    if (property?.data?.media) {
      const allMedia: Media[] = [];
      
      // Add images
      if (property.data.media.images) {
        property.data.media.images.forEach(img => {
          allMedia.push({
            id: img.id,
            filename: img.filename,
            url: img.url,
            type: 'image',
            size: 0, // Default value
            formatted_size: '0 B',
            mime_type: 'image/jpeg',
            is_primary: img.is_primary,
            status: 'completed',
            created_at: new Date().toISOString()
          });
        });
      }
      
      // Add videos
      if (property.data.media.videos) {
        property.data.media.videos.forEach(video => {
          allMedia.push({
            id: video.id,
            filename: video.filename,
            url: video.url,
            type: 'video',
            size: 0, // Default value
            formatted_size: '0 B',
            mime_type: 'video/mp4',
            is_primary: null,
            status: 'completed',
            created_at: new Date().toISOString()
          });
        });
      }
      
      setExistingMedia(allMedia);
    }
  }, [property]);

  // Initialize phone numbers and features when property loads
  useEffect(() => {
    if (property?.data) {
      // Initialize phone numbers
      if (property.data.contact_info?.phone_numbers && property.data.contact_info.phone_numbers.length > 0) {
        setPhoneNumbers(property.data.contact_info.phone_numbers);
      } else {
        setPhoneNumbers(['']);
      }

      // Initialize features
      if (property.data.features && property.data.features.length > 0) {
        setSelectedFeatures(property.data.features);
      } else {
        setSelectedFeatures([]);
      }
    }
  }, [property?.data]);

  if (isLoadingProperty) {
    return <LoadingSpinner />;
  }

  if (!property?.data) {
    return <ActionAlert error={{ show: true, message: "Property not found" }} />;
  }

  const propertyData = property.data;
  const users = usersResponse?.data || [];
  const propertyTypes = propertyTypesResponse?.data || [];
  const listingTypes = listingTypesResponse?.data || [];
  const regions = regionsResponse?.data || [];
  const townships = townshipsResponse?.data || [];

  // Filter townships based on selected region (will be used inside Formik)
  const getFilteredTownships = (selectedRegionId: number) => {
    return townships.filter((township) => township.region_id === selectedRegionId);
  };

  const initialValues = {
    // Dual-mode fields
    is_platform_property: propertyData.property_mode === 'platform', // Use the property_mode field directly
    user_id: propertyData.property_mode === 'user' ? propertyData.user_id : undefined,
    
    // Basic property information
    property_type_id: propertyData.property_type?.id || 0,
    listing_type_id: propertyData.listing_type?.id || 0,
    title_en: propertyData.title_en || '',
    title_mm: propertyData.title_mm || '',
    description: propertyData.description || '',
    property_condition: propertyData.property_condition || 'new',
    
    // Location information
    region_id: propertyData.location?.region?.id || 0,
    township_id: propertyData.location?.township?.id || 0,
    address: propertyData.location?.address || '',
    latitude: propertyData.location?.latitude || undefined,
    longitude: propertyData.location?.longitude || undefined,
    
    // Property details
    price: parseFloat(propertyData.price) || 0,
    area_sqft: parseFloat(propertyData.area_sqft) || 0,
    bedrooms: propertyData.bedrooms || undefined,
    bathrooms: propertyData.bathrooms || undefined,
    bank_installment_available: propertyData.bank_installment_available || false,
    
    // Contact information
    owner_name: propertyData.contact_info?.owner_name || '',
    phone_numbers: propertyData.contact_info?.phone_numbers || [''],
    email: propertyData.contact_info?.email || '',
    
    // Status and settings
    status: propertyData.status || 'draft',
    is_featured: propertyData.is_featured || false,
    is_verified: propertyData.verification_status === 'approved' || false,
  };

  const handleSubmit = async (values: any) => {
    try {
      const mediaIds = [
        ...existingMedia.map(media => media.id),
        ...uploadedMedia.map(media => media.id)
      ];

      const updateData: CreatePropertyData = {
        ...values,
        features: selectedFeatures,
        phone_numbers: phoneNumbers.filter(phone => phone.trim() !== ''),
        media_ids: mediaIds,
      };

      await updatePropertyMutation.mutateAsync({ id: Number(id), data: updateData });
      
      // Navigate to property detail page with success message (consistent with other edit pages)
      navigate(`/properties/${id}?success=${encodeURIComponent('Property updated successfully!')}`);
    } catch (error: any) {
      showError(error.message || 'Failed to update property');
    }
  };

  const handleMediaUpload = (media: Media) => {
    setUploadedMedia(prev => [...prev, media]);
    showSuccess(`${media.type === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
  };

  const handleExistingMediaDelete = (mediaId: number) => {
    const mediaToDelete = existingMedia.find(m => m.id === mediaId);
    setExistingMedia(prev => prev.filter(media => media.id !== mediaId));
    showSuccess(`${mediaToDelete?.type === 'image' ? 'Image' : 'Media'} removed from property`);
  };

  const handleNewMediaDelete = (mediaId: number) => {
    const mediaToDelete = uploadedMedia.find(m => m.id === mediaId);
    setUploadedMedia(prev => prev.filter(media => media.id !== mediaId));
    showSuccess(`${mediaToDelete?.type === 'image' ? 'Image' : 'Media'} removed from upload queue`);
  };

  // Handle phone number changes
  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
    showSuccess('Phone number field added');
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhoneNumbers);
      showSuccess('Phone number removed');
    }
  };

  // Handle feature selection
  const handleFeatureToggle = (feature: string) => {
    const isAdding = !selectedFeatures.includes(feature);
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
    
    const featureName = feature.replace('_', ' ').toUpperCase();
    if (isAdding) {
      showSuccess(`${featureName} feature added`);
    } else {
      showSuccess(`${featureName} feature removed`);
    }
  };

  // Image viewer handlers
  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
  };

  // Video viewer handlers
  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setVideoViewerOpen(true);
  };

  const handleCloseVideoViewer = () => {
    setVideoViewerOpen(false);
    setSelectedVideo(null);
  };

  return (
    <Box>
      <PageHeader
        title="Edit Property"
        subtitle="Update property information"
        breadcrumbs={`Properties > ${propertyData.title_en} > Edit`}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Update Error Alert */}
      {updatePropertyMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: updatePropertyMutation.error?.message || 'Failed to update property'
          }}
          sx={{ mb: 2 }}
          onClose={() => updatePropertyMutation.reset()}
        />
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} lg={8}>
                {/* Property Mode Display (Read-only) */}
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Property Mode
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {values.is_platform_property ? (
                        <>
                          <BusinessIcon color="primary" />
                          <Typography variant="body1" fontWeight={500}>
                            Platform Property
                          </Typography>
                        </>
                      ) : (
                        <>
                          <PersonIcon color="primary" />
                          <Typography variant="body1" fontWeight={500}>
                            User Property
                          </Typography>
                        </>
                      )}
                    </Box>

                    {!values.is_platform_property && values.user_id && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Property Owner
                        </Typography>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'grey.50', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}>
                          {(() => {
                            const user = users?.find((u: RegularUser) => u.id === values.user_id);
                            return user ? (
                              <Typography variant="body2">
                                {user.name} ({user.email}) - {user.user_type}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                User information not available
                              </Typography>
                            );
                          })()}
                        </Box>
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
                      {/* Property Type and Listing Type */}
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          size="small"
                          options={propertyTypes || []}
                          getOptionLabel={(option) => 
                            `${option.name_en} (${option.name_mm})`
                          }
                          value={propertyTypes?.find(type => type.id === values.property_type_id) || null}
                          onChange={(_, newValue) => {
                            setFieldValue('property_type_id', newValue?.id || 0);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Property Type"
                              error={touched.property_type_id && Boolean(errors.property_type_id)}
                              helperText={touched.property_type_id && errors.property_type_id}
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
                          options={listingTypes || []}
                          getOptionLabel={(option) => 
                            `${option.name_en} (${option.name_mm})`
                          }
                          value={listingTypes?.find(type => type.id === values.listing_type_id) || null}
                          onChange={(_, newValue) => {
                            setFieldValue('listing_type_id', newValue?.id || 0);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Listing Type"
                              error={touched.listing_type_id && Boolean(errors.listing_type_id)}
                              helperText={touched.listing_type_id && errors.listing_type_id}
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

                      {/* Titles */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="title_en"
                          label="Title (English)"
                          value={values.title_en}
                          onChange={handleChange}
                          error={touched.title_en && Boolean(errors.title_en)}
                          helperText={touched.title_en && errors.title_en}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="title_mm"
                          label="Title (Myanmar)"
                          value={values.title_mm}
                          onChange={handleChange}
                          error={touched.title_mm && Boolean(errors.title_mm)}
                          helperText={touched.title_mm && errors.title_mm}
                        />
                      </Grid>

                      {/* Description */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          name="description"
                          label="Description"
                          multiline
                          rows={3}
                          value={values.description}
                          onChange={handleChange}
                          error={touched.description && Boolean(errors.description)}
                          helperText={touched.description && errors.description}
                        />
                      </Grid>

                      {/* Price and Area */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="price"
                          label="Price"
                          type="number"
                          value={values.price}
                          onChange={handleChange}
                          error={touched.price && Boolean(errors.price)}
                          helperText={touched.price && errors.price}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="area_sqft"
                          label="Area (sq ft)"
                          type="number"
                          value={values.area_sqft}
                          onChange={handleChange}
                          error={touched.area_sqft && Boolean(errors.area_sqft)}
                          helperText={touched.area_sqft && errors.area_sqft}
                        />
                      </Grid>

                      {/* Bedrooms and Bathrooms */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="bedrooms"
                          label="Bedrooms"
                          type="number"
                          value={values.bedrooms}
                          onChange={handleChange}
                          error={touched.bedrooms && Boolean(errors.bedrooms)}
                          helperText={touched.bedrooms && errors.bedrooms}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="bathrooms"
                          label="Bathrooms"
                          type="number"
                          value={values.bathrooms}
                          onChange={handleChange}
                          error={touched.bathrooms && Boolean(errors.bathrooms)}
                          helperText={touched.bathrooms && errors.bathrooms}
                        />
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
                      {/* Region and Township */}
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          size="small"
                          options={regions || []}
                          getOptionLabel={(option) => 
                            `${option.name_en} (${option.name_mm})`
                          }
                          value={regions?.find(region => region.id === values.region_id) || null}
                          onChange={(_, newValue) => {
                            setFieldValue('region_id', newValue?.id || 0);
                            setFieldValue('township_id', '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Region"
                              error={touched.region_id && Boolean(errors.region_id)}
                              helperText={touched.region_id && errors.region_id}
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
                          options={getFilteredTownships(Number(values.region_id))}
                          getOptionLabel={(option) => 
                            `${option.name_en} (${option.name_mm})`
                          }
                          value={getFilteredTownships(Number(values.region_id)).find(township => township.id === values.township_id) || null}
                          onChange={(_, newValue) => {
                            setFieldValue('township_id', newValue?.id || '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Township"
                              error={touched.township_id && Boolean(errors.township_id)}
                              helperText={touched.township_id && errors.township_id}
                              disabled={!values.region_id}
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

                      {/* Address */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          name="address"
                          label="Address"
                          value={values.address}
                          onChange={handleChange}
                          error={touched.address && Boolean(errors.address)}
                          helperText={touched.address && errors.address}
                        />
                      </Grid>

                      {/* Latitude and Longitude */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="latitude"
                          label="Latitude"
                          type="number"
                          value={values.latitude || ''}
                          onChange={handleChange}
                          error={touched.latitude && Boolean(errors.latitude)}
                          helperText={touched.latitude && errors.latitude}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="longitude"
                          label="Longitude"
                          type="number"
                          value={values.longitude || ''}
                          onChange={handleChange}
                          error={touched.longitude && Boolean(errors.longitude)}
                          helperText={touched.longitude && errors.longitude}
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
                      {/* Price and Area */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="price"
                          label="Price"
                          type="number"
                          value={values.price}
                          onChange={handleChange}
                          error={touched.price && Boolean(errors.price)}
                          helperText={touched.price && errors.price}
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
                          value={values.area_sqft}
                          onChange={handleChange}
                          error={touched.area_sqft && Boolean(errors.area_sqft)}
                          helperText={touched.area_sqft && errors.area_sqft}
                        />
                      </Grid>

                      {/* Bedrooms and Bathrooms */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="bedrooms"
                          label="Bedrooms"
                          type="number"
                          value={values.bedrooms || ''}
                          onChange={handleChange}
                          error={touched.bedrooms && Boolean(errors.bedrooms)}
                          helperText={touched.bedrooms && errors.bedrooms}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          name="bathrooms"
                          label="Bathrooms"
                          type="number"
                          value={values.bathrooms || ''}
                          onChange={handleChange}
                          error={touched.bathrooms && Boolean(errors.bathrooms)}
                          helperText={touched.bathrooms && errors.bathrooms}
                        />
                      </Grid>

                      {/* Property Condition */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Property Condition</InputLabel>
                          <Select
                            name="property_condition"
                            label="Property Condition"
                            value={values.property_condition}
                            onChange={handleChange}
                            error={touched.property_condition && Boolean(errors.property_condition)}
                          >
                            {PROPERTY_CONDITIONS.map((condition) => (
                              <MenuItem key={condition.value} value={condition.value}>
                                {condition.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.property_condition && errors.property_condition && (
                            <FormHelperText error>{errors.property_condition}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      {/* Bank Installment */}
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="bank_installment_available"
                              checked={values.bank_installment_available}
                              onChange={handleChange}
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
                          value={values.owner_name}
                          onChange={handleChange}
                          error={touched.owner_name && Boolean(errors.owner_name)}
                          helperText={touched.owner_name && errors.owner_name}
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
                          value={values.email}
                          onChange={handleChange}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Media Management */}
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <ImageIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Media Management
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Manage existing media and upload new photos/videos
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Existing Media Display */}
                    {existingMedia.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Existing Media ({existingMedia.length} files)
                        </Typography>
                        <Grid container spacing={2}>
                          {existingMedia.map((media) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={media.id}>
                              <Paper
                                sx={{
                                  p: 1,
                                  textAlign: 'center',
                                  border: media.is_primary ? '2px solid' : '1px solid',
                                  borderColor: media.is_primary ? 'primary.main' : 'divider',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: theme.shadows[4],
                                  },
                                  position: 'relative',
                                }}
                                onClick={() => media.type === 'image' ? handleImageClick(media) : handleVideoClick(media)}
                              >
                                {media.type === 'image' ? (
                                  <>
                                    <img
                                      src={media.url}
                                      alt={media.filename}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                      }}
                                    />
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                      {media.is_primary ? 'Primary Image' : 'Gallery Image'}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                      Click to view
                                    </Typography>
                                  </>
                                ) : (
                                  <>
                                    <Box sx={{ position: 'relative' }}>
                                      <img
                                        src={media.url}
                                        alt={media.filename}
                                        style={{
                                          width: '100%',
                                          height: '150px',
                                          objectFit: 'cover',
                                          borderRadius: '4px',
                                        }}
                                      />
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          top: '50%',
                                          left: '50%',
                                          transform: 'translate(-50%, -50%)',
                                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                                          borderRadius: '50%',
                                          width: 48,
                                          height: 48,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <PlayIcon sx={{ color: 'white', fontSize: 24 }} />
                                      </Box>
                                    </Box>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                      Video
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                      Click to play
                                    </Typography>
                                  </>
                                )}
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExistingMediaDelete(media.id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* New Media Upload */}
                    <MediaUpload 
                      uploadedMedia={uploadedMedia}
                      onMediaUpload={handleMediaUpload}
                      onMediaDelete={handleNewMediaDelete}
                    />
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
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            name="status"
                            label="Status"
                            value={values.status}
                            onChange={handleChange}
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
                              checked={values.is_featured}
                              onChange={handleChange}
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
                              checked={values.is_verified}
                              onChange={handleChange}
                            />
                          }
                          label="Verified Property"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Point System Information */}
                {!values.is_platform_property && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Point System
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Alert severity="info">
                        <Typography variant="body2">
                          Updating a property on behalf of a user will not affect their point balance.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card sx={{ position: 'sticky', top: 24 }}>
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
                        startIcon={updatePropertyMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={updatePropertyMutation.isPending}
                      >
                        {updatePropertyMutation.isPending ? 'Updating...' : 'Update Property'}
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CancelIcon />}
                        onClick={() => navigate('/properties')}
                        disabled={updatePropertyMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      {/* Image Viewer Modal */}
      <Dialog
        open={imageViewerOpen}
        onClose={handleCloseImageViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          {selectedImage && (
            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <IconButton
                  onClick={handleCloseImageViewer}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                  <Typography variant="body2">
                    {selectedImage.filename}
                  </Typography>
                  {selectedImage.is_primary && (
                    <Chip
                      label="Primary Image"
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Viewer Modal */}
      <Dialog
        open={videoViewerOpen}
        onClose={handleCloseVideoViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          {selectedVideo && (
            <Box sx={{ position: 'relative', textAlign: 'center', width: '100%' }}>
              <video
                src={selectedVideo.url}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '8px',
                }}
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <IconButton
                  onClick={handleCloseVideoViewer}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                  <Typography variant="body2">
                    {selectedVideo.filename}
                  </Typography>
                  <Chip
                    label="Video"
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
