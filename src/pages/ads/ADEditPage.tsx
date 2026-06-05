import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, ColorLens as ColorLensIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, LoadingSpinner, SingleImageUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks/useAlertSystem';
import { useAD, useUpdateAD } from '../../services/queries/ad';
import { useUsers } from '../../services/queries/users';
import { Media } from '../../types/media';
import { ADFormData, adRequiresCompanyUser } from '../../types/ad';
import { FormActions } from '../../components/forms/shared/FormActions';
import { CompanyUserSelect } from '../../components/forms/ads/CompanyUserSelect';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  title_en: Yup.string().nullable().max(255, 'Title must be less than 255 characters'),
  title_mm: Yup.string().nullable().max(255, 'Title must be less than 255 characters'),
  description_en: Yup.string().nullable(),
  description_mm: Yup.string().nullable(),
  link: Yup.string()
    .nullable()
    .test('url', 'Must be a valid URL', function(value) {
      if (!value || value.length === 0) return true; // Allow empty/null
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }),
  link_type: Yup.string().nullable().oneOf(['button_link', 'text_link', 'image_link']),
  display_location: Yup.string()
    .oneOf(['homepage_block', 'home-page-asidebar', 'detail-page-asidebar', 'detail-page-asidebar-2', 'home_grid_ads'])
    .required('Display location is required'),
  grid_index: Yup.number()
    .nullable()
    .when('display_location', {
      is: 'home_grid_ads',
      then: (schema) => schema.required('Select grid slot').min(1).max(4).integer(),
      otherwise: (schema) => schema.nullable(),
    }),
  user_id: Yup.number()
    .nullable()
    .when('display_location', {
      is: (loc: string) => adRequiresCompanyUser(loc),
      then: (schema) => schema.required('Select a company user').positive('Select a company user'),
      otherwise: (schema) => schema.nullable().strip(),
    }),
  media_id: Yup.number().required('Media ID is required').positive('Media ID must be a positive number'),
  // Link text is required if link has value and link_type is not image_link
  link_text: Yup.string().nullable().when(['link', 'link_type'], {
    is: (link: string, link_type: string) => 
      link && link.length > 0 && link_type && link_type !== 'image_link',
    then: (schema) => schema.required('Link text is required when link is provided and link type is not image link'),
    otherwise: (schema) => schema.nullable(),
  }),
  text_color_code: Yup.string()
    .nullable()
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code (e.g., #000000)'),
  payment_date: Yup.string().nullable(),
});

// ============================================================================
// COMPONENT
// ============================================================================

const ADEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const typedId = id || '';
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<Media | null>(null);
  const [originalMediaId, setOriginalMediaId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState<string>('');
  const [formikSetFieldValue, setFormikSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);
  const { alert, showError, clearAlert } = useAlertSystem();

  // Fetch AD details
  const { data: ad, isLoading: isLoadingAD } = useAD(typedId);

  // Update AD mutation
  const updateADMutation = useUpdateAD();
  const { data: usersResponse, isLoading: usersLoading } = useUsers({ user_type: 'company' });

  // Upload Media Mutation (currently unused but kept for future functionality)
  // const uploadMediaMutation = useUploadMedia();

  // Ensure id exists before proceeding
  if (!typedId) {
    return <ActionAlert error={{ show: true, message: "AD id is required" }} />;
  }

  // Initialize uploaded image from AD data when it loads
  useEffect(() => {
    if (!ad || !ad.data) return; // Early return if ad or ad.data is undefined

    // Check for images (singular object) first - this is the current API response format
    if ((ad.data as any)?.images && typeof (ad.data as any).images === 'object' && !Array.isArray((ad.data as any).images)) {
      const image: any = (ad.data as any).images;
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
    } else if (ad.data.media) {
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
      // Handle case where API returns image array
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

  // Helper function to format ISO date string to YYYY-MM-DD for date inputs
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };

  // Get the correct media_id from image data if available
  let effectiveMediaId = adData.media_id;
  if ((adData as any)?.images && typeof (adData as any).images === 'object' && !Array.isArray((adData as any).images)) {
    // Check for images (singular object) first - this is the current API response format
    effectiveMediaId = (adData as any).images.id;
  } else if (adData.media) {
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
    text_color_code: adData.text_color_code || '',
    price: adData.price || 0,
    status: adData.status || false,
    is_paid: adData.is_paid || false,
    is_published: adData.is_published || false,
    display_location: adData.display_location || 'homepage_block',
    grid_index: adData.grid_index ?? null,
    user_id: adData.user_id ?? adData.user?.id ?? undefined,
    payment_date: adData.payment_date || '',
    start_at: formatDateForInput(adData.start_at),
    end_at: formatDateForInput(adData.end_at),
    media_id: effectiveMediaId,
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('🚀 AD form submission started');
      console.log('📝 Form values:', values);

      // Prepare media ID - if new image was uploaded, use new image ID; otherwise use original media_id
      // Ensure that we never use an invalid media_id (like the default fallback of 1)
      const mediaId = (uploadedImage && uploadedImage?.id !== originalMediaId) ? uploadedImage?.id :
                     (values.media_id > 0 ? values.media_id : originalMediaId);

      // Prepare AD data
      const adData: Partial<ADFormData> = {
        ...values,
        grid_index: values.display_location === 'home_grid_ads' ? values.grid_index ?? null : null,
        user_id: adRequiresCompanyUser(values.display_location) ? values.user_id : undefined,
        media_id: mediaId,
      };

      console.log('📦 AD data to submit:', adData);
      console.log('🔄 Calling update mutation...');

      // Ensure id is available before making API call
      if (!typedId) {
        throw new Error('AD id is required for update operation');
      }

      await updateADMutation.mutateAsync({
        id: typedId, // Use the id from URL to identify the AD to update
        data: adData
      });

      console.log('✅ AD updated successfully');
      // Navigate to AD detail page with success message
      navigate(`/ads/${typedId}?success=${encodeURIComponent('AD updated successfully!')}`);
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
        {({ values, errors, touched, handleChange, setFieldValue, setFieldTouched, handleSubmit }) => {
          // Store setFieldValue for use in Dialog
          useEffect(() => {
            setFormikSetFieldValue(() => setFieldValue);
          }, [setFieldValue]);

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

                      {/* Display Location */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="display_location-label">Display Location *</InputLabel>
                          <Select
                            labelId="display_location-label"
                            id="display_location"
                            name="display_location"
                            value={values.display_location}
                            onChange={(e) => {
                              const v = e.target.value;
                              setFieldValue('display_location', v);
                              if (v === 'home-page-asidebar') {
                                setFieldValue('user_id', undefined);
                                setFieldValue('grid_index', null);
                              } else if (v !== 'home_grid_ads') {
                                setFieldValue('grid_index', null);
                              } else if (values.grid_index == null) {
                                setFieldValue('grid_index', 1);
                              }
                            }}
                            onBlur={() => {}}
                            label="Display Location *"
                            error={touched.display_location && Boolean(errors.display_location)}
                          >
                            <MenuItem value="homepage_block">Homepage Block</MenuItem>
                            <MenuItem value="home-page-asidebar">Home page Main Slider</MenuItem>
                            <MenuItem value="detail-page-asidebar">Detail Page Sidebar 1</MenuItem>
                            <MenuItem value="detail-page-asidebar-2">Detail Page Sidebar 2</MenuItem>
                            <MenuItem value="home_grid_ads">Home Grid ADS</MenuItem>
                          </Select>
                          {touched.display_location && errors.display_location && (
                            <FormHelperText error>
                              {errors.display_location as string}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      {adRequiresCompanyUser(values.display_location) && (
                        <Grid item xs={12} sm={6}>
                          <CompanyUserSelect
                            userId={values.user_id}
                            onUserIdChange={(id) => setFieldValue('user_id', id)}
                            users={usersResponse?.data || []}
                            usersLoading={usersLoading}
                            error={errors.user_id as string | undefined}
                            touched={touched.user_id}
                            onBlur={() => setFieldTouched('user_id', true)}
                          />
                        </Grid>
                      )}

                      {values.display_location === 'home_grid_ads' && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="grid_index-label">Grid slot *</InputLabel>
                            <Select
                              labelId="grid_index-label"
                              id="grid_index"
                              name="grid_index"
                              value={values.grid_index ?? ''}
                              onChange={(e) => {
                                const n = e.target.value === '' ? null : Number(e.target.value);
                                setFieldValue('grid_index', n);
                              }}
                              onBlur={() => {}}
                              label="Grid slot *"
                              error={touched.grid_index && Boolean(errors.grid_index)}
                            >
                              <MenuItem value={1}>Grid 1</MenuItem>
                              <MenuItem value={2}>Grid 2</MenuItem>
                              <MenuItem value={3}>Grid 3</MenuItem>
                              <MenuItem value={4}>Grid 4</MenuItem>
                            </Select>
                            {touched.grid_index && errors.grid_index && (
                              <FormHelperText error>{errors.grid_index as string}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                      )}

                      {/* Status Switches */}
                      <Grid item xs={12} sm={6}>
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

                      {/* Date Fields */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          id="start_at"
                          name="start_at"
                          label="Start Date *"
                          type="date"
                          value={values.start_at || ''}
                          onChange={handleChange}
                          onBlur={() => {}}
                          error={touched.start_at && Boolean(errors.start_at)}
                          helperText={touched.start_at ? errors.start_at : ''}
                          required
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
                          label="End Date *"
                          type="date"
                          value={values.end_at || ''}
                          onChange={handleChange}
                          onBlur={() => {}}
                          error={touched.end_at && Boolean(errors.end_at)}
                          helperText={touched.end_at ? errors.end_at : ''}
                          required
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>

                      {/* Title Fields */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          id="title_en"
                          name="title_en"
                          label="Title (English)"
                          value={values.title_en || ''}
                          onChange={handleChange}
                          onBlur={() => {}}
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
                          label="Title (Myanmar)"
                          value={values.title_mm || ''}
                          onChange={handleChange}
                          onBlur={() => {}}
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
                          label="Description (English)"
                          value={values.description_en || ''}
                          onChange={handleChange}
                          onBlur={() => {}}
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
                          label="Description (Myanmar)"
                          value={values.description_mm || ''}
                          onChange={handleChange}
                          onBlur={() => {}}
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
                          label="Link"
                          value={values.link || ''}
                          onChange={handleChange}
                          onBlur={() => {}}
                          error={touched.link && Boolean(errors.link)}
                          helperText={touched.link ? errors.link : ''}
                          placeholder="https://example.com"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="link_type-label">Link Type</InputLabel>
                          <Select
                            labelId="link_type-label"
                            id="link_type"
                            name="link_type"
                            value={values.link_type || ''}
                            onChange={handleChange}
                            onBlur={() => {}}
                            label="Link Type"
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
                          onBlur={() => {}}
                          error={touched.link_text && Boolean(errors.link_text)}
                          helperText={touched.link_text ? errors.link_text : ''}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box>
                          <TextField
                            fullWidth
                            variant="outlined"
                            id="text_color_code"
                            name="text_color_code"
                            label="Text Color Code"
                            value={values.text_color_code || ''}
                            onChange={(e) => {
                              // Ensure value starts with # and is valid hex
                              let value = e.target.value;
                              if (value && !value.startsWith('#')) {
                                value = '#' + value;
                              }
                              // Limit to 7 characters (# + 6 hex digits)
                              if (value.length > 7) {
                                value = value.substring(0, 7);
                              }
                              setFieldValue('text_color_code', value);
                            }}
                            onBlur={() => {}}
                            error={touched.text_color_code && Boolean(errors.text_color_code)}
                            helperText={touched.text_color_code ? errors.text_color_code : 'Hex color code (e.g., #000000)'}
                            placeholder="#000000"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: '4px',
                                      backgroundColor: values.text_color_code || '#ffffff',
                                      border: '2px solid',
                                      borderColor: values.text_color_code ? 'transparent' : '#ccc',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      mr: 1,
                                      boxShadow: values.text_color_code ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                                    }}
                                  />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip title="Pick a color">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setTempColor(values.text_color_code || '#000000');
                                        setColorPickerOpen(true);
                                      }}
                                      sx={{
                                        color: values.text_color_code || 'inherit',
                                        '&:hover': {
                                          backgroundColor: 'action.hover',
                                        },
                                      }}
                                    >
                                      <ColorLensIcon />
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {values.text_color_code && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1.5,
                                borderRadius: 1,
                                backgroundColor: 'grey.50',
                                border: '1px solid',
                                borderColor: 'grey.300',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '4px',
                                  backgroundColor: values.text_color_code,
                                  border: '2px solid',
                                  borderColor: 'grey.300',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                              />
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  Preview
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {values.text_color_code}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} lg={4}>
                {/* Image Upload */}
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AD Image *
                    </Typography>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                    <SingleImageUpload
                      uploadedImage={uploadedImage}
                      onImageUpload={handleImageUpload}
                      onImageDelete={handleImageDeleteInFormik}
                      onUploadStart={() => setIsUploadingImage(true)}
                      onUploadProgress={(uploaded, total) => console.log(`Uploaded: ${uploaded}/${total}`)}
                      onUploadComplete={() => setIsUploadingImage(false)}
                      onUploadError={(error) => {
                        setIsUploadingImage(false);
                        showError(error);
                      }}
                    />
                    
                    {/* Image Size Warning Based on Display Location */}
                    {values.display_location && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          {values.display_location === 'home-page-asidebar' && (
                            <>Recommended image size: <strong>1920 x 1080 pixels (16:9 ratio)</strong>. Max file size: <strong>1.5 MB</strong></>
                          )}
                          {values.display_location === 'homepage_block' && (
                            <>Recommended image size: <strong>400-450 x 160 pixels (2.5:1 to 2.8:1 ratio)</strong>. Max file size: <strong>1.5 MB</strong></>
                          )}
                          {(values.display_location === 'detail-page-asidebar' ||
                            values.display_location === 'detail-page-asidebar-2') && (
                            <>Recommended image size: <strong>400 x 160 pixels (2.5:1 ratio)</strong>. Max file size: <strong>1.5 MB</strong></>
                          )}
                          {values.display_location === 'home_grid_ads' && (
                            <>
                              <strong>Home Grid ADS:</strong> Recommended <strong>1200 × 440 px</strong>. Max <strong>1.5 MB</strong>.
                            </>
                          )}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <FormActions
                  onSubmit={handleSubmit}
                  onCancel={() => navigate('/ads')}
                  submitText={updateADMutation.isPending ? "Updating AD..." : "Update AD"}
                  isSubmitting={updateADMutation.isPending}
                  isDisabled={updateADMutation.isPending || isUploadingImage}
                />
              </Grid>
            </Grid>
          </Form>
        );
      }}
      </Formik>

      {/* Color Picker Dialog */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Pick a Color</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
            {/* Large Color Preview */}
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: 2,
                backgroundColor: tempColor || '#000000',
                border: '3px solid',
                borderColor: 'grey.300',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: tempColor && tempColor !== '#000000' ? '#000000' : '#ffffff',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {tempColor || '#000000'}
              </Typography>
            </Box>

            {/* Native Color Picker */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
              <input
                type="color"
                value={tempColor || '#000000'}
                onChange={(e) => setTempColor(e.target.value)}
                style={{
                  width: '100%',
                  height: 60,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
              
              {/* Manual Hex Input */}
              <TextField
                fullWidth
                label="Hex Color Code"
                value={tempColor || ''}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value && !value.startsWith('#')) {
                    value = '#' + value;
                  }
                  if (value.length > 7) {
                    value = value.substring(0, 7);
                  }
                  setTempColor(value);
                }}
                placeholder="#000000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body2" color="textSecondary">#</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setColorPickerOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (formikSetFieldValue) {
                formikSetFieldValue('text_color_code', tempColor || '');
              }
              setColorPickerOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ADEditPage;