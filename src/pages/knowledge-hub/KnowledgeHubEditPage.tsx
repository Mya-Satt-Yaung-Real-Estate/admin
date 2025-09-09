import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, SingleImageUpload, PageLoadingState, PageErrorState } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useUpdateKnowledgeHub, useKnowledgeHub, useKnowledgeHubCategories } from '../../services/queries/knowledge-hub';
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

const KnowledgeHubEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Alert system hook
  const { alert, showError, showSuccess, clearAlert } = useAlertSystem();
  
  // Media state
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  
  // Get knowledge hub data
  const { data: knowledgeHubResponse, isLoading, error, refetch } = useKnowledgeHub(slug || '');
  
  // Get categories for dropdown
  const { data: categoriesResponse, isLoading: categoriesLoading } = useKnowledgeHubCategories({
    type: 'knowledge_hub',
    per_page: 100,
  });
  
  // Update mutation
  const updateKnowledgeHubMutation = useUpdateKnowledgeHub();
  
  // Form state
  const [tagInput, setTagInput] = useState('');

  // Filter categories to show only active, non-deleted knowledge_hub categories
  const categories = (categoriesResponse?.data || []).filter(category => 
    category.type === 'knowledge_hub' && 
    category.is_active && 
    !category.deleted_at
  );

  // Initialize form data when knowledge hub data is loaded
  useEffect(() => {
    if (knowledgeHubResponse?.data) {
      const knowledgeHub = knowledgeHubResponse.data;
      
      // Set form values
      formik.setValues({
        title_en: knowledgeHub.title_en || '',
        title_mm: knowledgeHub.title_mm || '',
        short_description: knowledgeHub.short_description || '',
        main_content: knowledgeHub.main_content || '',
        news_article_category_id: knowledgeHub.category?.id || 0,
        media_id: knowledgeHub.images?.id || 0,
        writer_name: knowledgeHub.writer_name || '',
        tag: knowledgeHub.tag || [],
        is_active: knowledgeHub.is_active ?? true,
      });

      // Set uploaded media if exists
      if (knowledgeHub.images) {
        // Convert the images object to Media type
        const media: Media = {
          id: knowledgeHub.images.id,
          type: knowledgeHub.images.type === 'image' ? 'image' : 'video',
          filename: knowledgeHub.images.file_name,
          size: 0, // We don't have size info from the API
          formatted_size: 'Unknown',
          mime_type: 'image/*', // We don't have mime_type info from the API
          is_primary: null,
          status: 'completed',
          url: knowledgeHub.images.url,
          created_at: '',
        };
        setUploadedMedia([media]);
      }
    }
  }, [knowledgeHubResponse?.data]);

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

  // Upload progress handlers
  const handleUploadStart = () => {
    // Handle upload start if needed
  };

  const handleUploadProgress = (_progress: number) => {
    // Handle upload progress if needed
  };

  const handleUploadComplete = () => {
    // This will be called by SingleImageUpload when upload is complete
    // The actual media will be passed to handleMediaUpload via onImageUpload
  };

  const handleUploadError = (error: string) => {
    showError(`Upload failed: ${error}`);
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      title_en: '',
      title_mm: '',
      short_description: '',
      main_content: '',
      news_article_category_id: 0,
      media_id: 0,
      writer_name: '',
      tag: [] as string[],
      is_active: true,
    },
    validationSchema,
    enableReinitialize: false,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await updateKnowledgeHubMutation.mutateAsync({
          slug: slug!,
          data: {
            title_en: values.title_en,
            title_mm: values.title_mm,
            short_description: values.short_description,
            main_content: values.main_content,
            news_article_category_id: values.news_article_category_id,
            media_id: values.media_id,
            writer_name: values.writer_name,
            tag: values.tag,
            is_active: values.is_active,
          },
        });
        
        showSuccess('Knowledge Hub updated successfully!');
        navigate(`/knowledge-hub/${slug}?success=${encodeURIComponent('Knowledge Hub updated successfully!')}`);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Failed to update knowledge hub. Please try again.';
        showError(errorMessage);
      }
    },
  });

  // Event handlers
  const handleBack = () => navigate('/knowledge-hub');
  const handleCancel = () => navigate(`/knowledge-hub/${slug}`);

  // Loading and error states
  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={refetch} />;
  if (!knowledgeHubResponse?.data) return <PageErrorState error={new Error('Knowledge Hub not found')} onRetry={refetch} />;

  return (
    <Box>
      {/* Alert System */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Page Header */}
      <PageHeader
        title="Edit Knowledge Hub"
        subtitle="Update knowledge hub article information"
        breadcrumbs={`Dashboard / Content Management / Knowledge Hub / ${knowledgeHubResponse.data.title_en} / Edit`}
        actionButton={{
          text: 'Back to Knowledge Hub',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
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
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="English Title"
                      name="title_en"
                      value={formik.values.title_en}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.title_en && Boolean(formik.errors.title_en)}
                      helperText={formik.touched.title_en && formik.errors.title_en}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Myanmar Title"
                      name="title_mm"
                      value={formik.values.title_mm}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.title_mm && Boolean(formik.errors.title_mm)}
                      helperText={formik.touched.title_mm && formik.errors.title_mm}
                      required
                    />
                  </Grid>

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
                          label="Knowledge Hub Category"
                          error={formik.touched.news_article_category_id && Boolean(formik.errors.news_article_category_id)}
                          helperText={formik.touched.news_article_category_id && formik.errors.news_article_category_id}
                          required
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2">{option.name_en}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.name_mm}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Writer Name"
                      name="writer_name"
                      value={formik.values.writer_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.writer_name && Boolean(formik.errors.writer_name)}
                      helperText={formik.touched.writer_name && formik.errors.writer_name}
                      required
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
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Short Description"
                      name="short_description"
                      value={formik.values.short_description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.short_description && Boolean(formik.errors.short_description)}
                      helperText={formik.touched.short_description && formik.errors.short_description}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Main Content"
                      name="main_content"
                      value={formik.values.main_content}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.main_content && Boolean(formik.errors.main_content)}
                      helperText={formik.touched.main_content && formik.errors.main_content}
                      multiline
                      rows={8}
                      sx={{
                        '& .MuiInputBase-root': {
                          resize: 'none',
                        },
                        '& .MuiInputBase-input': {
                          resize: 'none',
                        },
                      }}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Media and Status & Tags Row */}
          <Grid item xs={12} md={6}>
            {/* Media Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Media
                </Typography>
                
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
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.is_active}
                          onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Active"
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
                    disabled={updateKnowledgeHubMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      updateKnowledgeHubMutation.isPending ||
                      !formik.values.title_en ||
                      !formik.values.title_mm ||
                      !formik.values.short_description ||
                      !formik.values.main_content ||
                      !formik.values.news_article_category_id ||
                      !formik.values.media_id ||
                      !formik.values.writer_name
                    }
                    startIcon={updateKnowledgeHubMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {updateKnowledgeHubMutation.isPending ? 'Updating...' : 'Update Knowledge Hub'}
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

export default KnowledgeHubEditPage;
