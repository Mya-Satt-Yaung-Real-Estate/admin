import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Autocomplete,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCreateWard, useTownships, useRegions } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { CreateWardData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const WardCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // API hooks
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const { data: townshipsData, isLoading: townshipsLoading } = useTownships();
  const createWardMutation = useCreateWard();

  // Form state
  const [formData, setFormData] = useState<CreateWardData>({
    township_id: 0,
    ward_name_en: '',
    ward_name_mm: '',
  });

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter townships based on selected region
  const filteredTownships = townshipsData?.data?.filter((township) => 
    township.region_id === selectedRegionId
  ) || [];

  // Event handlers
  const handleInputChange = (field: keyof CreateWardData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedRegionId) {
      newErrors.region_id = 'Region is required';
    }

    if (!formData.township_id || formData.township_id === 0) {
      newErrors.township_id = 'Township is required';
    }

    if (!formData.ward_name_en.trim()) {
      newErrors.ward_name_en = 'English name is required';
    }

    if (!formData.ward_name_mm.trim()) {
      newErrors.ward_name_mm = 'Myanmar name is required';
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
      await createWardMutation.mutateAsync(formData);
      
      // Navigate to wards list on success
      navigate('/wards?success=' + encodeURIComponent('Ward created successfully!'));
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to create ward. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate('/wards');
  };

  if (regionsLoading || townshipsLoading) {
    return <PageLoadingState title="Loading Data" />;
  }

  const regions = regionsData?.data || [];

  return (
    <Box>
      <PageHeader
        title="Create Ward"
        subtitle="Add a new ward to the system"
        breadcrumbs="Dashboard / Master Data / Wards / Create Ward"
        actionButton={{
          text: 'Back to Wards',
          icon: <ArrowBackIcon />,
          onClick: handleCancel
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            Ward Information
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Region Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                size="small"
                options={regions}
                getOptionLabel={(option) => 
                  `${option.name_en} (${option.name_mm})`
                }
                value={regions.find(region => region.id === selectedRegionId) || null}
                onChange={(_, newValue) => {
                  setSelectedRegionId(newValue?.id || null);
                  setFormData(prev => ({ ...prev, township_id: 0 }));
                }}
                loading={regionsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Region"
                    error={!!errors.region_id}
                    helperText={errors.region_id}
                    required
                  />
                )}
              />
            </Grid>

            {/* Township Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                size="small"
                options={filteredTownships}
                getOptionLabel={(option) => 
                  `${option.name_en} (${option.name_mm})`
                }
                value={filteredTownships.find(township => township.id === formData.township_id) || null}
                onChange={(_, newValue) => {
                  handleInputChange('township_id', newValue?.id || 0);
                }}
                loading={townshipsLoading}
                disabled={!selectedRegionId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Township"
                    error={!!errors.township_id}
                    helperText={errors.township_id}
                    required
                  />
                )}
              />
            </Grid>

            {/* English Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="English Name"
                value={formData.ward_name_en}
                onChange={(e) => handleInputChange('ward_name_en', e.target.value)}
                error={!!errors.ward_name_en}
                helperText={errors.ward_name_en}
                required
                placeholder="Enter English name"
              />
            </Grid>

            {/* Myanmar Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Myanmar Name"
                value={formData.ward_name_mm}
                onChange={(e) => handleInputChange('ward_name_mm', e.target.value)}
                error={!!errors.ward_name_mm}
                helperText={errors.ward_name_mm}
                required
                placeholder="Enter Myanmar name"
              />
            </Grid>
          </Grid>

          {/* Error Alert */}
          {createWardMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {createWardMutation.error.message || 'Failed to create ward. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {createWardMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Ward created successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={createWardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createWardMutation.isPending}
            >
              {createWardMutation.isPending ? 'Creating...' : 'Create Ward'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default WardCreatePage;
