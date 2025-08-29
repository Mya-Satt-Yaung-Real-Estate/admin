import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert, MediaUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateAdvertisement } from '../../services/queries/advertisements';
import { useUsers } from '../../services/queries/users';
import { useRegions, useTownships } from '../../services/queries/locations';
import { AdvertisementFormData } from '../../types/advertisement';
import { Media } from '../../types/media';
import {
  AdvertisementModeSection,
  BasicInformationSection,
  LocationSection,
  ContactSection,
  StatusSection,
} from '../../components/forms/advertisement';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  title_en: Yup.string().required('English title is required').max(255, 'Title must be less than 255 characters'),
  title_mm: Yup.string().required('Myanmar title is required').max(255, 'Title must be less than 255 characters'),
  description: Yup.string().required('Description is required'),
  region_id: Yup.number().nullable(),
  township_id: Yup.number().nullable(),
  address: Yup.string().optional(),
  contact_name: Yup.string().required('Contact name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  phone_numbers: Yup.array().of(Yup.string().required('Phone number is required')).min(1, 'At least one phone number is required'),
  status: Yup.string().oneOf(['draft', 'published', 'expired', 'rejected']),
  is_featured: Yup.boolean(),
});

// ============================================================================
// COMPONENT
// ============================================================================

const AdvertisementCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    totalFiles: 0,
    uploadedFiles: 0,
    failedFiles: 0
  });

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();

  // API Queries
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();

  // Create Advertisement Mutation
  const createAdvertisementMutation = useCreateAdvertisement();

  // Formik Form
  const formik = useFormik({
    enableReinitialize: false,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      is_platform_advertisement: true,
      user_id: undefined as number | undefined,
      title_en: '',
      title_mm: '',
      description: '',
      region_id: null as number | null,
      township_id: null as number | null,
      address: '',
      contact_name: '',
      phone_numbers: [''],
      email: '',
      status: 'draft' as const,
      is_featured: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        
        // Check if at least one image is uploaded
        const imageMedia = uploadedMedia.filter(media => media.type === 'image');
        if (imageMedia.length === 0) {
          showError('At least one image is required to create an advertisement.');
          return;
        }
        
        // Filter out undefined values and ensure required fields are present
        const advertisementData: AdvertisementFormData = {
          ...values,
          region_id: values.region_id || null,
          township_id: values.township_id || null,
          phone_numbers: phoneNumbers.filter(phone => phone.trim() !== ''),
          media_ids: uploadedMedia.map(media => media.id),
          verification_status: 'approved', // Automatically approve
        };

        console.log('Advertisement data to submit:', advertisementData);
        const response = await createAdvertisementMutation.mutateAsync(advertisementData);
        
        // Navigate to advertisement detail page with success message (consistent with other create pages)
        const advertisementId = response.data?.id;
        if (advertisementId) {
          navigate(`/advertisements/${advertisementId}?success=${encodeURIComponent('Advertisement created successfully!')}`);
        } else {
          navigate('/advertisements');
        }
      } catch (error: any) {
        console.error('Error creating advertisement:', error);
        showError(error.message || 'Failed to create advertisement. Please try again.');
      }
    },
  });

  // Handle phone number changes
  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
    // Update formik values to match
    formik.setFieldValue('phone_numbers', newPhoneNumbers);
    // Mark the field as touched for validation
    formik.setFieldTouched('phone_numbers', true);
  };

  const addPhoneNumber = () => {
    const newPhoneNumbers = [...phoneNumbers, ''];
    setPhoneNumbers(newPhoneNumbers);
    // Update formik values to match
    formik.setFieldValue('phone_numbers', newPhoneNumbers);
    // Mark the field as touched for validation
    formik.setFieldTouched('phone_numbers', true);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhoneNumbers);
      // Update formik values to match
      formik.setFieldValue('phone_numbers', newPhoneNumbers);
      // Mark the field as touched for validation
      formik.setFieldTouched('phone_numbers', true);
    }
  };

  // Handle media upload
  const handleMediaUpload = (media: Media) => {
    setUploadedMedia(prev => [...prev, media]);
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

  // Handle media delete
  const handleMediaDelete = (mediaId: number) => {
    setUploadedMedia(prev => prev.filter(media => media.id !== mediaId));
  };

  // Handle platform advertisement mode change
  const handlePlatformAdvertisementChange = (isPlatform: boolean) => {
    formik.setFieldValue('is_platform_advertisement', isPlatform);
    if (isPlatform) {
      formik.setFieldValue('user_id', undefined);
    }
  };

  // Handle user selection
  const handleUserIdChange = (userId: number | undefined) => {
    formik.setFieldValue('user_id', userId);
  };

  // Check if any required data is loading
  const isLoading = usersLoading || regionsLoading || townshipsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Create Advertisement"
        subtitle="Add a new advertisement to the system"
        breadcrumbs="Dashboard / Advertisements / Create Advertisement"
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Create Error Alert */}
      {createAdvertisementMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: createAdvertisementMutation.error?.message || 'Failed to create advertisement'
          }}
          sx={{ mb: 2 }}
          onClose={() => createAdvertisementMutation.reset()}
        />
      )}

      <form onSubmit={(e) => {
        console.log('Form submit event triggered');
        console.log('Formik errors:', formik.errors);
        console.log('Formik touched:', formik.touched);
        console.log('Formik isValid:', formik.isValid);
        
        formik.handleSubmit(e);
      }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Advertisement Mode Section */}
            <AdvertisementModeSection
              isPlatformAdvertisement={formik.values.is_platform_advertisement}
              onPlatformAdvertisementChange={handlePlatformAdvertisementChange}
              userId={formik.values.user_id}
              onUserIdChange={handleUserIdChange}
              users={users?.data || []}
              usersLoading={usersLoading}
              errors={formik.errors}
              touched={formik.touched}
            />

            {/* Basic Information Section */}
            <BasicInformationSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
            />

            {/* Location Section */}
            <LocationSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              setFieldValue={formik.setFieldValue}
              regions={regions?.data || []}
              townships={townships?.data || []}
              regionsLoading={regionsLoading}
              townshipsLoading={townshipsLoading}
            />

            {/* Media Upload */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Media Upload *
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  At least one image is required. You can upload up to 10 files (images and videos).
                  {uploadedMedia.length > 0 && (
                    <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                      ({uploadedMedia.filter(m => m.type === 'image').length} images, {uploadedMedia.filter(m => m.type === 'video').length} videos)
                    </span>
                  )}
                </Typography>
                <MediaUpload
                  uploadedMedia={uploadedMedia}
                  onMediaUpload={handleMediaUpload}
                  onMediaDelete={handleMediaDelete}
                  maxFiles={10}
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
                {uploadedMedia.filter(m => m.type === 'image').length === 0 && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Please upload at least one image to continue
                  </Typography>
                )}
                {uploadedMedia.length > 0 && uploadedMedia.filter(m => m.type === 'image').length === 0 && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    At least one image is required. Videos alone are not sufficient.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Contact Section */}
            <ContactSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              phoneNumbers={phoneNumbers}
              onPhoneNumberChange={handlePhoneNumberChange}
              onAddPhoneNumber={addPhoneNumber}
              onRemovePhoneNumber={removePhoneNumber}
              phoneNumbersTouched={formik.touched.phone_numbers}
            />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Status Section */}
            <StatusSection
              values={formik.values}
              handleChange={formik.handleChange}
            />

            {/* Point System Information */}
            {!formik.values.is_platform_advertisement && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Point System
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                  <Alert severity="info">
                    <Typography variant="body2">
                      Creating an advertisement on behalf of a user will deduct 10 points from their account when the advertisement is published.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate('/advertisements')}
              submitText={uploadState.isUploading ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})` : "Create Advertisement"}
              isSubmitting={createAdvertisementMutation.isPending}
              isDisabled={uploadState.isUploading}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AdvertisementCreatePage;
