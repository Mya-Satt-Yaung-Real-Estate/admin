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
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState } from '../../components/ui';
import { usePropertyListingType, useUpdatePropertyListingType } from '../../services/queries/properties';

interface FormData {
  name_en: string;
  name_mm: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

const PropertyListingTypeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch property listing type data
  const { data: listingTypeResponse, isLoading, error } = usePropertyListingType(slug || '');
  const updateListingTypeMutation = useUpdatePropertyListingType();

  // Extract data
  const listingType = listingTypeResponse?.data;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name_en: '',
    name_mm: '',
    description: '',
    sort_order: 1,
    is_active: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when listing type is loaded
  useEffect(() => {
    if (listingType) {
      setFormData({
        name_en: listingType.name_en,
        name_mm: listingType.name_mm,
        description: listingType.description || '',
        sort_order: listingType.sort_order,
        is_active: listingType.is_active,
      });
    }
  }, [listingType]);

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
    if (formData.sort_order < 1 || formData.sort_order > 999) {
      newErrors.sort_order = 'Sort order must be between 1 and 999';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Submit form
    updateListingTypeMutation.mutate(
      { slug, data: formData },
      {
        onSuccess: () => {
          navigate('/property-listing-types?success=' + encodeURIComponent('Property listing type updated successfully!'));
        },
        onError: () => {
          navigate('/property-listing-types?error=' + encodeURIComponent('Failed to update property listing type. Please try again.'));
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Property Listing Type Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Property Listing Type"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!listingType) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Property Listing Type Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The property listing type you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/property-listing-types')}
        >
          Back to Property Listing Types
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit Property Listing Type"
        breadcrumbs={`Dashboard / Master Data / Property Listing Types / ${listingType.name_en} / Edit`}
        subtitle="Update property listing type information"
        actionButton={{
          text: 'Back to Property Listing Types',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/property-listing-types')
        }}
      />



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
                disabled={updateListingTypeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={updateListingTypeMutation.isPending}
              >
                {updateListingTypeMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PropertyListingTypeEditPage;
