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
import { TownshipFormData, Township } from '../../types/location';
import { getActiveRegions } from '../../data/mockLocations';

// Mock townships data - in a real app, this would come from an API
const mockTownships: Township[] = [
  {
    id: 1,
    name: 'Downtown Yangon',
    regionId: 1,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'The central business district of Yangon, featuring colonial architecture and modern developments.'
  },
  {
    id: 2,
    name: 'Bahan Township',
    regionId: 1,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A residential township in Yangon, known for its diplomatic missions and upscale neighborhoods.'
  },
  {
    id: 3,
    name: 'Sanchaung Township',
    regionId: 1,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A popular residential area in Yangon with good transportation links.'
  },
  {
    id: 4,
    name: 'Tamwe Township',
    regionId: 1,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A township in Yangon known for its markets and residential areas.'
  },
  {
    id: 5,
    name: 'Chanayethazan Township',
    regionId: 2,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A township in Mandalay, part of the historic royal city.'
  },
  {
    id: 6,
    name: 'Mahaaungmye Township',
    regionId: 2,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A township in Mandalay with historical significance.'
  },
  {
    id: 7,
    name: 'Pyigyidagun Township',
    regionId: 2,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A township in Mandalay known for its cultural heritage.'
  },
  {
    id: 8,
    name: 'Ottarathiri Township',
    regionId: 3,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A township in Naypyidaw, the capital territory.'
  },
  {
    id: 9,
    name: 'Pobbathiri Township',
    regionId: 3,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A township in Naypyidaw with government offices.'
  },
  {
    id: 10,
    name: 'Zabuthiri Township',
    regionId: 3,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'A township in Naypyidaw featuring residential areas.'
  },
  {
    id: 11,
    name: 'Sagaing Township',
    regionId: 4,
    status: 'inactive',
    createdAt: '2023-01-01',
    description: 'A township in Sagaing Region, known for its historical sites.'
  },
  {
    id: 12,
    name: 'Monywa Township',
    regionId: 4,
    status: 'inactive',
    createdAt: '2023-01-01',
    description: 'A township in Sagaing Region, an important commercial center.'
  }
];

const TownshipEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<TownshipFormData>({
    name: '',
    regionId: 0,
    status: 'active',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TownshipFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [township, setTownship] = useState<Township | null>(null);

  useEffect(() => {
    if (id) {
      const foundTownship = mockTownships.find(t => t.id === parseInt(id));
      if (foundTownship) {
        setTownship(foundTownship);
        setFormData({
          name: foundTownship.name,
          regionId: foundTownship.regionId,
          status: foundTownship.status,
          description: foundTownship.description || '',
        });
      }
    }
  }, [id]);

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
      console.log('Updating township:', formData);
      setIsSubmitting(false);
      navigate('/locations');
    }, 1500);
  };

  const handleDelete = () => {
    console.log('Deleting township:', id);
    navigate('/locations');
  };

  const getSelectedRegion = () => {
    return getActiveRegions().find(region => region.id === formData.regionId);
  };

  if (!township) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Township not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit Township"
        breadcrumbs="Dashboard / Location Management / Edit Township"
        subtitle={`Update information for ${township.name}`}
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

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Current Region:</strong> {getSelectedRegion()?.name}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Created:</strong> {township.createdAt}
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
                Delete Township
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

export default TownshipEditPage; 