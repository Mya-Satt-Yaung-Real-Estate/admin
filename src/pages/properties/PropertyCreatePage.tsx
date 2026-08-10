import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert, MediaUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateProperty } from '../../services/queries/properties';
import { useUsers } from '../../services/queries/users';
import { usePropertyTypes, usePropertyListingTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import { CreatePropertyData } from '../../types/property';
import { Media } from '../../types/media';
import { propertyCreateSchema } from '../../validations';
import {
  PropertyModeSection,
  BasicInformationSection,
  LocationSection,
  ContactSection,
  StatusSection,
  FeaturesSection,
} from '../../components/forms/property';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = propertyCreateSchema;

// ============================================================================
// COMPONENT
// ============================================================================

const PropertyCreatePage: React.FC = () => {
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
  const { data: propertyTypes, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: listingTypes, isLoading: listingTypesLoading } = usePropertyListingTypes();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();

  // Create Property Mutation
  const createPropertyMutation = useCreateProperty();

  // Formik Form
  const formik = useFormik({
    enableReinitialize: false,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      is_platform_property: true,
      user_id: undefined as number | undefined,
      property_type_id: undefined as number | undefined,
      listing_type_id: undefined as number | undefined,
      title_en: '',
      title_mm: '',
      description: '',
      property_condition: 'ready' as const,
      region_id: undefined as number | undefined,
      township_id: undefined as number | undefined,
      address: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      currency: 'MMK' as const,
      price_lakh: undefined as number | undefined,
      area_sqft: undefined as number | undefined,
      sqft_fee: undefined as number | undefined,
      length: undefined as number | undefined,
      width: undefined as number | undefined,
      floor: undefined as number | undefined,
      bedrooms: undefined as number | undefined,
      bathrooms: undefined as number | undefined,
      bank_installment_available: false,
      tan_tan_tan: false,
      is_trending: false,
      is_direct_owner: false,
      features: [] as string[],
      owner_name: '',
      phone_numbers: [''],
      email: '',
      status: undefined as 'draft' | 'published' | 'sold' | 'rented' | undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        console.log('tan_tan_tan value:', values.tan_tan_tan, typeof values.tan_tan_tan);
        
        // Filter out undefined values and ensure required fields are present
        const propertyData: CreatePropertyData = {
          ...values,
          property_type_id: values.property_type_id || 0,
          listing_type_id: values.listing_type_id || 0,
          region_id: values.region_id || 0,
          township_id: values.township_id || 0,
          currency: values.currency || 'MMK',
          price_lakh: values.price_lakh || 0,
          price_amount: values.price_lakh || 0,
          area_sqft: values.area_sqft || 0,
          tan_tan_tan: Boolean(values.tan_tan_tan), // Ensure boolean type
          is_trending: Boolean(values.is_trending), // Ensure boolean type
          is_direct_owner: Boolean(values.is_direct_owner),
          features: values.features || [], // Ensure features array
          phone_numbers: phoneNumbers.filter(phone => phone.trim() !== ''),
          email: values.email?.trim() || undefined, // Handle empty email as undefined
          media_ids: uploadedMedia.map(media => media.id),
        };

        console.log('Property data to submit:', propertyData);
        console.log('tan_tan_tan in API data:', propertyData.tan_tan_tan, typeof propertyData.tan_tan_tan);
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
        actionButton={{
          text: 'Back to Properties',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/properties')
        }}
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
            {/* Property Mode Section */}
            <PropertyModeSection
              isPlatformProperty={formik.values.is_platform_property}
              onPlatformPropertyChange={(value) => {
                /**
                 * One setValues call so validation never sees a half-updated mode/user pair.
                 */
                formik.setValues({
                  ...formik.values,
                  is_platform_property: value,
                  user_id: value ? undefined : formik.values.user_id,
                  is_direct_owner: value ? false : formik.values.is_direct_owner,
                });
                if (value) {
                  formik.setFieldError('user_id', undefined);
                }
              }}
              userId={formik.values.user_id}
              onUserIdChange={(value) => {
                /**
                 * Atomic update + forced error clear.
                 * Chained setFieldValue calls race: a later validate can run on stale
                 * state.values where user_id is still undefined and re-apply this error.
                 */
                const nextUserId = value != null ? Number(value) : undefined;
                const selectedUser = (users?.data || []).find((u: { id: number }) => u.id === nextUserId);
                formik.setValues({
                  ...formik.values,
                  user_id: nextUserId,
                  is_direct_owner:
                    selectedUser?.user_type === 'individual'
                      ? formik.values.is_direct_owner
                      : false,
                });
                formik.setFieldTouched('user_id', true, false);
                if (nextUserId != null && nextUserId >= 1) {
                  formik.setFieldError('user_id', undefined);
                }
              }}
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
              propertyTypes={propertyTypes?.data || []}
              listingTypes={listingTypes?.data || []}
              propertyTypesLoading={propertyTypesLoading}
              listingTypesLoading={listingTypesLoading}
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

            {/* Features Section */}
            <FeaturesSection
              values={formik.values}
              setFieldValue={formik.setFieldValue}
              errors={formik.errors}
              touched={formik.touched}
            />

            {/* Media Upload */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
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
              setFieldValue={formik.setFieldValue}
              showDirectOwner={
                !formik.values.is_platform_property &&
                (users?.data || []).find((u: any) => u.id === formik.values.user_id)?.user_type === 'individual'
              }
            />

            {/* Point System Information */}
            {!formik.values.is_platform_property && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Point System
                  </Typography>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                  <Alert severity="info">
                    <Typography variant="body2">
                      Creating a property on behalf of a user will deduct 10 points from their account when the property is published.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate('/properties')}
              submitText={uploadState.isUploading ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})` : "Create Property"}
              isSubmitting={createPropertyMutation.isPending}
              isDisabled={uploadState.isUploading}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default PropertyCreatePage;
