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
import * as Yup from 'yup';

import PageHeader from '../../components/layout/PageHeader';
import ActionAlert from '../../components/ui/ActionAlert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MediaUpload from '../../components/ui/MediaUpload';
import { usersAPI } from '../../services/api/users';
import { locationsAPI } from '../../services/api/locations';
import { useAdvertisement, useUpdateAdvertisement } from '../../services/queries/advertisements';
import { useAlertSystem } from '../../hooks/useAlertSystem';
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
  advertisement_type: Yup.string().oneOf(['for_rent', 'for_sale'], 'Invalid advertisement type'),
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

const AdvertisementEditPage: React.FC = () => {
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

  // Fetch advertisement details
  const { data: advertisement, isLoading: isLoadingAdvertisement } = useAdvertisement(Number(id));

  // Fetch users for dropdown
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.getUsers,
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

  // Update advertisement mutation
  const updateAdvertisementMutation = useUpdateAdvertisement();

  // Initialize existing media when advertisement loads
  useEffect(() => {
    if (advertisement?.data?.media) {
      const allMedia: Media[] = [];
      
      // Add images
      if (advertisement.data.media.images) {
        advertisement.data.media.images.forEach(img => {
          allMedia.push({
            id: img.id,
            filename: img.file_name || '',
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
      if (advertisement.data.media.videos) {
        advertisement.data.media.videos.forEach(video => {
          allMedia.push({
            id: video.id,
            filename: video.file_name || '',
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
  }, [advertisement]);

  // Initialize phone numbers when advertisement loads
  useEffect(() => {
    if (advertisement?.data) {
      // Initialize phone numbers
      if (advertisement.data.contact_info?.phone_numbers && advertisement.data.contact_info.phone_numbers.length > 0) {
        setPhoneNumbers(advertisement.data.contact_info.phone_numbers);
      } else {
        setPhoneNumbers(['']);
      }
    }
  }, [advertisement?.data]);

  if (isLoadingAdvertisement) {
    return <LoadingSpinner />;
  }

  if (!advertisement?.data) {
    return <ActionAlert error={{ show: true, message: "Advertisement not found" }} />;
  }

  const advertisementData = advertisement.data;
  const users = usersResponse?.data || [];
  const regions = regionsResponse?.data || [];
  const townships = townshipsResponse?.data || [];

  const initialValues = {
    // Dual-mode fields
    is_platform_advertisement: advertisementData.advertisement_mode === 'platform',
    user_id: advertisementData.advertisement_mode === 'user' ? advertisementData.user_id : undefined,
    
    // Basic advertisement information
    title_en: advertisementData.title_en || '',
    title_mm: advertisementData.title_mm || '',
    description: advertisementData.description || '',
    advertisement_type: advertisementData.advertisement_type || 'for_sale',
    
    // Location information
    region_id: advertisementData.location?.region?.id || null,
    township_id: advertisementData.location?.township?.id || null,
    address: advertisementData.location?.address || advertisementData.address || '',
    
    // Contact information
    contact_name: advertisementData.contact_info?.contact_name || advertisementData.contact_name || '',
    email: advertisementData.contact_info?.email || advertisementData.email || '',
    
    // Status and settings
    status: advertisementData.status || 'draft',
    is_featured: advertisementData.is_featured || false,
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
      showSuccess('Phone number field removed');
    }
  };

  // Handle media upload
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
    showSuccess(`${mediaToDelete?.type === 'image' ? 'Image' : 'Media'} removed from advertisement`);
  };

  const handleNewMediaDelete = (mediaId: number) => {
    const mediaToDelete = uploadedMedia.find(m => m.id === mediaId);
    setUploadedMedia(prev => prev.filter(media => media.id !== mediaId));
    showSuccess(`${mediaToDelete?.type === 'image' ? 'Image' : 'Media'} removed from upload queue`);
  };



  const handleSubmit = async (values: any) => {
    try {
      console.log('🚀 Advertisement form submission started');
      console.log('📝 Form values:', values);
      console.log('📱 Phone numbers:', phoneNumbers);
      console.log('🖼️ Existing media:', existingMedia);
      console.log('📤 Uploaded media:', uploadedMedia);
      
      // Check if at least one image is uploaded
      const allMedia = [...existingMedia, ...uploadedMedia];
      const imageMedia = allMedia.filter(media => media.type === 'image');
      if (imageMedia.length === 0) {
        showError('At least one image is required to update an advertisement.');
        return;
      }
      
      // Prepare advertisement data
      const advertisementData: Partial<AdvertisementFormData> = {
        ...values,
        region_id: values.region_id || null,
        township_id: values.township_id || null,
        phone_numbers: phoneNumbers.filter(phone => phone.trim() !== ''),
        media_ids: allMedia.map(media => media.id),
      };

      console.log('📦 Advertisement data to submit:', advertisementData);
      console.log('🔄 Calling update mutation...');
      
      await updateAdvertisementMutation.mutateAsync({
        id: Number(id),
        data: advertisementData
      });
      
      console.log('✅ Advertisement updated successfully');
      // Navigate to advertisement detail page with success message (consistent with other edit pages)
      navigate(`/advertisements/${id}?success=${encodeURIComponent('Advertisement updated successfully!')}`);
    } catch (error: any) {
      console.error('❌ Error updating advertisement:', error);
      showError(error.message || 'Failed to update advertisement. Please try again.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Edit Advertisement"
        subtitle="Update advertisement information"
        breadcrumbs="Dashboard / Advertisements / Edit Advertisement"
        actionButton={{
          text: 'Back to Advertisements',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/advertisements')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Update Error Alert */}
      {updateAdvertisementMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: updateAdvertisementMutation.error?.message || 'Failed to update advertisement'
          }}
          sx={{ mb: 2 }}
          onClose={() => updateAdvertisementMutation.reset()}
        />
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={false}
      >
        {({ values, errors, touched, handleChange, setFieldValue, handleSubmit }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} lg={8}>
                {/* Advertisement Mode Section (Read-only for edit) */}
                <AdvertisementModeSection
                  isPlatformAdvertisement={values.is_platform_advertisement}
                  onPlatformAdvertisementChange={() => {}} // Read-only in edit mode
                  userId={values.user_id}
                  onUserIdChange={() => {}} // Read-only in edit mode
                  users={users}
                  usersLoading={usersLoading}
                  errors={errors}
                  touched={touched}
                  disabled={true}
                />

                {/* Basic Information Section */}
                <BasicInformationSection
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
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
                    <Typography variant="h6" gutterBottom>
                      Media Upload *
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      At least one image is required. You can upload up to 10 files (images and videos).
                      {(existingMedia.length > 0 || uploadedMedia.length > 0) && (
                        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                          ({(existingMedia.filter(m => m.type === 'image').length + uploadedMedia.filter(m => m.type === 'image').length)} images, {(existingMedia.filter(m => m.type === 'video').length + uploadedMedia.filter(m => m.type === 'video').length)} videos)
                        </span>
                      )}
                    </Typography>
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
                    {(existingMedia.filter(m => m.type === 'image').length === 0 && uploadedMedia.filter(m => m.type === 'image').length === 0) && (
                      <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Please upload at least one image to continue
                      </Typography>
                    )}
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
                  phoneNumbersTouched={!!(touched as any).phone_numbers}
                />
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} lg={4}>
                {/* Status Section */}
                <StatusSection
                  values={values}
                  handleChange={handleChange}
                />

                {/* Point System Information */}
                {!values.is_platform_advertisement && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Point System
                      </Typography>
                      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                      <Alert severity="info">
                        <Typography variant="body2">
                          Updating an advertisement on behalf of a user will deduct 10 points from their account when the advertisement is published.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Form Actions */}
                <FormActions
                  onSubmit={handleSubmit}
                  onCancel={() => navigate(`/advertisements/${id}`)}
                  submitText={uploadState.isUploading ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})` : "Update Advertisement"}
                  isSubmitting={updateAdvertisementMutation.isPending}
                  isDisabled={uploadState.isUploading || (existingMedia.filter(m => m.type === 'image').length === 0 && uploadedMedia.filter(m => m.type === 'image').length === 0)}
                />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AdvertisementEditPage;
