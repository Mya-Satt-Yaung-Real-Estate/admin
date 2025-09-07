import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useUpdateEvent, useEventCategories, useEvent } from '../../services/queries/events';
import { useUsers } from '../../services/queries/users';
import { useRegions, useTownships } from '../../services/queries/locations';
import { UpdateHousingEventData } from '../../types/event';
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
// MAIN COMPONENT
// ============================================================================

const EventEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { showError } = useAlertSystem();

  // State for media upload and tags
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // API hooks
  const { data: eventResponse, isLoading: eventLoading, error: eventError } = useEvent(slug!);
  const { data: categories, isLoading: categoriesLoading } = useEventCategories();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();
  const updateEventMutation = useUpdateEvent();

  const event = eventResponse?.data;

  // Initialize uploadedMedia with existing event image and tags
  useEffect(() => {
    if (event?.images) {
      // Convert event.images to Media format
      const existingMedia: Media = {
        id: event.images.id,
        type: 'image' as const,
        filename: event.images.filename,
        size: 0, // Size not available in event.images
        formatted_size: 'Unknown',
        mime_type: 'image/jpeg', // Default mime type
        is_primary: event.images.is_primary,
        status: 'completed' as const,
        url: event.images.url,
        created_at: new Date().toISOString(), // Default created_at
      };
      setUploadedMedia([existingMedia]);
    }
    
    // Initialize tags with existing event tags
    if (event?.tag) {
      setTags(event.tag);
    }
  }, [event]);

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      name_en: event?.name_en || '',
      name_mm: event?.name_mm || '',
      description: event?.description || '',
      housing_event_category_id: event?.category?.id || 0,
      date: event?.date || '',
      start_time: event?.start_time || '',
      end_time: event?.end_time || '',
      location: event?.location || '',
      region_id: undefined as number | undefined,
      township_id: undefined as number | undefined,
      host_user_id: event?.host_user?.user_id || 0,
      host_contact_number: event?.host_contact_number || '',
      is_free: event?.is_free ?? true,
      price: undefined as number | undefined,
      need_registration: event?.need_registration ?? false,
      is_online: event?.is_online ?? false,
      status: 'draft' as const,
      user_capacity: undefined as number | undefined,
      media_ids: uploadedMedia.map(media => media.id),
      is_active: event?.is_active ?? true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        
        // Prepare form data
        const updateData: UpdateHousingEventData = {
          ...values,
          tag: tags.length > 0 ? tags : undefined,
          media_ids: uploadedMedia.map(media => media.id),
        };

        console.log('Submitting data:', updateData);

        await updateEventMutation.mutateAsync({
          slug: slug!,
          data: updateData,
        });

        console.log('Event updated successfully');
        
        // Navigate to event detail page with success message (consistent with other edit pages)
        navigate(`/events/${slug}?success=${encodeURIComponent('Event updated successfully!')}`);
      } catch (error: any) {
        console.error('Error updating event:', error);
        showError(error.message || 'Failed to update event');
      }
    },
  });

  // Media upload handlers
  const handleMediaUpload = (media: Media) => {
    setUploadedMedia([media]); // Single image for events
  };

  const handleMediaDelete = (mediaId: number) => {
    setUploadedMedia(prev => prev.filter(media => media.id !== mediaId));
  };

  const handleUploadStart = () => {
    // Upload start handler
  };

  const handleUploadProgress = (_uploaded: number, _total: number) => {
    // Upload progress handler
  };

  const handleUploadComplete = () => {
    // Upload complete handler
  };

  const handleUploadError = (error: string) => {
    showError(error);
  };

  // Navigation handlers
  const handleBack = () => {
    navigate('/events');
  };

  const handleCancel = () => {
    navigate('/events');
  };

  // Loading and error states
  if (eventLoading) {
    return <div>Loading event...</div>;
  }

  if (eventError || !event) {
    return <div>Error loading event or event not found</div>;
  }

  return (
    <Box>
      <PageHeader
        title="Edit Event"
        subtitle="Update event information"
        actionButton={{
          text: 'Back to Events',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <ActionAlert />

      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
        {/* Row 1: Basic Information (Full Width) */}
        <BasicInformationSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
        />

        {/* Row 2: Event Details + Media (Two Columns, 8:4 ratio) */}
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} md={8}>
            <EventDetailsSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              handleBlur={formik.handleBlur}
              categories={categories?.data || []}
              categoriesLoading={categoriesLoading}
              regions={regions?.data || []}
              townships={townships?.data || []}
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

        {/* Row 3: Event Settings + Host Information (Two Columns, 6:6 ratio) */}
        <Grid container spacing={3} sx={{ mt: 0 }}>
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
              users={users?.data || []}
              usersLoading={usersLoading}
            />
          </Grid>
        </Grid>

        {/* Row 4: Description (Full Width) */}
        <SimpleDescriptionSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          descriptionLabel="Description"
          descriptionRequired={true}
          descriptionMaxLength={5000}
          title="Description"
        />

        {/* Form Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2, 
          mt: 4,
          pt: 3,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={formik.isSubmitting || !formik.isValid}
            size="small"
          >
            {formik.isSubmitting ? 'Updating...' : 'Update Event'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EventEditPage;
