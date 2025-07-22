import React, { useState } from 'react';
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
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { TownshipFormData } from '../../types/location';
import { getActiveRegions } from '../../data/mockLocations';

const TownshipCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TownshipFormData>({
    name: '',
    regionId: 0,
    status: 'active',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TownshipFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof TownshipFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TownshipFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Township name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Township name must be at least 3 characters';
    }

    if (!formData.regionId) {
      newErrors.regionId = 'Region is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Creating township:', formData);
      setIsSubmitting(false);
      navigate('/locations');
    }, 1500);
  };

  const getSelectedRegion = () => {
    return getActiveRegions().find(region => region.id === formData.regionId);
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Township"
        breadcrumbs="Dashboard / Location Management / Create Township"
        subtitle="Add a new township to a region"
        actionButton={{
          text: 'Back to Locations',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/locations')
        }}
      />

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Township Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Township Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
              placeholder="e.g., Downtown Yangon"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Region</InputLabel>
              <Select
                value={formData.regionId}
                label="Region"
                onChange={(e) => handleInputChange('regionId', e.target.value as number)}
                error={!!errors.regionId}
              >
                <MenuItem value={0} disabled>
                  Select a region
                </MenuItem>
                {getActiveRegions().map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
                error={!!errors.status}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
              placeholder="Describe the township (optional)"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {formData.regionId > 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Selected Region:</strong> {getSelectedRegion()?.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This township will be created under the selected region.
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/locations')}
                startIcon={<ArrowBackIcon />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={<SaveIcon />}
              >
                {isSubmitting ? 'Creating...' : 'Create Township'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TownshipCreatePage; 