import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import PageHeader from '../../components/layout/PageHeader';
import { LoadingSpinner, ActionAlert } from '../../components/ui';
import SingleImageUpload from '../../components/ui/SingleImageUpload';
import { useAlertSystem } from '../../hooks';
import { useCreateLawyer } from '../../services/queries/lawyers';
import { useRegions, useTownships } from '../../services/queries/locations';
import { CreateLawyerData } from '../../types/lawyer';
import { Media } from '../../types/media';
import { lawyerCreateSchema } from '../../validations';
import {
  BasicInformationSection,
  LocationSection,
  ContactSection,
  EducationSection,
} from '../../components/forms/lawyer';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = lawyerCreateSchema;

// ============================================================================
// COMPONENT
// ============================================================================

const LawyerCreatePage: React.FC = () => {
  const navigate = useNavigate();
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
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();

  // Create Lawyer Mutation
  const createLawyerMutation = useCreateLawyer();

  // Formik Form
  const formik = useFormik({
    enableReinitialize: false,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      name: '',
      title: '',
      region_id: undefined as number | undefined,
      township_id: undefined as number | undefined,
      address: '',
      experience_years: undefined as number | undefined,
      phone: '',
      email: '',
      specialization: '',
      skillful_languages: [] as string[],
      services: [] as string[],
      about: '',
      education: [] as string[],
      certifications: [] as string[],
      media_id: undefined as number | undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        
        // Filter out undefined values and ensure required fields are present
        const lawyerData: CreateLawyerData = {
          ...values,
          region_id: values.region_id || 0,
          township_id: values.township_id || 0,
          experience_years: values.experience_years || 0,
          skillful_languages: values.skillful_languages || [],
          services: values.services || [],
          education: values.education || [],
          certifications: values.certifications || [],
          media_id: values.media_id || 0,
        };

        console.log('Lawyer data to submit:', lawyerData);
        await createLawyerMutation.mutateAsync(lawyerData);
        
        // Navigate to lawyer list page with success message
        navigate('/lawyers?success=' + encodeURIComponent('Lawyer created successfully!'));
      } catch (error: any) {
        console.error('Error creating lawyer:', error);
        showError(error.message || 'Failed to create lawyer. Please try again.');
      }
    },
  });

  // Handle media upload
  const handleMediaUpload = (media: Media) => {
    setUploadedMedia(prev => [...prev, media]);
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
    if (formik.values.media_id === mediaId) {
      formik.setFieldValue('media_id', undefined);
    }
  };

  // Loading state
  if (regionsLoading || townshipsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Create Lawyer"
        subtitle="Add a new lawyer to the system"
        breadcrumbs="Dashboard / Lawyers / Create Lawyer"
        actionButton={{
          text: 'Back to Lawyers',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/lawyers')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Create Error Alert */}
      {createLawyerMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: createLawyerMutation.error?.message || 'Failed to create lawyer'
          }}
          sx={{ mb: 2 }}
          onClose={() => createLawyerMutation.reset()}
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

            {/* Education Section */}
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
            {/* Form Actions */}
            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate('/lawyers')}
              submitText={uploadState.isUploading ? `Uploading... (${uploadState.uploadedFiles}/${uploadState.totalFiles})` : "Create Lawyer"}
              isSubmitting={createLawyerMutation.isPending}
              isDisabled={uploadState.isUploading}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default LawyerCreatePage;
