import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const mockPermissions = [
  { id: 1, name: 'manage users', description: 'Can manage users', createdAt: '2023-01-01' },
  { id: 2, name: 'manage roles', description: 'Can manage roles', createdAt: '2023-03-12' },
  { id: 3, name: 'edit content', description: 'Can edit content', createdAt: '2023-05-20' },
];

const PermissionEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const permission = mockPermissions.find(p => p.id === Number(id));
  const [name, setName] = useState(permission?.name || '');
  const [description, setDescription] = useState(permission?.description || '');
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
      console.log('Updating permission:', { name, description });
      setIsSubmitting(false);
      navigate(`/permissions/${id}`);
    }, 1500);
  };

  if (!permission) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Permission not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit Permission"
        breadcrumbs={`Dashboard / Admin Management / Permissions / ${permission.name} / Edit`}
        subtitle="Update permission information"
        actionButton={{
          text: 'Back to Permission',
          icon: <ArrowBackIcon />,
          onClick: () => navigate(`/permissions/${id}`)
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
            onClick={() => navigate(`/permissions/${id}`)}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PermissionEditPage; 