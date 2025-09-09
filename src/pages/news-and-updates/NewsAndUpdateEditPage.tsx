import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useUpdateNewsAndUpdate, useNewsAndUpdate } from '../../services/queries/news-and-updates';
import { useNewsArticleCategories } from '../../services/queries/news-article-categories';
import { useAlertSystem } from '../../hooks';
import { ActionAlert, PageLoadingState, PageErrorState } from '../../components/ui';
import SingleImageUpload from '../../components/ui/SingleImageUpload';
import { Media } from '../../types/media';

interface FormData {
  title_en: string;
  title_mm: string;
  news_article_category_id: number;
  short_description: string;
  main_content: string;
  writer_name: string;
  is_active: boolean;
  tag: string[];
  media_id: number | null;
}

interface FormErrors {
  title_en?: string;
  title_mm?: string;
  news_article_category_id?: string;
  short_description?: string;
  main_content?: string;
  writer_name?: string;
  media_id?: string;
}

const NewsAndUpdateEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Alert system hook
  const { alert, showError, showSuccess, clearAlert } = useAlertSystem();
  
  // Media state
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title_en: '',
    title_mm: '',
    news_article_category_id: 0,
    short_description: '',
    main_content: '',
    writer_name: '',
    is_active: true,
    tag: [],
    media_id: null,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');
  
  // Get news data
  const { data: newsResponse, isLoading, error, refetch } = useNewsAndUpdate(slug || '');
  
  // Get categories for dropdown
  const { data: categoriesResponse } = useNewsArticleCategories({
    type: 'news_update',
    per_page: 100,
  });
  
  // Update mutation
  const updateNewsAndUpdateMutation = useUpdateNewsAndUpdate();
  
  const categories = categoriesResponse?.data || [];
  
  // Initialize form data when news data is loaded
  useEffect(() => {
    if (newsResponse?.data) {
      const news = newsResponse.data;
      setFormData({
        title_en: news.title_en || '',
        title_mm: news.title_mm || '',
        news_article_category_id: news.category?.id || 0,
        short_description: news.short_description || '',
        main_content: news.main_content || '',
        writer_name: news.writer_name || '',
        is_active: news.is_active ?? true,
        tag: news.tag || [],
        media_id: news.images?.id || null,
      });
      
      // Set uploaded media if exists
      if (news.images) {
        // Convert images data to Media format
        const mediaData: Media = {
          id: news.images.id,
          type: 'image' as const,
          filename: news.images.file_name,
          size: 0, // Not available in images data
          formatted_size: '0 B', // Not available in images data
          mime_type: 'image/jpeg', // Default, not available in images data
          is_primary: null,
          status: 'completed' as const,
          url: news.images.url,
          created_at: '', // Not available in images data
        };
        setUploadedMedia([mediaData]);
      }
    }
  }, [newsResponse]);
  
  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title_en.trim()) {
      newErrors.title_en = 'English title is required';
    }
    
    if (!formData.title_mm.trim()) {
      newErrors.title_mm = 'Myanmar title is required';
    }
    
    if (!formData.news_article_category_id) {
      newErrors.news_article_category_id = 'Category is required';
    }
    
    if (!formData.short_description.trim()) {
      newErrors.short_description = 'Short description is required';
    }
    
    if (!formData.main_content.trim()) {
      newErrors.main_content = 'Main content is required';
    }
    
    if (!formData.writer_name.trim()) {
      newErrors.writer_name = 'Writer name is required';
    }
    
    if (!formData.media_id) {
      newErrors.media_id = 'News image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form field changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Handle tag input
  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };
  
  const handleTagInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tag.includes(newTag)) {
        handleInputChange('tag', [...formData.tag, newTag]);
      }
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tag', formData.tag.filter(tag => tag !== tagToRemove));
  };
  
  // Media upload handlers
  const handleMediaUpload = (media: Media) => {
    setUploadedMedia([media]);
    handleInputChange('media_id', media.id);
    // Clear media_id error when image is uploaded
    if (errors.media_id) {
      setErrors(prev => ({ ...prev, media_id: undefined }));
    }
  };
  
  const handleMediaDelete = () => {
    setUploadedMedia([]);
    handleInputChange('media_id', null);
  };
  
  const handleUploadStart = () => {
    // Handle upload start if needed
  };
  
  const handleUploadProgress = (_uploaded: number, _total: number) => {
    // Handle upload progress if needed
  };
  
  const handleUploadComplete = () => {
    // Handle upload complete if needed
  };
  
  const handleUploadError = (error: string) => {
    showError(error);
  };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!slug) {
      showError('Invalid news & update identifier');
      return;
    }
    
    try {
      await updateNewsAndUpdateMutation.mutateAsync({
        slug,
        data: {
          title_en: formData.title_en,
          title_mm: formData.title_mm,
          news_article_category_id: formData.news_article_category_id,
          short_description: formData.short_description,
          main_content: formData.main_content,
          writer_name: formData.writer_name,
          is_active: formData.is_active,
          tag: formData.tag,
          media_id: formData.media_id!,
        },
      });
      
      showSuccess('News & Update updated successfully!');
      navigate(`/news-and-updates/${slug}?success=${encodeURIComponent('News & Update updated successfully!')}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to update news & update. Please try again.';
      showError(errorMessage);
    }
  };
  
  const handleCancel = () => {
    navigate(`/news-and-updates/${slug}`);
  };
  
  const handleBack = () => {
    navigate('/news-and-updates');
  };
  
  // Loading and error states
  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={refetch} />;
  if (!newsResponse?.data) return <PageErrorState error={new Error('News & Update not found')} onRetry={refetch} />;
  
  return (
    <Box>
      {/* Alert System */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />
      
      {/* Page Header */}
      <PageHeader
        title="Edit News & Update"
        subtitle="Update news & update information"
        breadcrumbs={`Dashboard / Content Management / News & Updates / ${newsResponse.data.title_en} / Edit`}
        actionButton={{
          text: 'Back to News & Updates',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="English Title"
                value={formData.title_en}
                onChange={(e) => handleInputChange('title_en', e.target.value)}
                error={!!errors.title_en}
                helperText={errors.title_en}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Myanmar Title"
                value={formData.title_mm}
                onChange={(e) => handleInputChange('title_mm', e.target.value)}
                error={!!errors.title_mm}
                helperText={errors.title_mm}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.news_article_category_id} required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.news_article_category_id}
                  onChange={(e) => handleInputChange('news_article_category_id', e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name_en}
                    </MenuItem>
                  ))}
                </Select>
                {errors.news_article_category_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.news_article_category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Writer Name"
                value={formData.writer_name}
                onChange={(e) => handleInputChange('writer_name', e.target.value)}
                error={!!errors.writer_name}
                helperText={errors.writer_name}
                required
              />
            </Grid>
            
            {/* Content */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Content
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                error={!!errors.short_description}
                helperText={errors.short_description}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Content"
                value={formData.main_content}
                onChange={(e) => handleInputChange('main_content', e.target.value)}
                error={!!errors.main_content}
                helperText={errors.main_content}
                multiline
                rows={8}
                required
              />
            </Grid>
            
            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Tags
              </Typography>
              <TextField
                fullWidth
                label="Add Tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Type a tag and press Enter"
                helperText="Press Enter to add a tag"
              />
              {formData.tag.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tag.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Grid>
            
            {/* Media Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                News Image
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
              {errors.media_id && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.media_id}
                </Typography>
              )}
            </Grid>
            
            {/* Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Status
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label={formData.is_active ? 'Active' : 'Inactive'}
              />
            </Grid>
            
            {/* Form Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={updateNewsAndUpdateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={updateNewsAndUpdateMutation.isPending}
                >
                  {updateNewsAndUpdateMutation.isPending ? 'Updating...' : 'Update News & Update'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default NewsAndUpdateEditPage;
