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
import { useNavigate } from 'react-router-dom';
import { useCreateTownship, useRegions } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { CreateTownshipData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const TownshipCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  const createTownshipMutation = useCreateTownship();

  // API Queries
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const regions = regionsData?.data || [];

  // Form state
  const [formData, setFormData] = useState<CreateTownshipData>({
    region_id: 0,
    name_en: '',
    name_mm: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);

  // Event handlers
  const handleInputChange = (field: keyof CreateTownshipData, value: string | number) => {
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
      await createTownshipMutation.mutateAsync({
        ...formData,
        description: formData.description || undefined,
        is_active: isActive,
      });
      
      // Navigate to locations list on success
      navigate('/locations?success=' + encodeURIComponent('Township created successfully!'));
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to create township. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate('/locations');
  };

  if (regionsLoading) {
    return <PageLoadingState title="Loading Regions" />;
  }

  return (
    <Box>
      <PageHeader
        title="Create Township"
        subtitle="Add a new township to the system"
        breadcrumbs="Dashboard / Master Data / Locations / Create Township"
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

            {/* Info Alert */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> Townships are subdivisions of regions. Make sure to select the correct region for this township.
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          {/* Error Alert */}
          {createTownshipMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {createTownshipMutation.error.message || 'Failed to create township. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {createTownshipMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Township created successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={createTownshipMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createTownshipMutation.isPending}
            >
              {createTownshipMutation.isPending ? 'Creating...' : 'Create Township'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default TownshipCreatePage; 