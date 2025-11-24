import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, SingleImageUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateAD } from '../../services/queries/ad';
import { ADFormData } from '../../types/ad';
import { Media } from '../../types/media';
import { FormActions } from '../../components/forms/shared/FormActions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  title_en: Yup.string().required('English title is required').max(255, 'Title must be less than 255 characters'),
  title_mm: Yup.string().required('Myanmar title is required').max(255, 'Title must be less than 255 characters'),
  description_en: Yup.string().required('English description is required'),
  description_mm: Yup.string().required('Myanmar description is required'),
  link: Yup.string().url('Must be a valid URL').required('Link is required'),
  link_type: Yup.string().oneOf(['button_link', 'text_link', 'image_link']).required('Link type is required'),
  display_location: Yup.string().oneOf(['homepage-slider', 'home-page-asidebar', 'detail-page-asidebar']).required('Display location is required'),
  media_id: Yup.number().required('Media ID is required').positive('Media ID must be a positive number'),
  // Add conditional validation for link_text based on link_type
  link_text: Yup.string().when('link_type', {
    is: (link_type: string) => link_type === 'button_link' || link_type === 'text_link',
    then: (schema) => schema.required('Link text is required for button and text links'),
    otherwise: (schema) => schema.nullable(),
  }),
});

// ============================================================================
// COMPONENT
// ============================================================================

const ADCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<Media | null>(null);

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();

  // Create AD Mutation
  const createADMutation = useCreateAD();

  // Upload Media Mutation (currently unused but kept for future functionality)
  // const uploadMediaMutation = useUploadMedia();

  // Handle image upload
  const handleImageUpload = (media: Media) => {
    setUploadedImage(media);
    // Update the form's media_id field to the new image ID
    formik.setFieldValue('media_id', media.id);
  };

  // Handle image delete
  const handleImageDelete = (mediaId: number) => {
    if (uploadedImage && uploadedImage.id === mediaId) {
      setUploadedImage(null);
      // Reset the form's media_id field when image is deleted
      formik.setFieldValue('media_id', 0);
    }
  };

  // Formik Form
  const formik = useFormik({
    enableReinitialize: false,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      title_en: '',
      title_mm: '',
      description_en: '',
      description_mm: '',
      link: '',
      link_type: 'button_link',
      link_text: '',
      price: 0,
      status: true,
      is_paid: false,
      is_published: false,
      display_location: 'homepage-slider',
      payment_date: '',
      start_at: '',
      end_at: '',
      media_id: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);

        // Generate slug from English title
        const slug = values.title_en
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

        // Prepare media ID - use uploaded image ID if available, otherwise use form value
        const mediaId = uploadedImage?.id || values.media_id;

        // Filter out undefined values and ensure required fields are present
        const adData: ADFormData = {
          ...values,
          link_type: values.link_type as "button_link" | "text_link" | "image_link",
          display_location: values.display_location as "homepage-slider" | "home-page-asidebar" | "detail-page-asidebar",
          slug,
          media_id: mediaId,
        };

        console.log('AD data to submit:', adData);
        const response = await createADMutation.mutateAsync(adData);

        // Use the slug from the response, or fall back to the generated slug
        const adSlug = response.data?.data?.slug || slug;
        if (adSlug) {
          navigate(`/ads/${adSlug}?success=${encodeURIComponent('AD created successfully!')}`);
        } else {
          navigate('/ads');
        }
      } catch (error: any) {
        console.error('Error creating AD:', error);
        showError(error.message || 'Failed to create AD. Please try again.');
      }
    },
  });

  return (
    <Box>
      <PageHeader
        title="Create AD"
        subtitle="Add a new AD to the system"
        breadcrumbs="Dashboard / ADs / Create AD"
        actionButton={{
          text: 'Back to ADs',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/ads')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Create Error Alert */}
      {createADMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: createADMutation.error?.message || 'Failed to create AD'
          }}
          sx={{ mb: 2 }}
          onClose={() => createADMutation.reset()}
        />
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Custom ADs Fields Section for Create (excluding Media ID field) */}
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Title Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="title_en"
                      name="title_en"
                      label="Title (English) *"
                      value={formik.values.title_en}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.title_en && Boolean(formik.errors.title_en)}
                      helperText={formik.touched.title_en ? formik.errors.title_en : ''}
                      placeholder="Enter English title"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="title_mm"
                      name="title_mm"
                      label="Title (Myanmar) *"
                      value={formik.values.title_mm}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.title_mm && Boolean(formik.errors.title_mm)}
                      helperText={formik.touched.title_mm ? formik.errors.title_mm : ''}
                      placeholder="မြန်မာဘာသာ ခေါင်းစီးပိုင်းထည့်ပါ"
                    />
                  </Grid>

                  {/* Description Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="description_en"
                      name="description_en"
                      label="Description (English) *"
                      value={formik.values.description_en}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description_en && Boolean(formik.errors.description_en)}
                      helperText={formik.touched.description_en ? formik.errors.description_en : ''}
                      multiline
                      rows={3}
                      placeholder="Enter English description"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="description_mm"
                      name="description_mm"
                      label="Description (Myanmar) *"
                      value={formik.values.description_mm}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description_mm && Boolean(formik.errors.description_mm)}
                      helperText={formik.touched.description_mm ? formik.errors.description_mm : ''}
                      multiline
                      rows={3}
                      placeholder="မြန်မာဘာသာ ဖော်ပြချက်ထည့်ပါ"
                    />
                  </Grid>

                  {/* Link Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="link"
                      name="link"
                      label="Link *"
                      value={formik.values.link}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.link && Boolean(formik.errors.link)}
                      helperText={formik.touched.link ? formik.errors.link : ''}
                      placeholder="https://example.com"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="link_type-label">Link Type *</InputLabel>
                      <Select
                        labelId="link_type-label"
                        id="link_type"
                        name="link_type"
                        value={formik.values.link_type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Link Type *"
                        error={formik.touched.link_type && Boolean(formik.errors.link_type)}
                      >
                        <MenuItem value="button_link">Button Link</MenuItem>
                        <MenuItem value="text_link">Text Link</MenuItem>
                        <MenuItem value="image_link">Image Link</MenuItem>
                      </Select>
                      {formik.touched.link_type && formik.errors.link_type && (
                        <FormHelperText error>
                          {formik.errors.link_type as string}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="link_text"
                      name="link_text"
                      label="Link Text"
                      value={formik.values.link_text || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.link_text && Boolean(formik.errors.link_text)}
                      helperText={formik.touched.link_text ? formik.errors.link_text : 'Required for button and text links'}
                    />
                  </Grid>

                  {/* Link Type and Price */}
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="price"
                      name="price"
                      label="Price"
                      type="number"
                      value={formik.values.price || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.price && Boolean(formik.errors.price)}
                      helperText={formik.touched.price ? formik.errors.price : ''}
                      placeholder="0"
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>

                  {/* Display Location */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="display_location-label">Display Location *</InputLabel>
                      <Select
                        labelId="display_location-label"
                        id="display_location"
                        name="display_location"
                        value={formik.values.display_location}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Display Location *"
                        error={formik.touched.display_location && Boolean(formik.errors.display_location)}
                      >
                        <MenuItem value="homepage-slider">Homepage Slider</MenuItem>
                        <MenuItem value="home-page-aside">Home Page Sidebar</MenuItem>
                        <MenuItem value="detail-page-aside">Detail Page Sidebar</MenuItem>
                      </Select>
                      {formik.touched.display_location && formik.errors.display_location && (
                        <FormHelperText error>
                          {formik.errors.display_location as string}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Date Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="payment_date"
                      name="payment_date"
                      label="Payment Date"
                      type="date"
                      value={formik.values.payment_date || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.payment_date && Boolean(formik.errors.payment_date)}
                      helperText={formik.touched.payment_date ? formik.errors.payment_date : ''}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="start_at"
                      name="start_at"
                      label="Start Date"
                      type="date"
                      value={formik.values.start_at || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.start_at && Boolean(formik.errors.start_at)}
                      helperText={formik.touched.start_at ? formik.errors.start_at : ''}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="end_at"
                      name="end_at"
                      label="End Date"
                      type="date"
                      value={formik.values.end_at || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.end_at && Boolean(formik.errors.end_at)}
                      helperText={formik.touched.end_at ? formik.errors.end_at : ''}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  {/* Status Switches */}
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="status"
                          name="status"
                          checked={Boolean(formik.values.status)}
                          onChange={(e) => formik.setFieldValue('status', e.target.checked)}
                        />
                      }
                      label="Status (Active/Inactive)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="is_paid"
                          name="is_paid"
                          checked={Boolean(formik.values.is_paid)}
                          onChange={(e) => formik.setFieldValue('is_paid', e.target.checked)}
                        />
                      }
                      label="Paid"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="is_published"
                          name="is_published"
                          checked={Boolean(formik.values.is_published)}
                          onChange={(e) => formik.setFieldValue('is_published', e.target.checked)}
                        />
                      }
                      label="Published"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Information Card */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AD Information
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                <Alert severity="info">
                  <Typography variant="body2">
                    ADs can be displayed in three locations: homepage slider, home page sidebar, and detail page sidebar. Each location has different limits.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AD Image
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                <SingleImageUpload
                  uploadedImage={uploadedImage}
                  onImageUpload={handleImageUpload}
                  onImageDelete={handleImageDelete}
                  onUploadStart={() => console.log('Upload started')}
                  onUploadProgress={(uploaded, total) => console.log(`Uploaded: ${uploaded}/${total}`)}
                  onUploadComplete={() => console.log('Upload completed')}
                  onUploadError={(error) => showError(error)}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate('/ads')}
              submitText={createADMutation.isPending ? "Creating AD..." : "Create AD"}
              isSubmitting={createADMutation.isPending}
              isDisabled={createADMutation.isPending}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ADCreatePage;