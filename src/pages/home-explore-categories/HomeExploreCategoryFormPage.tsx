import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Cancel as CancelIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, LoadingSpinner, PageErrorState } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import {
  useCreateHomeExploreCategory,
  useHomeExploreCategory,
  useUpdateHomeExploreCategory,
} from '../../services/queries/homeExploreCategories';
import {
  HOME_EXPLORE_CATEGORY_ICON_OPTIONS,
  HOME_EXPLORE_CATEGORY_MAX_ACTIVE,
  HomeExploreCategoryFormData,
} from '../../types/homeExploreCategory';
import { isValidExploreCategoryLink } from '../../lib/exploreCategoryLink';

const defaultFormData: HomeExploreCategoryFormData = {
  title_en: '',
  title_mm: '',
  description_en: '',
  description_mm: '',
  link_path: 'https://jadeproperty.com.mm/',
  icon_key: 'home',
  sort_order: 1,
  is_active: true,
};

const HomeExploreCategoryFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id || 0);
  const isEditMode = Boolean(categoryId);
  const { alert, showError, clearAlert } = useAlertSystem();
  const [formData, setFormData] = useState<HomeExploreCategoryFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoryResponse, isLoading, error } = useHomeExploreCategory(categoryId);
  const createCategoryMutation = useCreateHomeExploreCategory();
  const updateCategoryMutation = useUpdateHomeExploreCategory();

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  useEffect(() => {
    if (!isEditMode || !categoryResponse?.data) return;

    const category = categoryResponse.data;
    setFormData({
      title_en: category.title_en,
      title_mm: category.title_mm,
      description_en: category.description_en || '',
      description_mm: category.description_mm || '',
      link_path: category.link_path,
      icon_key: category.icon_key || 'home',
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
  }, [categoryResponse, isEditMode]);

  const pageTitle = useMemo(
    () => (isEditMode ? 'Edit Explore Category' : 'Create Explore Category'),
    [isEditMode],
  );

  const handleInputChange = (field: keyof HomeExploreCategoryFormData, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title_en.trim()) {
      nextErrors.title_en = 'English title is required';
    }
    if (!formData.title_mm.trim()) {
      nextErrors.title_mm = 'Myanmar title is required';
    }
    if (!formData.link_path.trim()) {
      nextErrors.link_path = 'Web URL is required';
    } else if (!isValidExploreCategoryLink(formData.link_path)) {
      nextErrors.link_path = 'Enter a full URL (https://...) or a site path starting with /';
    }
    if ((formData.description_en || '').length > 100) {
      nextErrors.description_en = 'English description may not exceed 100 characters';
    }
    if ((formData.description_mm || '').length > 100) {
      nextErrors.description_mm = 'Myanmar description may not exceed 100 characters';
    }
    if (formData.sort_order < 0 || formData.sort_order > 255) {
      nextErrors.sort_order = 'Sort order must be between 0 and 255';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!validateForm()) return;

    const payload: HomeExploreCategoryFormData = {
      title_en: formData.title_en.trim(),
      title_mm: formData.title_mm.trim(),
      description_en: formData.description_en?.trim() || null,
      description_mm: formData.description_mm?.trim() || null,
      link_path: formData.link_path.trim(),
      icon_key: formData.icon_key || null,
      sort_order: Number(formData.sort_order),
      is_active: Boolean(formData.is_active),
    };

    try {
      if (isEditMode) {
        await updateCategoryMutation.mutateAsync({ id: categoryId, data: payload });
        navigate('/home-explore-categories?success=' + encodeURIComponent('Explore category updated successfully.'));
      } else {
        await createCategoryMutation.mutateAsync(payload);
        navigate('/home-explore-categories?success=' + encodeURIComponent('Explore category created successfully.'));
      }
    } catch (submitError: any) {
      if (submitError?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(submitError.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        showError(submitError?.message || 'Failed to save explore category.', true);
      }
    }
  };

  if (isEditMode && isLoading) {
    return <LoadingSpinner />;
  }

  if (isEditMode && error) {
    return (
      <PageErrorState
        error={error}
        title="Failed to load explore category"
        message="Please try refreshing the page."
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title={pageTitle}
        subtitle={isEditMode ? 'Update explore category details' : 'Add a new home page explore category'}
        breadcrumbs={`Dashboard / Settings / Explore Category / ${isEditMode ? 'Edit' : 'Create'}`}
        actionButton={{
          text: 'Back to Explore Category',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/home-explore-categories'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Alert severity="info" sx={{ mb: 2 }}>
        Sort order <strong>1</strong> displays as the large featured card on the home page.
        A maximum of {HOME_EXPLORE_CATEGORY_MAX_ACTIVE} categories can be active at once.
      </Alert>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Title (English)"
                  value={formData.title_en}
                  onChange={(event) => handleInputChange('title_en', event.target.value)}
                  error={Boolean(errors.title_en)}
                  helperText={errors.title_en}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Title (Myanmar)"
                  value={formData.title_mm}
                  onChange={(event) => handleInputChange('title_mm', event.target.value)}
                  error={Boolean(errors.title_mm)}
                  helperText={errors.title_mm}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Description (English)"
                  value={formData.description_en || ''}
                  onChange={(event) => handleInputChange('description_en', event.target.value)}
                  error={Boolean(errors.description_en)}
                  helperText={errors.description_en || `${(formData.description_en || '').length}/100 characters`}
                  inputProps={{ maxLength: 100 }}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Description (Myanmar)"
                  value={formData.description_mm || ''}
                  onChange={(event) => handleInputChange('description_mm', event.target.value)}
                  error={Boolean(errors.description_mm)}
                  helperText={errors.description_mm || `${(formData.description_mm || '').length}/100 characters`}
                  inputProps={{ maxLength: 100 }}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Web URL"
                  value={formData.link_path}
                  onChange={(event) => handleInputChange('link_path', event.target.value)}
                  error={Boolean(errors.link_path)}
                  helperText={errors.link_path || 'Full URL or path, e.g. https://jadeproperty.com.mm/search?type=premium'}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="icon-key-label">Icon</InputLabel>
                  <Select
                    labelId="icon-key-label"
                    label="Icon"
                    value={formData.icon_key || 'home'}
                    onChange={(event) => handleInputChange('icon_key', event.target.value)}
                  >
                    {HOME_EXPLORE_CATEGORY_ICON_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(event) => handleInputChange('sort_order', Number(event.target.value) || 0)}
                  error={Boolean(errors.sort_order)}
                  helperText={errors.sort_order || '1 = featured large card'}
                  inputProps={{ min: 0, max: 255 }}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(event) => handleInputChange('is_active', event.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active on home page"
                />
                {errors.is_active ? (
                  <Typography variant="caption" color="error" display="block">
                    {errors.is_active}
                  </Typography>
                ) : null}
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/home-explore-categories')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    disabled={isSubmitting}
                  >
                    {isEditMode ? 'Update Category' : 'Create Category'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HomeExploreCategoryFormPage;
