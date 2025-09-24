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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTownship, useUpdateTownship, useRegions } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, ActionAlert } from '../../components/ui';
import { UpdateTownshipData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const TownshipEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  const updateTownshipMutation = useUpdateTownship();

  // API Queries
  const { data: townshipData, isLoading, error } = useTownship(slug || '');
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const township = townshipData?.data;
  const regions = regionsData?.data || [];

  // Form state
  const [formData, setFormData] = useState<UpdateTownshipData>({
    region_id: 0,
    name_en: '',
    name_mm: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);

  // Populate form when data is loaded
  useEffect(() => {
    if (township) {
      setFormData({
        region_id: township.region_id,
        name_en: township.name_en,
        name_mm: township.name_mm,
        description: township.description || '',
      });
      setIsActive(township.is_active);
    }
  }, [township]);

  // Event handlers
  const handleInputChange = (field: keyof UpdateTownshipData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.region_id) {
      newErrors.region_id = 'Region is required';
    }

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
      await updateTownshipMutation.mutateAsync({
        slug,
        data: {
          ...formData,
          description: formData.description || undefined,
          is_active: isActive,
        },
      });
      
      // Navigate to township detail page on success
      navigate(`/locations/townships/${slug}?success=${encodeURIComponent('Township updated successfully!')}`);
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to update township. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/locations/townships/${slug}`);
  };

  if (isLoading || regionsLoading) {
    return <PageLoadingState title="Loading Township" />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Township"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!township) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Township Not Found
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          The township you're looking for doesn't exist or has been removed.
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
        title="Edit Township"
        subtitle={`Editing: ${township.name_en}`}
        breadcrumbs={`Dashboard / Master Data / Locations / ${township.name_en} / Edit`}
        actionButton={{
          text: 'Back to Locations',
          icon: <ArrowBackIcon />,
          onClick: handleCancel
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BusinessIcon sx={{ fontSize: 32, color: 'secondary.main', mr: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            Township Information
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Region Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.region_id} required>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.region_id}
                  label="Region"
                  onChange={(e) => handleInputChange('region_id', e.target.value as number)}
                >
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name_en} ({region.name_mm})
                    </MenuItem>
                  ))}
                </Select>
                {errors.region_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.region_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Active Township"
              />
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Active townships will be available for selection in other parts of the system.
              </Typography>
            </Grid>

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
                placeholder="Enter township description (optional)"
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            {/* Current Status Display */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Current Status:</strong> {township.is_active ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Slug:</strong> {township.slug}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Current Region:</strong> {township.region?.name_en || 'Unknown Region'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Region ID:</strong> {township.region_id}
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          {/* Error Alert */}
          {updateTownshipMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {updateTownshipMutation.error.message || 'Failed to update township. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {updateTownshipMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Township updated successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={updateTownshipMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateTownshipMutation.isPending}
            >
              {updateTownshipMutation.isPending ? 'Updating...' : 'Update Township'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default TownshipEditPage; 