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
import { RegionFormData, Region } from '../../types/location';
import { mockRegions } from '../../data/mockLocations';

const RegionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<RegionFormData>({
    name: '',
    status: 'active',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegionFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (id) {
      const foundRegion = mockRegions.find(r => r.id === parseInt(id));
      if (foundRegion) {
        setRegion(foundRegion);
        setFormData({
          name: foundRegion.name,
          status: foundRegion.status,
          description: foundRegion.description || '',
        });
      }
    }
  }, [id]);

  const handleInputChange = (field: keyof RegionFormData, value: string) => {
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
    const newErrors: Partial<Record<keyof RegionFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Region name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Region name must be at least 3 characters';
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
      console.log('Updating region:', formData);
      setIsSubmitting(false);
      navigate('/locations');
    }, 1500);
  };

  const handleDelete = () => {
    console.log('Deleting region:', id);
    navigate('/locations');
  };

  if (!region) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Region not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit Region"
        breadcrumbs="Dashboard / Location Management / Edit Region"
        subtitle={`Update information for ${region.name}`}
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
              label="Region Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
              placeholder="e.g., Yangon Region"
            />
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
              placeholder="Describe the region (optional)"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Note:</strong> Changing the region status will affect all townships within this region.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Created: {region.createdAt}
              </Typography>
            </Alert>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                startIcon={<DeleteIcon />}
              >
                Delete Region
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RegionEditPage; 