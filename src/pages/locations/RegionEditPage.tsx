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
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegion, useUpdateRegion } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, ActionAlert } from '../../components/ui';
import { UpdateRegionData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const RegionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  const updateRegionMutation = useUpdateRegion();

  // API Queries
  const { data: regionData, isLoading, error } = useRegion(slug || '');
  const region = regionData?.data;

  // Form state
  const [formData, setFormData] = useState<UpdateRegionData>({
    name_en: '',
    name_mm: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);

  // Populate form when data is loaded
  useEffect(() => {
    if (region) {
      setFormData({
        name_en: region.name_en,
        name_mm: region.name_mm,
        description: region.description || '',
      });
      setIsActive(region.is_active);
    }
  }, [region]);

  // Event handlers
  const handleInputChange = (field: keyof UpdateRegionData, value: string) => {
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

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
      await updateRegionMutation.mutateAsync({
        slug,
        data: {
          ...formData,
          description: formData.description || undefined,
          is_active: isActive,
        },
      });
      
      // Navigate to region detail page on success
      navigate(`/locations/regions/${slug}?success=${encodeURIComponent('Region updated successfully!')}`);
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to update region. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/locations/regions/${slug}`);
  };

  if (isLoading) {
    return <PageLoadingState title="Loading Region" />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Region"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!region) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Region Not Found
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          The region you're looking for doesn't exist or has been removed.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/locations')}>
          Back to Locations
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit Region"
        subtitle={`Editing: ${region.name_en}`}
        breadcrumbs={`Dashboard / Master Data / Locations / ${region.name_en} / Edit`}
        actionButton={{
          text: 'Back to Locations',
          icon: <ArrowBackIcon />,
          onClick: handleCancel
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            Region Information
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

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description || `${formData.description?.length || 0}/500 characters`}
                multiline
                rows={4}
                placeholder="Enter region description (optional)"
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
                label="Active Region"
              />
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Active regions will be available for selection in other parts of the system.
              </Typography>
            </Grid>

            {/* Current Status Display */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Current Status:</strong> {region.is_active ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Slug:</strong> {region.slug}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Townships:</strong> {region.townships?.length || 0} townships in this region
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          {/* Error Alert */}
          {updateRegionMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {updateRegionMutation.error.message || 'Failed to update region. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {updateRegionMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Region updated successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={updateRegionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateRegionMutation.isPending}
            >
              {updateRegionMutation.isPending ? 'Updating...' : 'Update Region'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default RegionEditPage; 