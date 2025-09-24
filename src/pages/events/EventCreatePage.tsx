import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateEvent, useEventCategories } from '../../services/queries/events';
import { useUsers } from '../../services/queries/users';
import { useRegions, useTownships } from '../../services/queries/locations';
import { CreateHousingEventData } from '../../types/event';
import { Media } from '../../types/media';
import {
  BasicInformationSection,
  EventDetailsSection,
  HostInformationSection,
  EventSettingsSection,
  MediaSection,
} from '../../components/forms/event';
import { SimpleDescriptionSection } from '../../components/forms/shared/SimpleDescriptionSection';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  name_en: Yup.string()
    .required('English name is required')
    .max(255, 'Name must be less than 255 characters'),
  name_mm: Yup.string()
    .required('Myanmar name is required')
    .max(255, 'Name must be less than 255 characters'),
  description: Yup.string()
    .required('Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  housing_event_category_id: Yup.number()
    .required('Event category is required')
    .positive('Please select a valid category'),
  date: Yup.date()
    .required('Event date is required'),
  start_time: Yup.string()
    .required('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: Yup.string()
    .required('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  host_user_id: Yup.number()
    .required('Host user is required')
    .positive('Please select a valid host user'),
  host_contact_number: Yup.string()
    .required('Host contact number is required')
    .max(255, 'Contact number must be less than 255 characters'),
  media_ids: Yup.array()
    .of(Yup.number())
    .min(1, 'At least one media file is required'),
});

// ============================================================================
// COMPONENT
// ============================================================================

const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    totalFiles: 0,
    uploadedFiles: 0,
    failedFiles: 0
  });
  const [tags, setTags] = useState<string[]>([]);

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();

  // API Queries
  const { data: categoriesResponse, isLoading: categoriesLoading } = useEventCategories({ per_page: 100 });
  const { data: usersResponse, isLoading: usersLoading } = useUsers({ per_page: 100 });
  const { data: regionsResponse, isLoading: regionsLoading } = useRegions();
  const { data: townshipsResponse, isLoading: townshipsLoading } = useTownships();

  // Create Event Mutation
  const createEventMutation = useCreateEvent();

  // Extract data
  const categories = categoriesResponse?.data || [];
  const users = usersResponse?.data || [];
  const regions = regionsResponse?.data || [];
  const townships = townshipsResponse?.data || [];

  // Formik Form
  const formik = useFormik({
    enableReinitialize: false,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      name_en: '',
      name_mm: '',
      description: '',
      housing_event_category_id: 0,
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      region_id: undefined as number | undefined,
      township_id: undefined as number | undefined,
      host_user_id: 0,
      host_contact_number: '',
      is_free: true,
      price: undefined as number | undefined,
      need_registration: false,
      is_online: false,
      status: 'draft' as const,
      user_capacity: undefined as number | undefined,
      media_ids: [] as number[],
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        
        // Prepare form data
        const formData: CreateHousingEventData = {
          ...values,
          tag: tags.length > 0 ? tags : undefined,
          media_ids: uploadedMedia.map(media => media.id),
        };

        console.log('Submitting data:', formData);

        const response = await createEventMutation.mutateAsync(formData);
        
        console.log('Event created successfully:', response);
        
        // Navigate to event detail page with success message (consistent with other create pages)
        const eventSlug = response.data?.slug;
        if (eventSlug) {
          navigate(`/events/${eventSlug}?success=${encodeURIComponent('Event created successfully!')}`);
        } else {
          navigate('/events');
        }
        
      } catch (error: any) {
        console.error('Error creating event:', error);
        
        // Show API response error message if available, otherwise show generic message
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Failed to create event';
        showError(errorMessage);
      }
    },
  });

  // Event handlers
  const handleBack = () => navigate('/events');

  const handleCancel = () => {
    if (formik.dirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        handleBack();
      }
    } else {
      handleBack();
    }
  };


  const handleMediaUpload = (media: Media) => {
    // For single image upload, replace any existing image
    setUploadedMedia([media]);
    formik.setFieldValue('media_ids', [media.id]);
  };

  const handleMediaDelete = (mediaId: number) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== mediaId));
    formik.setFieldValue('media_ids', uploadedMedia.filter(m => m.id !== mediaId).map(m => m.id));
  };

  const handleUploadStart = () => {
    setUploadState(prev => ({ ...prev, isUploading: true, totalFiles: 0, uploadedFiles: 0, failedFiles: 0 }));
  };

  const handleUploadProgress = (uploaded: number, total: number) => {
    setUploadState(prev => ({ ...prev, uploadedFiles: uploaded, totalFiles: total }));
  };

  const handleUploadComplete = () => {
    setUploadState(prev => ({ ...prev, isUploading: false }));
  };

  const handleUploadError = (error: string) => {
    setUploadState(prev => ({ ...prev, failedFiles: prev.failedFiles + 1 }));
    showError(error);
  };


  return (
    <Box>
      {/* Alert System */}
      <ActionAlert
        success={alert.success}
        error={alert.error}
        onClose={clearAlert}
      />

      {/* Page Header */}
      <PageHeader
        title="Create Event"
        subtitle="Create a new event"
        breadcrumbs="Dashboard / Events / Create Event"
        actionButton={{
          text: 'Back to Events',
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        {/* Row 1 - Basic Information (Full Width) */}
        <BasicInformationSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        {/* Row 2 - Event Details + Media Upload (Two Columns) */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <EventDetailsSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              categories={categories}
              categoriesLoading={categoriesLoading}
              regions={regions}
              townships={townships}
              regionsLoading={regionsLoading}
              townshipsLoading={townshipsLoading}
              tags={tags}
              onTagsChange={setTags}
              tagsLabel="Event Tags"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MediaSection
              uploadedMedia={uploadedMedia}
              onMediaUpload={handleMediaUpload}
              onMediaDelete={handleMediaDelete}
              onUploadStart={handleUploadStart}
              onUploadProgress={handleUploadProgress}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              errors={formik.errors}
              touched={formik.touched}
            />
          </Grid>
        </Grid>

        {/* Row 3 - Event Settings + Host Information (Two Columns) */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <EventSettingsSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <HostInformationSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              users={users}
              usersLoading={usersLoading}
            />
          </Grid>
        </Grid>

        {/* Row 4 - Description Section (Full Width) */}
        <SimpleDescriptionSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          descriptionLabel="Event Description"
          descriptionRequired={true}
          descriptionMaxLength={5000}
          title="Event Description"
        />

        {/* Form Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            disabled={!formik.dirty || createEventMutation.isPending || uploadState.isUploading}
          >
            Create Event
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={createEventMutation.isPending || uploadState.isUploading}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EventCreatePage;
