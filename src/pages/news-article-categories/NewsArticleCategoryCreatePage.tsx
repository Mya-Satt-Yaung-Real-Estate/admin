import React, { useState } from 'react';
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
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useCreateNewsArticleCategory } from '../../services/queries/news-article-categories';
import { useAlertSystem } from '../../hooks';
import { ActionAlert } from '../../components/ui';

interface FormData {
  name_en: string;
  name_mm: string;
  description: string;
  type: 'news_update' | 'knowledge_hub';
  is_active: boolean;
}

const NewsArticleCategoryCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // Create mutation
  const createNewsArticleCategoryMutation = useCreateNewsArticleCategory();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name_en: '',
    name_mm: '',
    description: '',
    type: 'news_update',
    is_active: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!formData.name_en?.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (!formData.name_mm?.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Submit form
    createNewsArticleCategoryMutation.mutate(
      {
        name_en: formData.name_en.trim(),
        name_mm: formData.name_mm.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        is_active: formData.is_active,
      },
      {
        onSuccess: () => {
          navigate('/news-article-categories?success=' + encodeURIComponent('Content category created successfully!'));
        },
        onError: (error: any) => {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to create content category. Please try again.';
          showError(errorMessage, true);
        },
      }
    );
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Content Category"
        breadcrumbs="Dashboard / Master Data / Content Categories / Create"
        subtitle="Add a new content category"
        actionButton={{
          text: 'Back to Content Categories',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/news-article-categories')
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          {/* English Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="English Name"
              value={formData.name_en || ''}
              onChange={(e) => handleFieldChange('name_en', e.target.value)}
              error={!!errors.name_en}
              helperText={errors.name_en}
              required
            />
          </Grid>

          {/* Myanmar Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Myanmar Name (မြန်မာနာမည်)"
              value={formData.name_mm || ''}
              onChange={(e) => handleFieldChange('name_mm', e.target.value)}
              error={!!errors.name_mm}
              helperText={errors.name_mm}
              required
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                label="Type"
              >
                <MenuItem value="news_update">News & Updates</MenuItem>
                <MenuItem value="knowledge_hub">Knowledge Hub</MenuItem>
              </Select>
              {errors.type && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                  {errors.type}
                </Box>
              )}
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
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
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              multiline
              rows={3}
              helperText="Optional description for this content category"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/news-article-categories')}
                disabled={createNewsArticleCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={createNewsArticleCategoryMutation.isPending}
              >
                {createNewsArticleCategoryMutation.isPending ? 'Creating...' : 'Create Content Category'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default NewsArticleCategoryCreatePage;
