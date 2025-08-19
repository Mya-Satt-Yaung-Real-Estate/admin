import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState } from '../../components/ui';
import { useCompanyType } from '../../services/queries/companies';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Company Type Details',
  description: 'View company type information',
  backButtonPath: '/company-types',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

const CompanyTypeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // Fetch company type data
  const { data: companyTypeData, isLoading, error, refetch } = useCompanyType(slug || '');

  // Handle back navigation
  const handleBack = () => {
    navigate(PAGE_CONFIG.backButtonPath);
  };

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/company-types/${slug}/edit`);
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

  const companyType = companyTypeData?.data;

  if (!companyType) {
    return (
      <PageErrorState
        title="Company Type Not Found"
        message="The requested company type could not be found"
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
        actionButton={{
          text: 'Back to List',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {companyType.name_en}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {companyType.name_mm}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  English Name
                </Typography>
                <Typography variant="body1">
                  {companyType.name_en}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Myanmar Name
                </Typography>
                <Typography variant="body1">
                  {companyType.name_mm}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Slug
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {companyType.slug}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={companyType.is_active ? 'Active' : 'Inactive'}
                  color={companyType.is_active ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {companyType.description || 'No description provided'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {formatDate(companyType.created_at, 'display')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDate(companyType.updated_at, 'display')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Back to List
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Company Type
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyTypeDetailPage;
