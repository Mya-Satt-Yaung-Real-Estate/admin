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
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useYarpyatTax, useUpdateYarpyatTax, useWards } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { UpdateYarpyatTaxData } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const YarpyatEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();
  
  // API hooks
  const { data: yarpyatData, isLoading: yarpyatLoading, error: yarpyatError } = useYarpyatTax(slug || '');
  const { data: wardsData, isLoading: wardsLoading } = useWards();
  const updateYarpyatMutation = useUpdateYarpyatTax();

  // Form state
  const [formData, setFormData] = useState<UpdateYarpyatTaxData>({
    ward_id: 0,
    name_en: '',
    name_mm: '',
    price: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [priceInput, setPriceInput] = useState<string>('');

  // Load yarpyat data when available
  useEffect(() => {
    if (yarpyatData?.data) {
      const yarpyat = yarpyatData.data;
      setFormData({
        ward_id: yarpyat.ward_id,
        name_en: yarpyat.name_en,
        name_mm: yarpyat.name_mm,
        price: yarpyat.price,
      });
      setPriceInput(yarpyat.price.toString());
    }
  }, [yarpyatData]);

  // Event handlers
  const handleInputChange = (field: keyof UpdateYarpyatTaxData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ward_id || formData.ward_id === 0) {
      newErrors.ward_id = 'Ward is required';
    }

    if (!formData.name_en?.trim()) {
      newErrors.name_en = 'English name is required';
    }

    if (!formData.name_mm?.trim()) {
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
    
    if (!validateForm() || !slug) {
      return;
    }

    try {
      await updateYarpyatMutation.mutateAsync({
        slug,
        data: formData,
      });
      
      // Navigate to yarpyat list on success
      navigate('/yarpyat?success=' + encodeURIComponent('Yarpyat tax updated successfully!'));
    } catch (error: any) {
      // Handle API validation errors
      if (error?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(apiErrors);
      } else {
        const errorMessage = error?.message || 'Failed to update yarpyat tax. Please try again.';
        showError(errorMessage, true);
      }
    }
  };

  const handleCancel = () => {
    navigate('/yarpyat');
  };

  if (yarpyatLoading || wardsLoading) {
    return <PageLoadingState title="Loading Yarpyat Tax" />;
  }

  if (yarpyatError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {yarpyatError.message || 'Failed to load yarpyat tax data'}
        </Alert>
        <Button onClick={() => navigate('/yarpyat')} sx={{ mt: 2 }}>
          Back to Yarpyat Taxes
        </Button>
      </Box>
    );
  }

  if (!yarpyatData?.data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Yarpyat tax not found</Alert>
        <Button onClick={() => navigate('/yarpyat')} sx={{ mt: 2 }}>
          Back to Yarpyat Taxes
        </Button>
      </Box>
    );
  }

  const wards = wardsData?.data || [];

  return (
    <Box>
      <PageHeader
        title="Edit Yarpyat Tax"
        subtitle={`Edit ${yarpyatData.data.name_en}`}
        breadcrumbs="Dashboard / Master Data / Yarpyat Taxes / Edit Yarpyat Tax"
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
            {/* Ward Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                size="small"
                options={wards}
                getOptionLabel={(option) => 
                  `${option.ward_name_en} (${option.ward_name_mm}) - ${option.township?.name_en || 'Unknown Township'}`
                }
                value={wards.find(ward => ward.id === formData.ward_id) || null}
                onChange={(_, newValue) => {
                  handleInputChange('ward_id', newValue?.id || 0);
                }}
                loading={wardsLoading}
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
                label="English Name (Road & Floor)"
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
                label="Myanmar Name (Road & Floor)"
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
          {updateYarpyatMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {updateYarpyatMutation.error.message || 'Failed to update yarpyat tax. Please try again.'}
            </Alert>
          )}

          {/* Success Alert */}
          {updateYarpyatMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Yarpyat tax updated successfully!
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={updateYarpyatMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateYarpyatMutation.isPending}
            >
              {updateYarpyatMutation.isPending ? 'Updating...' : 'Update Yarpyat Tax'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default YarpyatEditPage;
