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
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCreateYarpyatTax, useWards, useTownships, useRegions } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { CreateYarpyatTaxData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const YarpyatCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // API hooks
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const { data: townshipsData, isLoading: townshipsLoading } = useTownships();
  const { data: wardsData, isLoading: wardsLoading } = useWards();
  const createYarpyatMutation = useCreateYarpyatTax();

  // Form state
  const [formData, setFormData] = useState<CreateYarpyatTaxData>({
    ward_id: 0,
    name_en: '',
    name_mm: '',
    price: 0,
  });

  const [priceInput, setPriceInput] = useState<string>('');

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedTownshipId, setSelectedTownshipId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter townships and wards based on selections
  const filteredTownships = townshipsData?.data?.filter((township) => 
    township.region_id === selectedRegionId
  ) || [];

  const filteredWards = wardsData?.data?.filter((ward) => 
    ward.township_id === selectedTownshipId
  ) || [];

  // Event handlers
  const handleInputChange = (field: keyof CreateYarpyatTaxData, value: string | number) => {
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

    if (!selectedTownshipId) {
      newErrors.township_id = 'Township is required';
    }

    if (!formData.ward_id || formData.ward_id === 0) {
      newErrors.ward_id = 'Ward is required';
    }

    if (!formData.name_en.trim()) {
      newErrors.name_en = 'English name is required';
    }

    if (!formData.name_mm.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
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
      await createYarpyatMutation.mutateAsync(formData);
      
      // Navigate to yarpyat list on success
      navigate('/yarpyat?success=' + encodeURIComponent('Yarpyat tax created successfully!'));
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to create yarpyat tax. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate('/yarpyat');
  };

  if (regionsLoading || townshipsLoading || wardsLoading) {
    return <PageLoadingState title="Loading Data" />;
  }

  const regions = regionsData?.data || [];

  return (
    <Box>
      <PageHeader
        title="Create Yarpyat Tax"
        subtitle="Add a new yarpyat tax to the system"
        breadcrumbs="Dashboard / Master Data / Yarpyat Taxes / Create Yarpyat Tax"
        actionButton={{
          text: 'Back to Yarpyat Taxes',
          icon: <ArrowBackIcon />,
          onClick: handleCancel
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <MoneyIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            Yarpyat Tax Information
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Region Selection */}
            <Grid item xs={12} md={4}>
              <Autocomplete
                size="small"
                options={regions}
                getOptionLabel={(option) => 
                  `${option.name_en} (${option.name_mm})`
                }
                value={regions.find(region => region.id === selectedRegionId) || null}
                onChange={(_, newValue) => {
                  setSelectedRegionId(newValue?.id || null);
                  setSelectedTownshipId(null);
                  setFormData(prev => ({ ...prev, ward_id: 0 }));
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
            <Grid item xs={12} md={4}>
              <Autocomplete
                size="small"
                options={filteredTownships}
                getOptionLabel={(option) => 
                  `${option.name_en} (${option.name_mm})`
                }
                value={filteredTownships.find(township => township.id === selectedTownshipId) || null}
                onChange={(_, newValue) => {
                  setSelectedTownshipId(newValue?.id || null);
                  setFormData(prev => ({ ...prev, ward_id: 0 }));
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

            {/* Ward Selection */}
            <Grid item xs={12} md={4}>
              <Autocomplete
                size="small"
                options={filteredWards}
                getOptionLabel={(option) => 
                  `${option.ward_name_en} (${option.ward_name_mm})`
                }
                value={filteredWards.find(ward => ward.id === formData.ward_id) || null}
                onChange={(_, newValue) => {
                  handleInputChange('ward_id', newValue?.id || 0);
                }}
                loading={wardsLoading}
                disabled={!selectedTownshipId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ward"
                    error={!!errors.ward_id}
                    helperText={errors.ward_id}
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

            {/* Price */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  const price = parseFloat(e.target.value);
                  if (!isNaN(price)) {
                    handleInputChange('price', price);
                  }
                }}
                error={!!errors.price}
                helperText={errors.price}
                required
                placeholder="Enter price"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>

          {/* Error Alert */}
          {createYarpyatMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {createYarpyatMutation.error.message || 'Failed to create yarpyat tax. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {createYarpyatMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Yarpyat tax created successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={createYarpyatMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createYarpyatMutation.isPending}
            >
              {createYarpyatMutation.isPending ? 'Creating...' : 'Create Yarpyat Tax'}
            </Button>
          </Box>
        </form>
      </Paper>
</Box>
  );
};

export default YarpyatCreatePage;
