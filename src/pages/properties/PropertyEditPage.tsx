import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
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
import { UpdatePropertyData } from '../../types/property';
import { Media } from '../../types/media';
import { propertyEditSchema } from '../../validations';
import {
  PropertyModeSection,
  BasicInformationSection,
  LocationSection,
  ContactSection,
  StatusSection,
} from '../../components/forms/property';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = propertyEditSchema;

// ============================================================================
// COMPONENT
// ============================================================================

const PropertyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [existingMedia, setExistingMedia] = useState<Media[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    totalFiles: 0,
    uploadedFiles: 0,
    failedFiles: 0
  });

  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useProperty(Number(id));

  // Fetch users for dropdown
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.getUsers,
  });

  // Fetch property types
  const { data: propertyTypesResponse, isLoading: propertyTypesLoading } = useQuery({
    queryKey: ['property-types'],
    queryFn: propertiesAPI.getPropertyTypes,
  });

  // Fetch listing types
  const { data: listingTypesResponse, isLoading: listingTypesLoading } = useQuery({
    queryKey: ['listing-types'],
    queryFn: propertiesAPI.getPropertyListingTypes,
  });

  // Fetch regions
  const { data: regionsResponse, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: locationsAPI.getRegions,
  });

  // Fetch townships
  const { data: townshipsResponse, isLoading: townshipsLoading } = useQuery({
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

  // Initialize phone numbers when property loads
  useEffect(() => {
    if (property?.data) {
      // Initialize phone numbers
      if (property.data.contact_info?.phone_numbers && property.data.contact_info.phone_numbers.length > 0) {
        setPhoneNumbers(property.data.contact_info.phone_numbers);
      } else {
        setPhoneNumbers(['']);
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

  const initialValues = {
    // Dual-mode fields
    is_platform_property: propertyData.property_mode === 'platform',
    user_id: propertyData.property_mode === 'user' ? propertyData.user_id : undefined,
    
    // Basic property information
    property_type_id: propertyData.property_type?.id || 0,
    listing_type_id: propertyData.listing_type?.id || 0,
    title_en: propertyData.title_en || '',
    title_mm: propertyData.title_mm || '',
    description: propertyData.description || '',
    property_condition: propertyData.property_condition || 'ready',
    
    // Location information
    region_id: propertyData.location?.region?.id || 0,
    township_id: propertyData.location?.township?.id || 0,
    address: propertyData.location?.address || '',
    latitude: propertyData.location?.latitude || undefined,
    longitude: propertyData.location?.longitude || undefined,
    
    // Property details
    price: parseFloat(propertyData.price) || 0,
    area_sqft: parseFloat(propertyData.area_sqft) || 0,
    length: propertyData.length || undefined,
    width: propertyData.width || undefined,
    bedrooms: propertyData.bedrooms || undefined,
    bathrooms: propertyData.bathrooms || undefined,
    bank_installment_available: propertyData.bank_installment_available || false,
    tan_tan_tan: propertyData.tan_tan_tan || false,
    is_trending: propertyData.is_trending || false,
    
    // Contact information
    owner_name: propertyData.contact_info?.owner_name || '',
    phone_numbers: propertyData.contact_info?.phone_numbers || [''],
    email: propertyData.contact_info?.email || '',
    
    // Status and settings
    status: propertyData.status || undefined,
  };

  const handleSubmit = async (values: any) => {
    console.log('🚀 Form submission started');
    console.log('📝 Form values:', values);
    console.log('📱 Phone numbers:', phoneNumbers);
    console.log('🖼️ Existing media:', existingMedia);
    console.log('📤 Uploaded media:', uploadedMedia);
    
    try {
      const mediaIds = [
        ...existingMedia.map(media => media.id),
        ...uploadedMedia.map(media => media.id)
      ];

      // Destructure to exclude form-specific fields that shouldn't be sent to API
      const { is_platform_property, ...otherValues } = values;
      
      const updateData: UpdatePropertyData = {
        ...otherValues,
        // Transform is_platform_property boolean to property_mode string
        property_mode: is_platform_property ? 'platform' : 'user',
        user_id: is_platform_property ? undefined : values.user_id,
        tan_tan_tan: Boolean(values.tan_tan_tan), // Ensure boolean type
        is_trending: Boolean(values.is_trending), // Ensure boolean type
        phone_numbers: phoneNumbers.filter(phone => phone.trim() !== ''),
        email: values.email?.trim() || undefined, // Handle empty email as undefined
        media_ids: mediaIds,
      };

      console.log('📦 Update data to send:', updateData);
      console.log('🆔 Property ID:', Number(id));

      // Call the mutation to update the property
      const result = await updatePropertyMutation.mutateAsync({ id: Number(id), data: updateData });
      
      console.log('✅ Property updated successfully', result);
      showSuccess('Property updated successfully!');
      
      // Navigate to property detail page
      navigate(`/properties/${id}`);
    } catch (error: any) {
      console.error('❌ Error updating property:', error);
      
      // Handle validation errors from API response
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors object (e.g., Laravel validation errors)
        const errorMessages = Object.values(error.response.data.errors).flat();
        showError(errorMessages.join('\n'));
      } else {
        showError(error.message || 'Failed to update property');
      }
    }
  };

  const handleMediaUpload = (media: Media) => {
    setUploadedMedia(prev => [...prev, media]);
    showSuccess(`${media.type === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
  };

  // Handle upload start
  const handleUploadStart = () => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      uploadedFiles: 0,
      failedFiles: 0
    }));
  };

  // Handle upload progress
  const handleUploadProgress = (uploaded: number, total: number) => {
    setUploadState(prev => ({
      ...prev,
      totalFiles: total,
      uploadedFiles: uploaded
    }));
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    setUploadState(prev => ({
      ...prev,
      isUploading: false
    }));
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    setUploadState(prev => ({
      ...prev,
      failedFiles: prev.failedFiles + 1
    }));
    showError(error);
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


  return (
    <Box>
      <PageHeader
        title="Edit Property"
        subtitle="Update property information"
        breadcrumbs={`Properties > ${propertyData.title_en} > Edit`}
        actionButton={{
          text: 'Back to Properties',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/properties')
        }}
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
        {({ values, errors, touched, handleChange, setFieldValue, handleSubmit }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} lg={8}>
                {/* Property Mode Section (Read-only for edit) */}
                <PropertyModeSection
                  isPlatformProperty={values.is_platform_property}
                  onPlatformPropertyChange={() => {}} // Read-only in edit mode
                  userId={values.user_id}
                  onUserIdChange={() => {}} // Read-only in edit mode
                  users={users}
                  usersLoading={usersLoading}
                  disabled={true}
                />

                {/* Basic Information Section */}
                <BasicInformationSection
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  propertyTypes={propertyTypes}
                  listingTypes={listingTypes}
                  propertyTypesLoading={propertyTypesLoading}
                  listingTypesLoading={listingTypesLoading}
                />

                {/* Location Section */}
                <LocationSection
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                  regions={regions}
                  townships={townships}
                  regionsLoading={regionsLoading}
                  townshipsLoading={townshipsLoading}
                />


                {/* Media Upload */}
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <MediaUpload
                      uploadedMedia={[...existingMedia, ...uploadedMedia]}
                      onMediaUpload={handleMediaUpload}
                      onMediaDelete={(mediaId) => {
                        if (existingMedia.find(m => m.id === mediaId)) {
                          handleExistingMediaDelete(mediaId);
                        } else {
                          handleNewMediaDelete(mediaId);
                        }
                      }}
                      maxFiles={10}
                      onUploadStart={handleUploadStart}
                      onUploadProgress={handleUploadProgress}
                      onUploadComplete={handleUploadComplete}
                      onUploadError={handleUploadError}
                    />
                  </CardContent>
                </Card>

                {/* Contact Section */}
                <ContactSection
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  phoneNumbers={phoneNumbers}
                  onPhoneNumberChange={handlePhoneNumberChange}
                  onAddPhoneNumber={addPhoneNumber}
                  onRemovePhoneNumber={removePhoneNumber}
                />
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} lg={4}>
                {/* Status Section */}
                <StatusSection
                  values={values}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                />

                {/* Point System Information */}
                {!values.is_platform_property && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Point System
                      </Typography>
                      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                      <Alert severity="info">
                        <Typography variant="body2">
                          Updating a user property will not affect the user's points. Points are only deducted when properties are initially published.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Form Actions */}
                <FormActions
                  onSubmit={handleSubmit}
                  onCancel={() => navigate(`/properties/${id}`)}
                  submitText={uploadState.isUploading ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})` : "Update Property"}
                  isSubmitting={updatePropertyMutation.isPending}
                  isDisabled={uploadState.isUploading}
                />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PropertyEditPage;
