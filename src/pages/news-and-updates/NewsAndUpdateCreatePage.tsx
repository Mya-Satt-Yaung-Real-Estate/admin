import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useCreateNewsAndUpdate } from '../../services/queries/news-and-updates';
import { useNewsArticleCategories } from '../../services/queries/news-article-categories';
import { useAlertSystem } from '../../hooks';
import { ActionAlert } from '../../components/ui';
import SingleImageUpload from '../../components/ui/SingleImageUpload';
import { Media } from '../../types/media';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

const NewsAndUpdateCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // Media state
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  
  // Get categories for dropdown
  const { data: categoriesResponse } = useNewsArticleCategories({
    type: 'news_update',
    per_page: 100,
  });
  
  // Create mutation
  const createNewsAndUpdateMutation = useCreateNewsAndUpdate();

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState('');

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'blockquote'],
      ['clean'],
    ],
  };

  const getPlainTextFromHtml = (html: string): string =>
    html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Filter categories to show only active, non-deleted news_update categories
  const categories = (categoriesResponse?.data || []).filter(category => 
    category.type === 'news_update' && 
    category.is_active && 
    !category.deleted_at
  );

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
    if (tag && !formData.tag.includes(tag)) {
      setFormData(prev => ({ ...prev, tag: [...prev.tag, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tag: prev.tag.filter(tag => tag !== tagToRemove) }));
  };

  // Media handling functions
  const handleMediaUpload = (media: Media) => {
    // For single image upload, replace any existing image
    setUploadedMedia([media]);
    setFormData(prev => ({ ...prev, media_id: media.id }));
    // Clear media_id error when user uploads an image
    if (errors.media_id) {
      setErrors(prev => ({ ...prev, media_id: '' }));
    }
  };

  const handleMediaDelete = (mediaId: number) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== mediaId));
    setFormData(prev => ({ ...prev, media_id: null }));
  };

  const handleUploadStart = () => {
    // Upload start handler - can be used for loading states if needed
  };

  const handleUploadProgress = (_uploaded: number, _total: number) => {
    // Upload progress handler - can be used for progress indicators if needed
  };

  const handleUploadComplete = () => {
    // Upload complete handler - can be used for success states if needed
  };

  const handleUploadError = (error: string) => {
    showError(error, true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

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

    if (!getPlainTextFromHtml(formData.main_content)) {
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

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    createNewsAndUpdateMutation.mutate(
      {
        title_en: formData.title_en.trim(),
        title_mm: formData.title_mm.trim(),
        news_article_category_id: formData.news_article_category_id,
        short_description: formData.short_description.trim(),
        main_content: formData.main_content,
        writer_name: formData.writer_name.trim(),
        is_active: formData.is_active,
        tag: formData.tag,
        media_id: formData.media_id!,
      },
      {
        onSuccess: () => {
          navigate('/news-and-updates?success=' + encodeURIComponent('News & Update created successfully!'));
        },
        onError: (error: any) => {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to create news & update. Please try again.';
          showError(errorMessage, true);
        },
      }
    );
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create News & Update"
        breadcrumbs="Dashboard / Content Management / News & Updates / Create"
        subtitle="Add a new news & update"
        actionButton={{
          text: 'Back to News & Updates',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/news-and-updates')
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Card 1: Article Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Article Information
            </Typography>
            <Grid container spacing={3}>
              {/* English Title */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="English Title"
                  value={formData.title_en}
                  onChange={(e) => handleFieldChange('title_en', e.target.value)}
                  error={!!errors.title_en}
                  helperText={errors.title_en}
                  required
                />
              </Grid>

              {/* Myanmar Title */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Myanmar Title (မြန်မာခေါင်းစဉ်)"
                  value={formData.title_mm}
                  onChange={(e) => handleFieldChange('title_mm', e.target.value)}
                  error={!!errors.title_mm}
                  helperText={errors.title_mm}
                  required
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required error={!!errors.news_article_category_id}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.news_article_category_id}
                    label="Category"
                    onChange={(e) => handleFieldChange('news_article_category_id', Number(e.target.value))}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name_en}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.news_article_category_id && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                      {errors.news_article_category_id}
                    </Box>
                  )}
                </FormControl>
              </Grid>

              {/* Writer Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Writer Name"
                  value={formData.writer_name}
                  onChange={(e) => handleFieldChange('writer_name', e.target.value)}
                  error={!!errors.writer_name}
                  helperText={errors.writer_name}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 2: Content */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Content
            </Typography>
            <Grid container spacing={3}>
              {/* Short Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Short Description"
                  value={formData.short_description}
                  onChange={(e) => handleFieldChange('short_description', e.target.value)}
                  error={!!errors.short_description}
                  helperText={errors.short_description}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              {/* Main Content */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Main Content *
                </Typography>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: errors.main_content ? 'error.main' : 'divider',
                    borderRadius: 1,
                    '& .ql-editor': {
                      minHeight: 260,
                    },
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={formData.main_content}
                    onChange={(value) => handleFieldChange('main_content', value)}
                    modules={quillModules}
                  />
                </Box>
                {errors.main_content && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {errors.main_content}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Card 3: Media & Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Media & Settings
            </Typography>
            <Grid container spacing={3}>
              {/* Left Side: Tags and Status */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  Status & Tags
                </Typography>
                
                {/* Status */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => handleFieldChange('is_active', e.target.value === 'true')}
                    label="Status"
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>

                {/* Tags */}
                <FormControl fullWidth size="small">
                  <InputLabel>Tags</InputLabel>
                  <OutlinedInput
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyPress={handleTagInputKeyPress}
                    label="Tags"
                    placeholder="Type a tag and press Enter"
                  />
                  {formData.tag.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.tag.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => removeTag(tag)}
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
                </FormControl>
              </Grid>

              {/* Right Side: News Image */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
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
            </Grid>
          </CardContent>
        </Card>

        {/* Card 4: Actions */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/news-and-updates')}
                disabled={createNewsAndUpdateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={createNewsAndUpdateMutation.isPending}
              >
                {createNewsAndUpdateMutation.isPending ? 'Creating...' : 'Create News & Update'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NewsAndUpdateCreatePage;
