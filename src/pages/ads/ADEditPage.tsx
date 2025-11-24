import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, LoadingSpinner, SingleImageUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks/useAlertSystem';
import { useADBySlug, useUpdateADBySlug } from '../../services/queries/ad';
import { Media } from '../../types/media';
import { ADFormData } from '../../types/ad';
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

const ADEditPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const typedSlug = slug || '';
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<Media | null>(null);
  const [originalMediaId, setOriginalMediaId] = useState<number | null>(null);
  const { alert, showError, clearAlert } = useAlertSystem();

  // Fetch AD details
  const { data: ad, isLoading: isLoadingAD } = useADBySlug(typedSlug);

  // Update AD mutation
  const updateADMutation = useUpdateADBySlug();

  // Upload Media Mutation (currently unused but kept for future functionality)
  // const uploadMediaMutation = useUploadMedia();

  // Ensure slug exists before proceeding
  if (!typedSlug) {
    return <ActionAlert error={{ show: true, message: "AD slug is required" }} />;
  }

  // Initialize uploaded image from AD data when it loads
  useEffect(() => {
    if (!ad || !ad.data) return; // Early return if ad or ad.data is undefined

    if (ad.data.media) {
      // Ensure the media object has all required Media properties
      const completeMedia: Media = {
        id: ad.data.media.id || 0,
        type: (ad.data.media as any).type || 'image',
        filename: (ad.data.media as any).filename || `AD Media ${ad.data.id}`,
        size: (ad.data.media as any).size || 0,
        formatted_size: (ad.data.media as any).formatted_size || 'N/A',
        mime_type: (ad.data.media as any).mime_type || 'image/jpeg',
        is_primary: (ad.data.media as any).is_primary ?? true,
        status: (ad.data.media as any).status || 'completed',
        url: (ad.data.media as any).url || '',
        created_at: (ad.data.media as any).created_at || new Date().toISOString(),
      };
      setUploadedImage(completeMedia);
      setOriginalMediaId(completeMedia.id);
    } else if ((ad.data as any)?.image && Array.isArray((ad.data as any).image) && (ad.data as any).image.length > 0) {
      // Handle case where API returns image array (as per your API response)
      // Find primary image if available, otherwise use the first image
      const imageArray: any[] = (ad.data as any).image;
      const primaryImage = imageArray.find((img: any) => img.is_primary);
      const imageToUse = primaryImage || imageArray[0];
      const mediaObj: Media = {
        id: imageToUse.id || 0,
        type: imageToUse.type || 'image',
        filename: imageToUse.filename || `AD Image ${ad.data.id}`,
        size: imageToUse.size || 0,
        formatted_size: imageToUse.formatted_size || 'N/A',
        mime_type: imageToUse.mime_type || 'image/jpeg',
        is_primary: imageToUse.is_primary ?? true,
        status: imageToUse.status || 'completed',
        url: imageToUse.url || '',
        created_at: imageToUse.created_at || ad.data.created_at || new Date().toISOString(),
      };
      setUploadedImage(mediaObj);
      setOriginalMediaId(mediaObj.id);
    } else if ((ad.data as any)?.image && typeof (ad.data as any).image === 'object' && !Array.isArray((ad.data as any).image)) {
      // Handle case where API returns single image object instead of array
      const image: any = (ad.data as any).image;
      const mediaObj: Media = {
        id: image.id || 0,
        type: image.type || 'image',
        filename: image.filename || `AD Image ${ad.data.id}`,
        size: image.size || 0,
        formatted_size: image.formatted_size || 'N/A',
        mime_type: image.mime_type || 'image/jpeg',
        is_primary: image.is_primary ?? true,
        status: image.status || 'completed',
        url: image.url || '',
        created_at: image.created_at || ad.data.created_at || new Date().toISOString(),
      };
      setUploadedImage(mediaObj);
      setOriginalMediaId(mediaObj.id);
    } else if ((ad.data as any)?.image_url) {
      // If API returns image_url as a direct property instead of in media object
      const mediaObj: Media = {
        id: ad.data.media_id || 0,
        type: 'image',
        filename: `AD Image ${ad.data.id}`,
        size: 0, // Size not available in this format
        formatted_size: 'N/A',
        mime_type: 'image/jpeg', // Default assumption
        is_primary: true,
        status: 'completed',
        url: (ad.data as any).image_url || '',
        created_at: ad.data.created_at || new Date().toISOString(),
      };
      setUploadedImage(mediaObj);
      setOriginalMediaId(mediaObj.id);
    } else {
      setOriginalMediaId(ad.data.media_id || null);
    }
  }, [ad]);

  if (isLoadingAD) {
    return <LoadingSpinner />;
  }

  if (!ad?.data) {
    return <ActionAlert error={{ show: true, message: "AD not found" }} />;
  }

  const adData = ad.data;

  // Get the correct media_id from image data if available
  let effectiveMediaId = adData.media_id;
  if (adData.media) {
    effectiveMediaId = adData.media.id;
  } else if ((adData as any).image && Array.isArray((adData as any).image) && (adData as any).image.length > 0) {
    const primaryImage = (adData as any).image.find((img: any) => img.is_primary);
    const imageToUse = primaryImage || (adData as any).image[0];
    effectiveMediaId = imageToUse.id;
  } else if ((adData as any).image && typeof (adData as any).image === 'object' && (adData as any).image.id) {
    effectiveMediaId = (adData as any).image.id;
  }

  const initialValues = {
    title_en: adData.title_en || '',
    title_mm: adData.title_mm || '',
    description_en: adData.description_en || '',
    description_mm: adData.description_mm || '',
    link: adData.link || '',
    link_type: adData.link_type || 'button_link',
    link_text: adData.link_text || '',
    price: adData.price || 0,
    status: adData.status || false,
    is_paid: adData.is_paid || false,
    is_published: adData.is_published || false,
    display_location: adData.display_location || 'homepage-slider',
    payment_date: adData.payment_date || '',
    start_at: adData.start_at || '',
    end_at: adData.end_at || '',
    media_id: effectiveMediaId,
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('🚀 AD form submission started');
      console.log('📝 Form values:', values);

      // Generate slug from English title
      const newSlug = values.title_en
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

      // Prepare media ID - if new image was uploaded, use new image ID; otherwise use original media_id
      // Ensure that we never use an invalid media_id (like the default fallback of 1)
      const mediaId = (uploadedImage && uploadedImage?.id !== originalMediaId) ? uploadedImage?.id :
                     (values.media_id > 0 ? values.media_id : originalMediaId);

      // Prepare AD data (exclude id since we're using slug for update)
      const adData: Partial<ADFormData> = {
        ...values,
        slug: newSlug,
        media_id: mediaId,
      };

      console.log('📦 AD data to submit:', adData);
      console.log('🔄 Calling update mutation...');

      // Ensure slug is available before making API call
      if (!slug) {
        throw new Error('AD slug is required for update operation');
      }

      await updateADMutation.mutateAsync({
        slug: slug, // Use the original slug from URL to identify the AD to update
        data: adData
      });

      console.log('✅ AD updated successfully');
      // Navigate to AD detail page with success message
      // Since we're updating with slug, we can navigate using the generated slug
      navigate(`/ads/${newSlug || slug}?success=${encodeURIComponent('AD updated successfully!')}`);
    } catch (error: any) {
      console.error('❌ Error updating AD:', error);

      // Extract API response message
      let errorMessage = 'Failed to update AD. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Extract specific field errors
        const fieldErrors = error.response.data.errors;
        const firstErrorField = Object.keys(fieldErrors)[0];
        if (firstErrorField) {
          errorMessage = fieldErrors[firstErrorField][0];
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Edit AD"
        subtitle="Update AD information"
        breadcrumbs="Dashboard / ADs / Edit AD"
        actionButton={{
          text: 'Back to ADs',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/ads')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Update Error Alert */}
      {updateADMutation.isError && (
        <ActionAlert
          error={{
            show: true,
            message: updateADMutation.error?.message || 'Failed to update AD'
          }}
          sx={{ mb: 2 }}
          onClose={() => updateADMutation.reset()}
        />
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, errors, touched, handleChange, setFieldValue, handleSubmit }) => {
          // Handle image upload inside Formik context to access setFieldValue
          const handleImageUpload = (media: Media) => {
            // Ensure the media object has all required Media properties when received from SingleImageUpload
            const completeMedia: Media = {
              id: media.id,
              type: media.type || 'image',
              filename: media.filename || 'Uploaded Image',
              size: media.size || 0,
              formatted_size: media.formatted_size || 'N/A',
              mime_type: media.mime_type || 'image/jpeg',
              is_primary: media.is_primary ?? false,
              status: media.status || 'completed',
              url: media.url || '',
              created_at: media.created_at || new Date().toISOString(),
            };
            setUploadedImage(completeMedia);
            // Update the form's media_id field to the new image ID
            setFieldValue('media_id', completeMedia.id);
          };

          // Handle image delete inside Formik context to access setFieldValue
          const handleImageDeleteInFormik = (mediaId: number) => {
            // If the uploaded image matches the ID being deleted, clear it
            if (uploadedImage && uploadedImage.id === mediaId) {
              setUploadedImage(null);
              // Reset the media_id field to the original value
              setFieldValue('media_id', originalMediaId || '');
            }
          };

          return (
          <Form>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} lg={8}>
                {/* ADs Fields Section */}
                {/* Custom ADs Fields Section for Edit (excluding Media ID field) */}
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
                          value={values.title_en}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.title_en && Boolean(errors.title_en)}
                          helperText={touched.title_en ? errors.title_en : ''}
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
                          value={values.title_mm}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.title_mm && Boolean(errors.title_mm)}
                          helperText={touched.title_mm ? errors.title_mm : ''}
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
                          value={values.description_en}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.description_en && Boolean(errors.description_en)}
                          helperText={touched.description_en ? errors.description_en : ''}
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
                          value={values.description_mm}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.description_mm && Boolean(errors.description_mm)}
                          helperText={touched.description_mm ? errors.description_mm : ''}
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
                          value={values.link}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.link && Boolean(errors.link)}
                          helperText={touched.link ? errors.link : ''}
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
                            value={values.link_type}
                            onChange={handleChange}
                            onBlur={() => {}} // Placeholder for edit page
                            label="Link Type *"
                            error={touched.link_type && Boolean(errors.link_type)}
                          >
                            <MenuItem value="button_link">Button Link</MenuItem>
                            <MenuItem value="text_link">Text Link</MenuItem>
                            <MenuItem value="image_link">Image Link</MenuItem>
                          </Select>
                          {touched.link_type && errors.link_type && (
                            <FormHelperText error>
                              {errors.link_type as string}
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
                          value={values.link_text || ''}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.link_text && Boolean(errors.link_text)}
                          helperText={touched.link_text ? errors.link_text : 'Required for button and text links'}
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
                          value={values.price || ''}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.price && Boolean(errors.price)}
                          helperText={touched.price ? errors.price : ''}
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
                            value={values.display_location}
                            onChange={handleChange}
                            onBlur={() => {}} // Placeholder for edit page
                            label="Display Location *"
                            error={touched.display_location && Boolean(errors.display_location)}
                          >
                            <MenuItem value="homepage-slider">Homepage Slider</MenuItem>
                            <MenuItem value="home-page-asidebar">Home Page Sidebar</MenuItem>
                            <MenuItem value="detail-page-asidebar">Detail Page Sidebar</MenuItem>
                          </Select>
                          {touched.display_location && errors.display_location && (
                            <FormHelperText error>
                              {errors.display_location as string}
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
                          value={values.payment_date || ''}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.payment_date && Boolean(errors.payment_date)}
                          helperText={touched.payment_date ? errors.payment_date : ''}
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
                          value={values.start_at || ''}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.start_at && Boolean(errors.start_at)}
                          helperText={touched.start_at ? errors.start_at : ''}
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
                          value={values.end_at || ''}
                          onChange={handleChange}
                          onBlur={() => {}} // Placeholder for edit page
                          error={touched.end_at && Boolean(errors.end_at)}
                          helperText={touched.end_at ? errors.end_at : ''}
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
                              checked={Boolean(values.status)}
                              onChange={(e) => setFieldValue('status', e.target.checked)}
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
                              checked={Boolean(values.is_paid)}
                              onChange={(e) => setFieldValue('is_paid', e.target.checked)}
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
                              checked={Boolean(values.is_published)}
                              onChange={(e) => setFieldValue('is_published', e.target.checked)}
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
                      onImageDelete={handleImageDeleteInFormik}
                      onUploadStart={() => console.log('Upload started')}
                      onUploadProgress={(uploaded, total) => console.log(`Uploaded: ${uploaded}/${total}`)}
                      onUploadComplete={() => console.log('Upload completed')}
                      onUploadError={(error) => showError(error)}
                    />
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <FormActions
                  onSubmit={handleSubmit}
                  onCancel={() => navigate('/ads')}
                  submitText={updateADMutation.isPending ? "Updating AD..." : "Update AD"}
                  isSubmitting={updateADMutation.isPending}
                  isDisabled={updateADMutation.isPending}
                />
              </Grid>
            </Grid>
          </Form>
        );
      }}
      </Formik>
    </Box>
  );
};

export default ADEditPage;