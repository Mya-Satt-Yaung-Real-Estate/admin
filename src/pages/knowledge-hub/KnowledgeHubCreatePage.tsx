import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Autocomplete,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, SingleImageUpload } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateKnowledgeHub, useKnowledgeHubCategories } from '../../services/queries/knowledge-hub';
import { Media } from '../../types/media';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const validationSchema = Yup.object({
  title_en: Yup.string()
    .required('English title is required')
    .max(255, 'Title must be less than 255 characters'),
  title_mm: Yup.string()
    .required('Myanmar title is required')
    .max(255, 'Title must be less than 255 characters'),
  short_description: Yup.string()
    .required('Short description is required')
    .max(500, 'Short description must be less than 500 characters'),
  main_content: Yup.string()
    .required('Main content is required')
    .max(10000, 'Main content must be less than 10000 characters'),
  news_article_category_id: Yup.number()
    .required('Knowledge hub category is required')
    .positive('Please select a valid category'),
  media_id: Yup.number()
    .required('Media is required')
    .positive('Please upload a media file'),
  writer_name: Yup.string()
    .required('Writer name is required')
    .max(255, 'Writer name must be less than 255 characters'),
});

// ============================================================================
// COMPONENT
// ============================================================================

const KnowledgeHubCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Media state
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  
  // Get categories for dropdown
  const { data: categoriesResponse, isLoading: categoriesLoading } = useKnowledgeHubCategories({
    type: 'knowledge_hub',
    per_page: 100,
  });
  
  // Create mutation
  const createKnowledgeHubMutation = useCreateKnowledgeHub();

  // Form state
  const [tagInput, setTagInput] = useState('');

  // Filter categories to show only active, non-deleted knowledge_hub categories
  const categories = (categoriesResponse?.data || []).filter(category => 
    category.type === 'knowledge_hub' && 
    category.is_active && 
    !category.deleted_at
  );


  // Handle tag input
  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  const handleTagInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    const currentTags = formik.values.tag as string[] || [];
    if (tag && !currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      formik.setFieldValue('tag', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formik.values.tag as string[] || [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    formik.setFieldValue('tag', newTags);
  };

  // Media upload handlers
  const handleMediaUpload = (media: Media) => {
    setUploadedMedia([media]);
    formik.setFieldValue('media_id', media.id);
    formik.setFieldTouched('media_id', true);
    // Clear any validation errors for media_id
    if (formik.errors.media_id) {
      formik.setFieldError('media_id', undefined);
    }
  };

  const handleMediaDelete = (mediaId: number) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== mediaId));
    formik.setFieldValue('media_id', 0);
    formik.setFieldTouched('media_id', true);
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

  const handleUploadError = (_error: string) => {
    // Upload error handler
  };

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();

  // Formik Form
  const formik = useFormik({
    enableReinitialize: false,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      title_en: '',
      title_mm: '',
      short_description: '',
      main_content: '',
      news_article_category_id: 0,
      media_id: 0,
      writer_name: '',
      tag: [],
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form submission started');
        console.log('Form values:', values);
        
        const response = await createKnowledgeHubMutation.mutateAsync(values);
        
        console.log('Knowledge hub created successfully:', response);
        
        // Navigate to knowledge hub detail page with success message
        const knowledgeHubSlug = response.data?.slug;
        if (knowledgeHubSlug) {
          navigate(`/knowledge-hub/${knowledgeHubSlug}?success=${encodeURIComponent('Knowledge hub created successfully!')}`);
        } else {
          navigate('/knowledge-hub');
        }
        
      } catch (error: any) {
        console.error('Error creating knowledge hub:', error);
        
        // Show API response error message if available, otherwise show generic message
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Failed to create knowledge hub';
        showError(errorMessage);
      }
    },
  });

  // Event handlers
  const handleBack = () => navigate('/knowledge-hub');

  const handleCancel = () => {
    if (formik.dirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        handleBack();
      }
    } else {
      handleBack();
    }
  };

  return (
    <Box>
      {/* Alert System */}
      <ActionAlert
        success={alert.success}
        error={alert.error}
        onClose={clearAlert}
      />

      {/* Back Button - Right aligned */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          color="primary"
        >
          Back to Knowledge Hub
        </Button>
      </Box>

      {/* Page Header */}
      <PageHeader
        title="Create Knowledge Hub"
        subtitle="Create a new knowledge hub article"
      />

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Article Information Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Article Information
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                <Grid container spacing={3}>
                  {/* English Title */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={
                        <span>
                          English Title <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                        </span>
                      }
                      name="title_en"
                      value={formik.values.title_en}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.title_en && Boolean(formik.errors.title_en)}
                      helperText={formik.touched.title_en && formik.errors.title_en}
                    />
                  </Grid>

                  {/* Myanmar Title */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={
                        <span>
                          Myanmar Title (မြန်မာခေါင်းစဉ်) <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                        </span>
                      }
                      name="title_mm"
                      value={formik.values.title_mm}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.title_mm && Boolean(formik.errors.title_mm)}
                      helperText={formik.touched.title_mm && formik.errors.title_mm}
                    />
                  </Grid>

                  {/* Category */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      size="small"
                      options={categories}
                      getOptionLabel={(option) => option.name_en}
                      value={categories.find(cat => cat.id === formik.values.news_article_category_id) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('news_article_category_id', newValue?.id || 0);
                      }}
                      loading={categoriesLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <span>
                              Category <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                            </span>
                          }
                          error={formik.touched.news_article_category_id && Boolean(formik.errors.news_article_category_id)}
                          helperText={formik.touched.news_article_category_id && formik.errors.news_article_category_id}
                        />
                      )}
                    />
                  </Grid>

                  {/* Writer Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={
                        <span>
                          Writer Name <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                        </span>
                      }
                      name="writer_name"
                      value={formik.values.writer_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.writer_name && Boolean(formik.errors.writer_name)}
                      helperText={formik.touched.writer_name && formik.errors.writer_name}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Content Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Content
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                <Grid container spacing={3}>
                  {/* Short Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label={
                        <span>
                          Short Description <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                        </span>
                      }
                      name="short_description"
                      value={formik.values.short_description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      multiline
                      rows={3}
                      error={formik.touched.short_description && Boolean(formik.errors.short_description)}
                      helperText={formik.touched.short_description && formik.errors.short_description}
                    />
                  </Grid>

                  {/* Main Content */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label={
                        <span>
                          Main Content <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                        </span>
                      }
                      name="main_content"
                      value={formik.values.main_content}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      multiline
                      minRows={16}
                      maxRows={40}
                      error={formik.touched.main_content && Boolean(formik.errors.main_content)}
                      helperText={formik.touched.main_content && formik.errors.main_content}
                      sx={{
                        '& .MuiInputBase-input': {
                          resize: 'vertical',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Media & Settings Cards - Same Row */}
          <Grid item xs={12} md={6}>
            {/* Media Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Media
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                <SingleImageUpload
                  uploadedImage={uploadedMedia[0] || null}
                  onImageUpload={handleMediaUpload}
                  onImageDelete={handleMediaDelete}
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
                
                {/* Media Validation Error */}
                {formik.touched.media_id && formik.errors.media_id && formik.values.media_id === 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="error">
                      {formik.errors.media_id}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Status & Tags Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Status & Tags
                </Typography>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 2 }} />

                <Grid container spacing={3}>
                  {/* Status */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.is_active}
                          onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Active Status"
                    />
                  </Grid>

                  {/* Tags */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tags"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Type a tag and press Enter"
                      helperText="Press Enter to add a tag"
                    />
                    
                    {/* Display Tags */}
                    {formik.values.tag && formik.values.tag.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(formik.values.tag as string[]).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            onDelete={() => removeTag(tag)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              '& .MuiChip-deleteIcon': {
                                color: 'red',
                                fontSize: '18px',
                                '&:hover': {
                                  color: 'darkred',
                                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={createKnowledgeHubMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      createKnowledgeHubMutation.isPending ||
                      !formik.values.title_en ||
                      !formik.values.title_mm ||
                      !formik.values.short_description ||
                      !formik.values.main_content ||
                      !formik.values.news_article_category_id ||
                      !formik.values.media_id ||
                      !formik.values.writer_name
                    }
                    startIcon={createKnowledgeHubMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {createKnowledgeHubMutation.isPending ? 'Creating...' : 'Create Knowledge Hub'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default KnowledgeHubCreatePage;
