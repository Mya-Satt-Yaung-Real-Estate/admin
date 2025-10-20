import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { useWard, useUpdateWard, useTownships, useRegions } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { UpdateWardData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const WardEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // API hooks
  const { data: wardData, isLoading: wardLoading, error: wardError } = useWard(slug || '');
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const { data: townshipsData, isLoading: townshipsLoading } = useTownships();
  const updateWardMutation = useUpdateWard();

  // Form state
  const [formData, setFormData] = useState<UpdateWardData>({
    township_id: 0,
    ward_name_en: '',
    ward_name_mm: '',
  });

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load ward data when available
  useEffect(() => {
    if (wardData?.data) {
      const ward = wardData.data;
      setFormData({
        township_id: ward.township_id,
        ward_name_en: ward.ward_name_en,
        ward_name_mm: ward.ward_name_mm,
      });
      // Set the region ID from the ward's township
      if (ward.township?.region_id) {
        setSelectedRegionId(ward.township.region_id);
      }
    }
  }, [wardData]);

  // Event handlers
  const handleInputChange = (field: keyof UpdateWardData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ward_name_en?.trim()) {
      newErrors.ward_name_en = 'English name is required';
    }

    if (!formData.ward_name_mm?.trim()) {
      newErrors.ward_name_mm = 'Myanmar name is required';
    }

    if (!selectedRegionId) {
      newErrors.region_id = 'Region is required';
    }

    if (!formData.township_id || formData.township_id === 0) {
      newErrors.township_id = 'Township is required';
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
      await updateWardMutation.mutateAsync({
        slug,
        data: formData,
      });
      
      // Navigate to wards list on success
      navigate('/wards?success=' + encodeURIComponent('Ward updated successfully!'));
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to update ward. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate('/wards');
  };

  // Filter townships based on selected region
  const filteredTownships = townshipsData?.data?.filter((township) => 
    township.region_id === selectedRegionId
  ) || [];

  if (wardLoading || townshipsLoading || regionsLoading) {
    return <PageLoadingState title="Loading Ward" />;
  }

  if (wardError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {wardError.message || 'Failed to load ward data'}
        </Alert>
        <Button onClick={() => navigate('/wards')} sx={{ mt: 2 }}>
          Back to Wards
        </Button>
      </Box>
    );
  }

  if (!wardData?.data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Ward not found</Alert>
        <Button onClick={() => navigate('/wards')} sx={{ mt: 2 }}>
          Back to Wards
        </Button>
      </Box>
    );
  }

    const regions = regionsData?.data || [];

  return (
    <Box>
      <PageHeader
        title="Edit Ward"
        subtitle={`Edit ${wardData.data.ward_name_en}`}
        breadcrumbs="Dashboard / Master Data / Wards / Edit Ward"
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
            <Grid item xs={12}>
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
          {updateWardMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {updateWardMutation.error.message || 'Failed to update ward. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {updateWardMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Ward updated successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={updateWardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateWardMutation.isPending}
            >
              {updateWardMutation.isPending ? 'Updating...' : 'Update Ward'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default WardEditPage;
