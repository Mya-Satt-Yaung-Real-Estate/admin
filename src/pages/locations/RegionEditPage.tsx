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
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { RegionFormData } from '../../types/location';
import { useRegion, useUpdateRegion } from '../../services/queries/locations';

const RegionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<RegionFormData>({
    name_en: '',
    name_mm: '',
    is_active: true,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegionFormData, string>>>({});

  const { data: regionData, isLoading, error } = useRegion(id || '');
  const updateRegionMutation = useUpdateRegion();

  useEffect(() => {
    if (regionData?.data) {
      const region = regionData.data;
      setFormData({
        name_en: region.name_en,
        name_mm: region.name_mm,
        is_active: region.is_active,
        description: region.description || '',
      });
    }
  }, [regionData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id) return;

    try {
      await updateRegionMutation.mutateAsync({
        slug: id,
        data: formData,
      });
      navigate('/locations');
    } catch (error: any) {
      console.error('Error updating region:', error);
    }
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete region:', id);
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Edit Region" />
        <Paper sx={{ p: 3 }}>
          <Typography>Loading region...</Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Edit Region" />
        <Paper sx={{ p: 3 }}>
          <Alert severity="error">
            Error loading region: {error.message}
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Edit Region" />
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="English Name"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                error={!!errors.name_en}
                helperText={errors.name_en}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Myanmar Name"
                value={formData.name_mm}
                onChange={(e) => handleInputChange('name_mm', e.target.value)}
                error={!!errors.name_mm}
                helperText={errors.name_mm}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.is_active.toString()}
                  onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                  label="Status"
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
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/locations')}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateRegionMutation.isPending}
            >
              {updateRegionMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegionEditPage; 