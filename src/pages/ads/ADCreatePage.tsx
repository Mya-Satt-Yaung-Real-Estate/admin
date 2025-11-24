import React, { useState } from 'react';
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
} from '@mui/material';
import { ColorLens as ColorLensIcon } from '@mui/icons-material';
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
    .oneOf(['homepage_block', 'home-page-asidebar', 'detail-page-asidebar'], 'Please select a display location')
    .required('Display location is required'),
  start_at: Yup.string()
    .required('Start date is required'),
  end_at: Yup.string()
    .required('End date is required')
    .test('end-after-start', 'End date must be after start date', function(value) {
      const { start_at } = this.parent;
      if (!start_at || !value) return true;
      return new Date(value) > new Date(start_at);
    }),
  media_id: Yup.number()
    .required('Please upload an image')
    .min(1, 'Please upload an image')
    .test('media-required', 'Please upload an image', function(value) {
      return value > 0;
    }),
  // Link text is required if link has value and link_type is not image_link
  link_text: Yup.string().nullable().when(['link', 'link_type'], {
    is: (link: string, link_type: string) => 
      link && link.length > 0 && link_type && link_type !== 'image_link',
    then: (schema) => schema.required('Link text is required when link is provided and link type is not image link'),
    otherwise: (schema) => schema.nullable(),
  }),
  text_color_code: Yup.string()
    .nullable()
    .test('hex-color', 'Must be a valid hex color code (e.g., #000000)', function(value) {
      if (!value || value.length === 0) return true; // Allow empty/null
      return /^#[0-9A-Fa-f]{6}$/.test(value);
    }),
  payment_date: Yup.string().nullable(),
});

// ============================================================================
// COMPONENT
// ============================================================================

const ADCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<Media | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState<string>('');

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
    validateOnMount: true,
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
      text_color_code: '',
      price: 0,
      status: true,
      is_paid: false,
      is_published: false,
      display_location: '',
      payment_date: '',
      start_at: '',
      end_at: '',
      media_id: 0,
    },
    validationSchema,
    onSubmit: async (values, { setTouched }) => {
      // Mark all required fields as touched to show validation errors on submit
      setTouched({
        display_location: true,
        start_at: true,
        end_at: true,
        media_id: true,
        link_text: true,
      });

      try {
        console.log('Form submission started');
        console.log('Form values:', values);

        // Prepare media ID - use uploaded image ID if available, otherwise use form value
        const mediaId = uploadedImage?.id || values.media_id;

        // Filter out undefined values and ensure required fields are present
        const adData: ADFormData = {
          ...values,
          link_type: values.link_type as "button_link" | "text_link" | "image_link",
          display_location: values.display_location as "homepage_block" | "home-page-asidebar" | "detail-page-asidebar",
          media_id: mediaId,
        };

        console.log('AD data to submit:', adData);
        const response = await createADMutation.mutateAsync(adData);

        // Use the id from the response to navigate
        const adId = response.data?.data?.id;
        if (adId) {
          navigate(`/ads/${adId}?success=${encodeURIComponent('AD created successfully!')}`);
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
                        <MenuItem value="homepage_block">Homepage Block</MenuItem>
                        <MenuItem value="home-page-asidebar">Home Page Sidebar</MenuItem>
                        <MenuItem value="detail-page-asidebar">Detail Page Sidebar</MenuItem>
                      </Select>
                      {formik.touched.display_location && formik.errors.display_location && (
                        <FormHelperText error>
                          {formik.errors.display_location as string}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Status Switches */}
                  <Grid item xs={12} sm={6}>
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

                  {/* Date Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      id="start_at"
                      name="start_at"
                      label="Start Date *"
                      type="date"
                      value={formik.values.start_at || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.start_at && Boolean(formik.errors.start_at)}
                      helperText={formik.touched.start_at ? formik.errors.start_at : ''}
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
                      value={formik.values.end_at || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.end_at && Boolean(formik.errors.end_at)}
                      helperText={formik.touched.end_at ? formik.errors.end_at : ''}
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
                      value={formik.values.title_en || ''}
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
                      label="Title (Myanmar)"
                      value={formik.values.title_mm || ''}
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
                      label="Description (English)"
                      value={formik.values.description_en || ''}
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
                      label="Description (Myanmar)"
                      value={formik.values.description_mm || ''}
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
                      label="Link"
                      value={formik.values.link || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.link && Boolean(formik.errors.link)}
                      helperText={formik.touched.link ? formik.errors.link : ''}
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
                        value={formik.values.link_type || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Link Type"
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
                      helperText={formik.touched.link_text ? formik.errors.link_text : ''}
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
                        value={formik.values.text_color_code || ''}
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
                          formik.setFieldValue('text_color_code', value);
                        }}
                        onBlur={formik.handleBlur}
                        error={formik.touched.text_color_code && Boolean(formik.errors.text_color_code)}
                        helperText={formik.touched.text_color_code ? formik.errors.text_color_code : 'Hex color code (e.g., #000000)'}
                        placeholder="#000000"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '4px',
                                  backgroundColor: formik.values.text_color_code || '#ffffff',
                                  border: '2px solid',
                                  borderColor: formik.values.text_color_code ? 'transparent' : '#ccc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1,
                                  boxShadow: formik.values.text_color_code ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
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
                                    setTempColor(formik.values.text_color_code || '#000000');
                                    setColorPickerOpen(true);
                                  }}
                                  sx={{
                                    color: formik.values.text_color_code || 'inherit',
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
                      {formik.values.text_color_code && (
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
                              backgroundColor: formik.values.text_color_code,
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
                              {formik.values.text_color_code}
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
                  onImageDelete={handleImageDelete}
                  onUploadStart={() => setIsUploadingImage(true)}
                  onUploadProgress={(uploaded, total) => console.log(`Uploaded: ${uploaded}/${total}`)}
                  onUploadComplete={() => setIsUploadingImage(false)}
                  onUploadError={(error) => {
                    setIsUploadingImage(false);
                    showError(error);
                  }}
                />
                {formik.touched.media_id && formik.errors.media_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formik.errors.media_id}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <FormActions
              onSubmit={formik.handleSubmit}
              onCancel={() => navigate('/ads')}
              submitText={createADMutation.isPending ? "Creating AD..." : "Create AD"}
              isSubmitting={createADMutation.isPending}
              isDisabled={createADMutation.isPending || isUploadingImage}
            />
          </Grid>
        </Grid>
      </form>

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
              formik.setFieldValue('text_color_code', tempColor || '');
              formik.setFieldTouched('text_color_code', true);
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

export default ADCreatePage;