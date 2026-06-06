import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ShoppingCart as PackageIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCreatePointPurchaseRequest } from '../../services/queries/points';
import { useUsers } from '../../services/queries/users';
import { usePointPackages } from '../../services/queries/points';
import { getUserSelectLabel } from '../../types/user';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CreateFormData {
  user_id: string;
  package_id: string;
  payment_method: string;
  payment_reference: string;
  payment_date: string;
  admin_notes: string;
  status: string;
  selectedUser: any | null;
  selectedPackage: any | null;
}

interface FormErrors {
  user_id?: string;
  package_id?: string;
  payment_method?: string;
  payment_reference?: string;
  payment_date?: string;
  admin_notes?: string;
  status?: string;
  selectedUser?: string;
  selectedPackage?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const PointPurchaseRequestCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<CreateFormData>({
    user_id: '',
    package_id: '',
    payment_method: '',
    payment_reference: '',
    payment_date: '',
    admin_notes: '',
    status: 'pending',
    selectedUser: null,
    selectedPackage: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Hooks
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Queries
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers();
  const { data: packagesData, isLoading: packagesLoading, error: packagesError } = usePointPackages();
  const createMutation = useCreatePointPurchaseRequest();

  // Event handlers
  const handleBack = () => {
    navigate('/points/purchase-requests');
  };

  const handleInputChange = (field: keyof CreateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleUserChange = (user: any | null) => {
    setFormData(prev => ({
      ...prev,
      selectedUser: user,
      user_id: user?.id?.toString() || ''
    }));

    if (errors.selectedUser) {
      setErrors(prev => ({
        ...prev,
        selectedUser: undefined
      }));
    }
  };

  const handlePackageChange = (pkg: any | null) => {
    setFormData(prev => ({
      ...prev,
      selectedPackage: pkg,
      package_id: pkg?.id?.toString() || ''
    }));

    if (errors.selectedPackage) {
      setErrors(prev => ({
        ...prev,
        selectedPackage: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.selectedUser) {
      newErrors.user_id = 'User is required';
    }

    if (!formData.selectedPackage) {
      newErrors.package_id = 'Package is required';
    }

    if (!formData.payment_method.trim()) {
      newErrors.payment_method = 'Payment method is required';
    }

    // Payment date validation (if provided)
    if (formData.payment_date && !isValidDate(formData.payment_date)) {
      newErrors.payment_date = 'Please enter a valid date';
    }

    // Admin notes validation (if status is approved)
    if (formData.status === 'approved' && !formData.admin_notes.trim()) {
      newErrors.admin_notes = 'Admin notes are required when status is approved';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        user_id: parseInt(formData.selectedUser?.id || ''),
        package_id: parseInt(formData.selectedPackage?.id || ''),
        payment_method: formData.payment_method as 'bank_transfer' | 'cash' | 'mobile_money' | 'other',
        payment_reference: formData.payment_reference.trim() || '',
        payment_date: formData.payment_date || '',
        admin_notes: formData.admin_notes.trim() || '',
        status: formData.status as 'pending' | 'approved' | 'rejected' | 'cancelled',
      };

      const response = await createMutation.mutateAsync(payload);
      
      showSuccess(response.message || 'Point purchase request created successfully!');
      
      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/points/purchase-requests/${response.data.id}`);
      }, 1500);

    } catch (error: any) {
      showError(error?.message || 'Failed to create point purchase request');
    }
  };

  // Loading states
  if (usersLoading || packagesLoading) {
    return <PageLoadingState />;
  }

  // Error states
  if (usersError || packagesError) {
    return (
      <Box>
        <PageHeader
          title="Create Point Purchase Request"
          subtitle="Create a new point purchase request for a user"
        />
        <ActionAlert 
          error={{
            show: true,
            message: 'Failed to load required data. Please try again.'
          }}
          sx={{ mt: 2 }} 
          onClose={clearAlert} 
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to List
          </Button>
        </Box>
      </Box>
    );
  }

  const users = usersData?.data || [];
  const packages = packagesData?.data || [];

  return (
    <Box>
      <PageHeader
        title="Create Point Purchase Request"
        subtitle="Create a new point purchase request for a user"
        breadcrumbs="Dashboard / Points / Purchase Requests / Create"
        actionButton={{
          text: 'Back to Purchase Requests',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/points/purchase-requests')
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* User Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.user_id}>
                <Autocomplete
                  options={users}
                  getOptionLabel={getUserSelectLabel}
                  value={formData.selectedUser}
                  onChange={(_event, newValue) => handleUserChange(newValue)}
                  loading={usersLoading}
                  sx={{
                    '& .MuiInputBase-root': {
                      paddingLeft: '8px',
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="User *"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </Box>
                        ),
                      }}
                      error={!!errors.user_id}
                      helperText={errors.user_id}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Package Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.package_id}>
                <InputLabel></InputLabel>
                <Autocomplete
                  options={packages}
                  getOptionLabel={(option) => `${option.name_en} - ${option.points} points (${option.formatted_price})`}
                  value={formData.selectedPackage}
                  onChange={(_event, newValue) => handlePackageChange(newValue)}
                  loading={packagesLoading}
                  sx={{
                    '& .MuiInputBase-root': {
                      paddingLeft: '8px',
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Package *"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            <PackageIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </Box>
                        ),
                      }}
                      error={!!errors.package_id}
                      helperText={errors.package_id}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Payment Method */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.payment_method}>
                <InputLabel>Payment Method *</InputLabel>
                <Select
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  label="Payment Method *"
                  startAdornment={<PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="">
                    <em>Select payment method</em>
                  </MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.payment_method && (
                  <FormHelperText>{errors.payment_method}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Payment Reference */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Reference"
                value={formData.payment_reference}
                onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                placeholder="Enter payment reference (optional)"
                error={!!errors.payment_reference}
                helperText={errors.payment_reference}
              />
            </Grid>

            {/* Payment Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.payment_date}
                helperText={errors.payment_date}
              />
            </Grid>

            {/* Admin Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Admin Notes"
                multiline
                rows={4}
                value={formData.admin_notes}
                onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                placeholder="Enter admin notes (optional, but required if status is approved)"
                error={!!errors.admin_notes}
                helperText={errors.admin_notes}
              />
            </Grid>

            {/* Status Warning */}
            {formData.status === 'approved' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <strong>Note:</strong> When status is set to "Approved", points will be automatically allocated to the user immediately.
                </Alert>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={createMutation.isPending}
                >
                  Back to List
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Request'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PointPurchaseRequestCreatePage;
