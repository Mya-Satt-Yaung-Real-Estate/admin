import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert } from '../../components/ui';
import SingleImageUpload from '../../components/ui/SingleImageUpload';
import { useAlertSystem } from '../../hooks';
import { useLawyer, useUpdateLawyer } from '../../services/queries/lawyers';
import { useRegions, useTownships } from '../../services/queries/locations';
import { UpdateLawyerData, LawyerFormData } from '../../types/lawyer';
import { Media } from '../../types/media';
import { lawyerUpdateSchema } from '../../validations';
import {
  BasicInformationSection,
  LocationSection,
  ContactSection,
  EducationSection,
  StatusSection,
} from '../../components/forms/lawyer';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = lawyerUpdateSchema;

// ============================================================================
// COMPONENT
// ============================================================================

const LawyerEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
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
  const { data: lawyerResponse, isLoading: lawyerLoading, error: lawyerError } = useLawyer(slug!);
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();

  // Update Lawyer Mutation
  const updateLawyerMutation = useUpdateLawyer();

  const lawyer = lawyerResponse?.data;

  // Formik Form
  const formik = useFormik<LawyerFormData>({
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      name: lawyer?.name || '',
      title: lawyer?.title || '',
      region_id: lawyer?.region_id || undefined,
      township_id: lawyer?.township_id || undefined,
      address: lawyer?.address || '',
      experience_years: lawyer?.experience_years || undefined,
      phone: lawyer?.phone || '',
      email: lawyer?.email || '',
      specialization: lawyer?.specialization || '',
      skillful_languages: lawyer?.skillful_languages || [],
      services: lawyer?.services || [],
      about: lawyer?.about || '',
      education: lawyer?.education || [],
      certifications: lawyer?.certifications || [],
      media_id: lawyer?.media?.id || undefined,
      status: lawyer?.status || false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        
        const lawyerData: UpdateLawyerData = {
          name: values.name,
          title: values.title,
          region_id: values.region_id,
          township_id: values.township_id,
          address: values.address,
          experience_years: values.experience_years,
          phone: values.phone,
          email: values.email,
          specialization: values.specialization,
          skillful_languages: values.skillful_languages,
          services: values.services,
          about: values.about,
          education: values.education,
          certifications: values.certifications,
          media_id: values.media_id,
          status: values.status,
        };

        console.log('Lawyer data to submit:', lawyerData);
        await updateLawyerMutation.mutateAsync({ slug: slug!, data: lawyerData });
        
        // Navigate to lawyer detail page with success message
        navigate(`/lawyers/${slug}?success=${encodeURIComponent('Lawyer updated successfully!')}`);
      } catch (error: any) {
        console.error('Error updating lawyer:', error);
        showError(error.message || 'Failed to update lawyer. Please try again.');
      }
    },
  });

  // Initialize form when lawyer data is loaded
  useEffect(() => {
    if (lawyer) {
      formik.setValues({
        name: lawyer.name || '',
        title: lawyer.title || '',
        region_id: lawyer.region_id || undefined,
        township_id: lawyer.township_id || undefined,
        address: lawyer.address || '',
        experience_years: lawyer.experience_years || undefined,
        phone: lawyer.phone || '',
        email: lawyer.email || '',
        specialization: lawyer.specialization || '',
        skillful_languages: lawyer.skillful_languages || [],
        services: lawyer.services || [],
        about: lawyer.about || '',
        education: lawyer.education || [],
        certifications: lawyer.certifications || [],
        media_id: lawyer.media?.id || undefined,
        status: lawyer.status || false,
      });

      // Initialize uploaded media if lawyer has an image
      if (lawyer.media) {
        const existingMedia: Media = {
          id: lawyer.media.id,
          type: 'image' as const,
          filename: lawyer.media.file_name,
          size: lawyer.media.size || 0,
          formatted_size: 'Unknown',
          mime_type: lawyer.media.mime_type,
          is_primary: true,
          status: 'completed' as const,
          url: lawyer.media.file_url,
          created_at: new Date().toISOString(),
        };
        setUploadedMedia([existingMedia]);
      }
    }
  }, [lawyer]);

  // Handle media upload
  const handleMediaUpload = (media: Media) => {
    setUploadedMedia([media]); // Only allow one profile image
    formik.setFieldValue('media_id', media.id);
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
    formik.setFieldValue('media_id', undefined);
  };

  // Loading state
  if (lawyerLoading || regionsLoading || townshipsLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (lawyerError || !lawyer) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Edit Lawyer"
          subtitle="Update lawyer information"
          breadcrumbs="Dashboard / Lawyers / Edit Lawyer"
          actionButton={{
            text: 'Back to Lawyers',
            icon: <ArrowBackIcon />,
            onClick: () => navigate('/lawyers')
          }}
        />
        <Box sx={{ mt: 2 }}>
          <ActionAlert
            error={{
              show: true,
              message: lawyerError?.message || 'Lawyer not found'
            }}
            sx={{ mb: 2 }}
            onClose={() => navigate('/lawyers')}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit Lawyer"
        subtitle="Update lawyer information"
        breadcrumbs="Dashboard / Lawyers / Edit Lawyer"
        actionButton={{
          text: 'Back to Lawyers',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/lawyers')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Update Error Alert */}
      {updateLawyerMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: updateLawyerMutation.error?.message || 'Failed to update lawyer'
          }}
          sx={{ mb: 2 }}
          onClose={() => updateLawyerMutation.reset()}
        />
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Basic Information Section */}
            <BasicInformationSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
              setFieldValue={formik.setFieldValue}
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

            {/* Contact Section */}
            <ContactSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              handleChange={formik.handleChange}
            />

            {/* Education & Certifications Section */}
            <EducationSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              setFieldValue={formik.setFieldValue}
            />

            {/* Media Upload */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Profile Image
                  <Typography component="span" sx={{ color: 'error.main' }}>*</Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Upload a professional profile image for the lawyer
                </Typography>
                <SingleImageUpload
                  uploadedImage={uploadedMedia.length > 0 ? uploadedMedia[0] : null}
                  onImageUpload={handleMediaUpload}
                  onImageDelete={handleMediaDelete}
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
                {formik.touched.media_id && formik.errors.media_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formik.errors.media_id}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Status Section */}
            <StatusSection
              values={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              setFieldValue={formik.setFieldValue}
            />

            {/* Form Actions */}
            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate('/lawyers')}
              submitText={uploadState.isUploading ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})` : "Update Lawyer"}
              isSubmitting={updateLawyerMutation.isPending}
              isDisabled={uploadState.isUploading}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default LawyerEditPage;
