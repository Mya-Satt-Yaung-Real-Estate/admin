import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useCreateRegion } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { CreateRegionData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const RegionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  const createRegionMutation = useCreateRegion();

  // Form state
  const [formData, setFormData] = useState<CreateRegionData>({
    name_en: '',
    name_mm: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);

  // Event handlers
  const handleInputChange = (field: keyof CreateRegionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name_en.trim()) {
      newErrors.name_en = 'English name is required';
    }

    if (!formData.name_mm.trim()) {
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
    
    if (!validateForm()) {
      return;
    }

    try {
      await createRegionMutation.mutateAsync({
        ...formData,
        description: formData.description || undefined,
      });
      
      // Navigate to locations list on success
      navigate('/locations?success=' + encodeURIComponent('Region created successfully!'));
    } catch (error: any) {
      // Handle API validation errors
      if (error?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to create region. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate('/locations');
  };

  if (createRegionMutation.isPending) {
    return <PageLoadingState title="Creating Region" />;
  }

  return (
    <Box>
      <PageHeader
        title="Create Region"
        subtitle="Add a new region to the system"
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </Box>

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
          </Grid>

          {/* Error Alert */}
          {createRegionMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {createRegionMutation.error.message || 'Failed to create region. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {createRegionMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Region created successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={createRegionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createRegionMutation.isPending}
            >
              {createRegionMutation.isPending ? 'Creating...' : 'Create Region'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default RegionCreatePage; 