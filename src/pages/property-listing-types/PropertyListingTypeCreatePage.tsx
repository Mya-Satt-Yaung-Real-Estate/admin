import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { useCreatePropertyListingType } from '../../services/queries/properties';

interface FormData {
  name_en: string;
  name_mm: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

const PropertyListingTypeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Create mutation
  const createListingTypeMutation = useCreatePropertyListingType();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name_en: '',
    name_mm: '',
    description: '',
    sort_order: 1,
    is_active: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!formData.name_en?.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (!formData.name_mm?.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }
    if (formData.sort_order < 1 || formData.sort_order > 999) {
      newErrors.sort_order = 'Sort order must be between 1 and 999';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Submit form
    createListingTypeMutation.mutate(
      {
        name_en: formData.name_en.trim(),
        name_mm: formData.name_mm.trim(),
        description: formData.description.trim() || undefined,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      },
      {
        onSuccess: () => {
          navigate('/property-listing-types');
        },
      }
    );
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Property Listing Type"
        breadcrumbs="Dashboard / Master Data / Property Listing Types / Create"
        subtitle="Add a new property listing type"
        actionButton={{
          text: 'Back to Property Listing Types',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/property-listing-types')
        }}
      />

      {/* Success/Error alerts */}
      {createListingTypeMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Property listing type created successfully!
        </Alert>
      )}

      {createListingTypeMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to create property listing type: {createListingTypeMutation.error?.message}
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

          {/* Sort Order */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sort Order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => handleFieldChange('sort_order', parseInt(e.target.value) || 1)}
              error={!!errors.sort_order}
              helperText={errors.sort_order || 'Display order (lower numbers appear first)'}
              required
              inputProps={{ min: 1, max: 999 }}
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
              helperText="Optional description for this listing type"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/property-listing-types')}
                disabled={createListingTypeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={createListingTypeMutation.isPending}
              >
                {createListingTypeMutation.isPending ? 'Creating...' : 'Create Property Listing Type'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PropertyListingTypeCreatePage;
