import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const PermissionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Permission name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Creating permission:', { name, description });
      setIsSubmitting(false);
      navigate('/permissions');
    }, 1500);
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Create Permission"
        breadcrumbs="Dashboard / Admin Management / Permissions / Create"
        subtitle="Add a new permission"
        actionButton={{
          text: 'Back to Permissions',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/permissions')
        }}
      />
      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Permission Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors?.name}
              helperText={errors?.name}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors?.description}
              helperText={errors?.description}
              required
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/permissions')}
            startIcon={<CancelIcon />}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={<SaveIcon />}
          >
            {isSubmitting ? 'Creating...' : 'Create Permission'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PermissionCreatePage; 