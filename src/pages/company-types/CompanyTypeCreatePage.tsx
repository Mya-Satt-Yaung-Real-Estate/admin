import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCreateCompanyType } from '../../services/queries/companies';
import { CreateCompanyTypeData } from '../../types/company';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Create Company Type',
  description: 'Add a new company type to the system',
  backButtonPath: '/company-types',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const CompanyTypeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { alert, showError, clearAlert } = useAlertSystem();
  const createCompanyTypeMutation = useCreateCompanyType();

  // Form state
  const [formData, setFormData] = useState<CreateCompanyTypeData>({
    name_en: '',
    name_mm: '',
    description: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<CreateCompanyTypeData>>({});

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCompanyTypeData> = {};

    if (!formData.name_en.trim()) {
      newErrors.name_en = 'English name is required';
    }

    if (!formData.name_mm.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateCompanyTypeData, value: string | boolean) => {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await createCompanyTypeMutation.mutateAsync(formData);
      const successMessage = response.message || 'Company type created successfully!';
      navigate(`/company-types?success=${encodeURIComponent(successMessage)}`);
    } catch (error: any) {
      showError(error?.message || 'Failed to create company type', true);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(PAGE_CONFIG.backButtonPath);
  };

  return (
    <Box>
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: 'Back to List',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* English Name */}
              <TextField
                label="Name (English)"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                error={!!errors.name_en}
                helperText={errors.name_en}
                required
                fullWidth
              />

              {/* Myanmar Name */}
              <TextField
                label="Name (Myanmar)"
                value={formData.name_mm}
                onChange={(e) => handleInputChange('name_mm', e.target.value)}
                error={!!errors.name_mm}
                helperText={errors.name_mm}
                required
                fullWidth
              />

              {/* Description */}
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description || 'Optional description for this company type'}
                multiline
                rows={3}
                fullWidth
              />

              {/* Active Status */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />

              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={createCompanyTypeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={createCompanyTypeMutation.isPending}
                >
                  {createCompanyTypeMutation.isPending ? 'Creating...' : 'Create Company Type'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyTypeCreatePage;
