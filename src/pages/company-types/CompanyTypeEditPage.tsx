import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { ActionAlert, PageLoadingState, PageErrorState } from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import { useCompanyType, useUpdateCompanyType } from '../../services/queries/companies';
import { UpdateCompanyTypeData } from '../../types/company';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Edit Company Type',
  description: 'Update company type information',
  backButtonPath: '/company-types',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const CompanyTypeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { alert, showError, clearAlert } = useAlertSystem();
  const updateCompanyTypeMutation = useUpdateCompanyType();

  // Fetch company type data
  const { data: companyTypeData, isLoading, error, refetch } = useCompanyType(slug || '');

  // Form state
  const [formData, setFormData] = useState<UpdateCompanyTypeData>({
    name_en: '',
    name_mm: '',
    description: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<UpdateCompanyTypeData>>({});

  // Initialize form data when company type data is loaded
  useEffect(() => {
    if (companyTypeData?.data) {
      const companyType = companyTypeData.data;
      setFormData({
        name_en: companyType.name_en,
        name_mm: companyType.name_mm,
        description: companyType.description || '',
        is_active: companyType.is_active,
      });
    }
  }, [companyTypeData]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateCompanyTypeData> = {};

    if (!formData.name_en?.trim()) {
      newErrors.name_en = 'English name is required';
    }

    if (!formData.name_mm?.trim()) {
      newErrors.name_mm = 'Myanmar name is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof UpdateCompanyTypeData, value: string | boolean) => {
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

    if (!validateForm() || !slug) {
      return;
    }

    try {
      const response = await updateCompanyTypeMutation.mutateAsync({ slug, data: formData });
      const successMessage = response.message || 'Company type updated successfully!';
      navigate(`/company-types?success=${encodeURIComponent(successMessage)}`);
    } catch (error: any) {
      showError(error?.message || 'Failed to update company type', true);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(PAGE_CONFIG.backButtonPath);
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        title="Failed to Load Company Type"
        message={error?.message || 'An error occurred while loading the company type'}
        onRetry={refetch}
        error={error}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs={`Dashboard / Master Data / Company Types / ${companyTypeData?.data?.name_en || 'Company Type'} / Edit`}
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
                  disabled={updateCompanyTypeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={updateCompanyTypeMutation.isPending}
                >
                  {updateCompanyTypeMutation.isPending ? 'Updating...' : 'Update Company Type'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyTypeEditPage;
