import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePointPackage, useUpdatePointPackage } from '../../services/queries/points';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { UpdatePointPackageData } from '../../types/point';
import { useAlertSystem } from '../../hooks';

const PointPackageEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  const updatePointPackageMutation = useUpdatePointPackage();

  // Queries
  const { data: pointPackageData, isLoading, error } = usePointPackage(slug || '');

  // Form state - using strings for number inputs to allow empty values
  const [formData, setFormData] = useState({
    name_en: '',
    name_mm: '',
    points: '',
    price_mmk: '',
    description_en: '',
    description_mm: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);

  // Initialize form data when point package is loaded
  useEffect(() => {
    if (pointPackageData?.data) {
      const pointPackage = pointPackageData.data;
      setFormData({
        name_en: pointPackage.name_en,
        name_mm: pointPackage.name_mm,
        points: pointPackage.points.toString(),
        price_mmk: pointPackage.price_mmk.toString(),
        description_en: pointPackage.description_en || '',
        description_mm: pointPackage.description_mm || '',
      });
      setIsActive(pointPackage.is_active);
    }
  }, [pointPackageData]);

  // Event handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name_en?.trim()) {
      newErrors.name_en = 'English name is required';
    }

    if (!formData.name_mm?.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }

    if (!formData.points.trim()) {
      newErrors.points = 'Points is required';
    } else {
      const points = parseInt(formData.points);
      if (isNaN(points) || points < 1) {
        newErrors.points = 'Points must be at least 1';
      } else if (points > 10000) {
        newErrors.points = 'Points cannot exceed 10,000';
      }
    }

    if (!formData.price_mmk.trim()) {
      newErrors.price_mmk = 'Price is required';
    } else {
      const price = parseInt(formData.price_mmk);
      if (isNaN(price) || price < 1000) {
        newErrors.price_mmk = 'Price must be at least 1,000 MMK';
      } else if (price > 10000000) {
        newErrors.price_mmk = 'Price cannot exceed 10,000,000 MMK';
      }
    }

    if (formData.description_en && formData.description_en.length > 500) {
      newErrors.description_en = 'English description must be less than 500 characters';
    }

    if (formData.description_mm && formData.description_mm.length > 500) {
      newErrors.description_mm = 'Myanmar description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !slug) {
      return;
    }

    try {
      const submitData: UpdatePointPackageData = {
        name_en: formData.name_en.trim(),
        name_mm: formData.name_mm.trim(),
        points: parseInt(formData.points),
        price_mmk: parseInt(formData.price_mmk),
        description_en: formData.description_en.trim() || undefined,
        description_mm: formData.description_mm.trim() || undefined,
        is_active: isActive,
      };

      await updatePointPackageMutation.mutateAsync({
        slug,
        data: submitData,
      });
      
      // Navigate to point packages list on success
      navigate('/points/packages?success=' + encodeURIComponent('Point package updated successfully!'));
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to update point package. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate('/points/packages');
  };

  // Loading and error states
  if (isLoading) {
    return <PageLoadingState title="Loading Point Package" />;
  }

  if (error || !pointPackageData?.data) {
    return (
      <Box>
        <PageHeader
          title="Edit Point Package"
          subtitle="Update point package information"
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || 'Failed to load point package. Please try again.'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Back to List
          </Button>
        </Box>
      </Box>
    );
  }

  if (updatePointPackageMutation.isPending) {
    return <PageLoadingState title="Updating Point Package" />;
  }

  return (
    <Box>
      <PageHeader
        title="Edit Point Package"
        subtitle="Update point package information"
        breadcrumbs={`Dashboard / Points / Packages / ${pointPackageData?.data?.name_en || 'Package'} / Edit`}
        actionButton={{
          text: 'Back to Packages',
          icon: <ArrowBackIcon />,
          onClick: handleCancel
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <StarIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            Point Package Information
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* English Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="English Name"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                error={!!errors.name_en}
                helperText={errors.name_en}
                required
                placeholder="Enter English name"
              />
            </Grid>

            {/* Myanmar Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Myanmar Name"
                value={formData.name_mm}
                onChange={(e) => handleInputChange('name_mm', e.target.value)}
                error={!!errors.name_mm}
                helperText={errors.name_mm}
                required
                placeholder="Enter Myanmar name"
              />
            </Grid>

            {/* Points */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Points"
                type="number"
                value={formData.points}
                onChange={(e) => handleInputChange('points', e.target.value)}
                error={!!errors.points}
                helperText={errors.points}
                required
                placeholder="Enter points amount"
                inputProps={{ min: 1, max: 10000 }}
              />
            </Grid>

            {/* Price in MMK */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price (MMK)"
                type="number"
                value={formData.price_mmk}
                onChange={(e) => handleInputChange('price_mmk', e.target.value)}
                error={!!errors.price_mmk}
                helperText={errors.price_mmk}
                required
                placeholder="Enter price in MMK"
                inputProps={{ min: 1000, max: 10000000 }}
              />
            </Grid>

            {/* English Description */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="English Description"
                value={formData.description_en}
                onChange={(e) => handleInputChange('description_en', e.target.value)}
                error={!!errors.description_en}
                helperText={errors.description_en || `${formData.description_en?.length || 0}/500 characters`}
                multiline
                rows={4}
                placeholder="Enter English description (optional)"
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            {/* Myanmar Description */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Myanmar Description"
                value={formData.description_mm}
                onChange={(e) => handleInputChange('description_mm', e.target.value)}
                error={!!errors.description_mm}
                helperText={errors.description_mm || `${formData.description_mm?.length || 0}/500 characters`}
                multiline
                rows={4}
                placeholder="Enter Myanmar description (optional)"
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Active Point Package"
              />
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Active point packages will be available for users to purchase.
              </Typography>
            </Grid>
          </Grid>

          {/* Error Alert */}
          {updatePointPackageMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {updatePointPackageMutation.error.message || 'Failed to update point package. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {updatePointPackageMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Point package updated successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={updatePointPackageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updatePointPackageMutation.isPending}
            >
              {updatePointPackageMutation.isPending ? 'Updating...' : 'Update Point Package'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PointPackageEditPage;
