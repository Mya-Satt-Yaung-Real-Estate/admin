import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePointPackage } from '../../services/queries/points';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, StatusChip, FeatureBadgeChip } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';

const PointPackageDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // Queries
  const { data: pointPackageData, isLoading, error } = usePointPackage(slug || '');

  // Event handlers
  const handleEdit = () => {
    navigate(`/points/packages/${slug}/edit`);
  };

  const handleBack = () => {
    navigate('/points/packages');
  };

  // Loading and error states
  if (isLoading) {
    return <PageLoadingState title="Loading Point Package" />;
  }

  if (error || !pointPackageData?.data) {
    return (
      <Box>
        <PageHeader
          title="Point Package Details"
          subtitle="View point package information"
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error?.message || 'Failed to load point package. Please try again.'}
        </Alert>
      </Box>
    );
  }

  const pointPackage = pointPackageData.data;

  return (
    <Box>
      <PageHeader
        title="Point Package Details"
        subtitle="View point package information"
        breadcrumbs={`Dashboard / Points / Packages / ${pointPackage.name_en}`}
        actionButton={{
          text: 'Back to Packages',
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <StarIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" fontWeight={600}>
            Point Package Information
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              English Name
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {pointPackage.name_en}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Myanmar Name
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {pointPackage.name_mm}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              English Description
            </Typography>
            <Typography variant="body1">
              {pointPackage.description_en || 'No English description provided'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Myanmar Description
            </Typography>
            <Typography variant="body1">
              {pointPackage.description_mm || 'No Myanmar description provided'}
            </Typography>
          </Grid>

          {/* Point Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Point Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Points
            </Typography>
            <Chip
              label={(pointPackage.points || 0).toLocaleString()}
              color="primary"
              variant="outlined"
              icon={<StarIcon />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Price (MMK)
            </Typography>
            <Typography variant="body1" fontWeight={500} color="success.main">
              {(pointPackage.price_mmk || 0).toLocaleString()} MMK
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Expiry Days
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {pointPackage.expiry_days ?? 'System default'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Feature Badge
            </Typography>
            {pointPackage.feature ? (
              <FeatureBadgeChip label={pointPackage.feature} />
            ) : (
              <Typography variant="body2" color="textSecondary">
                —
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Formatted Price
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {pointPackage.formatted_price}
            </Typography>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Statistics
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Total Purchases
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {(pointPackage.total_purchases || 0).toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="body1" fontWeight={500} color="info.main">
              {(pointPackage.total_revenue || 0).toLocaleString()} MMK
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Purchase Requests Count
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {pointPackage.purchase_requests_count || 0}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              User Points Count
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {(pointPackage.user_points_count || 0).toLocaleString()} points
            </Typography>
          </Grid>

          {/* Status and Dates */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Status & Dates
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Status
            </Typography>
            <StatusChip status={pointPackage.is_active ? 'active' : 'inactive'} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Available
            </Typography>
            <StatusChip status={pointPackage.is_available ? 'active' : 'inactive'} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Slug
            </Typography>
            <Chip
              label={pointPackage.slug}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Created Date
            </Typography>
            <Typography variant="body2">
              {formatDate(pointPackage.created_at, 'displayWithTime')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Last Updated
            </Typography>
            <Typography variant="body2">
              {formatDate(pointPackage.updated_at, 'displayWithTime')}
            </Typography>
          </Grid>

          {/* Deletion Info (if deleted) */}
          {pointPackage.deleted_at && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Deletion Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Deleted At
                </Typography>
                <Typography variant="body2" color="error.main">
                  {formatDate(pointPackage.deleted_at, 'displayWithTime')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Deletion Reason
                </Typography>
                <Typography variant="body2" color="error.main">
                  {pointPackage.deletion_reason || 'No reason provided'}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Point Package
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PointPackageDetailPage;
