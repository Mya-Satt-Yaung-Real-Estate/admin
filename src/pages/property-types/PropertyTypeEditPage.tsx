import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState } from '../../components/ui';
import { usePropertyType, useUpdatePropertyType } from '../../services/queries/properties';

interface FormData {
  name_en: string;
  name_mm: string;
  description: string;
  is_active: boolean;
}

const PropertyTypeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch property type data
  const { data: propertyTypeResponse, isLoading, error } = usePropertyType(slug || '');
  const updatePropertyTypeMutation = useUpdatePropertyType();

  // Extract data
  const propertyType = propertyTypeResponse?.data;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name_en: '',
    name_mm: '',
    description: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when property type is loaded
  useEffect(() => {
    if (propertyType) {
      setFormData({
        name_en: propertyType.name_en,
        name_mm: propertyType.name_mm,
        description: propertyType.description || '',
        is_active: propertyType.is_active,
      });
    }
  }, [propertyType]);

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!slug) return;

    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!formData.name_en?.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (!formData.name_mm?.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Submit form
    updatePropertyTypeMutation.mutate(
      { slug, data: formData },
      {
        onSuccess: () => {
          navigate('/property-types');
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Property Type Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Property Type"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!propertyType) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Property Type Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The property type you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/property-types')}
        >
          Back to Property Types
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit Property Type"
        breadcrumbs={`Dashboard / Master Data / Property Types / ${propertyType.name_en} / Edit`}
        subtitle="Update property type information"
        actionButton={{
          text: 'Back to Property Types',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/property-types')
        }}
      />

      {/* Success/Error alerts */}
      {updatePropertyTypeMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Property type updated successfully!
        </Alert>
      )}

      {updatePropertyTypeMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to update property type: {updatePropertyTypeMutation.error?.message}
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          {/* English Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="English Name"
              value={formData.name_en || ''}
              onChange={(e) => handleFieldChange('name_en', e.target.value)}
              error={!!errors.name_en}
              helperText={errors.name_en}
              required
            />
          </Grid>

          {/* Myanmar Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Myanmar Name (မြန်မာနာမည်)"
              value={formData.name_mm || ''}
              onChange={(e) => handleFieldChange('name_mm', e.target.value)}
              error={!!errors.name_mm}
              helperText={errors.name_mm}
              required
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => handleFieldChange('is_active', e.target.value === 'true')}
                label="Status"
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              multiline
              rows={3}
              helperText="Optional description for this property type"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/property-types')}
                disabled={updatePropertyTypeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={updatePropertyTypeMutation.isPending}
              >
                {updatePropertyTypeMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PropertyTypeEditPage;
