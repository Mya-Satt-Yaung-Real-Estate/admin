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
import { RegionFormData } from '../../types/location';

const RegionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegionFormData>({
    name_en: '',
    name_mm: '',
    is_active: true,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegionFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof RegionFormData, value: string | boolean) => {
    setFormData((prev: RegionFormData) => ({
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
    const newErrors: Partial<Record<keyof RegionFormData, string>> = {};

    if (!formData.name_en.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (!formData.name_mm.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
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
      console.log('Creating region:', formData);
      setIsSubmitting(false);
      navigate('/locations');
    }, 1500);
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Region"
        breadcrumbs="Dashboard / Location Management / Create Region"
        subtitle="Add a new region to the system"
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
              Region Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="English Name"
              value={formData.name_en}
              onChange={(e) => handleInputChange('name_en', e.target.value)}
              error={!!errors.name_en}
              helperText={errors.name_en}
              required
              placeholder="e.g., Yangon"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Myanmar Name"
              value={formData.name_mm}
              onChange={(e) => handleInputChange('name_mm', e.target.value)}
              error={!!errors.name_mm}
              helperText={errors.name_mm}
              required
              placeholder="e.g., ရန်ကုန်"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.is_active.toString()}
                label="Status"
                onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
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
              placeholder="Describe the region (optional)"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Note:</strong> Regions are the top-level administrative divisions. Townships can be added to regions after creation.
              </Typography>
            </Alert>
          </Grid>

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
                {isSubmitting ? 'Creating...' : 'Create Region'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RegionCreatePage; 