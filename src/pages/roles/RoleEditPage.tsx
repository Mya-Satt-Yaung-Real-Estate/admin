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
  Chip,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const mockRoles = [
  { id: 1, name: 'Super Admin', permissions: ['manage users', 'manage roles', 'manage permissions'], createdAt: '2023-01-01' },
  { id: 2, name: 'Admin', permissions: ['manage users'], createdAt: '2023-03-12' },
  { id: 3, name: 'Editor', permissions: ['edit content'], createdAt: '2023-05-20' },
];
const mockPermissions = [
  'manage users',
  'manage roles',
  'manage permissions',
  'edit content',
  'view analytics',
];

const RoleEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = mockRoles.find(r => r.id === Number(id));
  const [name, setName] = useState(role?.name || '');
  const [permissions, setPermissions] = useState<string[]>(role?.permissions || []);
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Role name is required';
    if (permissions.length === 0) newErrors.permissions = 'Select at least one permission';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Updating role:', { name, permissions });
      setIsSubmitting(false);
      navigate(`/roles/${id}`);
    }, 1500);
  };

  if (!role) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Role not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Edit Role"
        breadcrumbs={`Dashboard / Admin Management / Roles / ${role.name} / Edit`}
        subtitle="Update role information"
        actionButton={{
          text: 'Back to Role',
          icon: <ArrowBackIcon />,
          onClick: () => navigate(`/roles/${id}`)
        }}
      />
      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors?.name}
              helperText={errors?.name}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors?.permissions}>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={permissions}
                onChange={(e) => setPermissions(e.target.value as string[])}
                label="Permissions"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {mockPermissions.map((perm) => (
                  <MenuItem key={perm} value={perm}>{perm}</MenuItem>
                ))}
              </Select>
              {errors?.permissions && (
                <Typography variant="caption" color="error">{errors.permissions}</Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/roles/${id}`)}
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

export default RoleEditPage; 