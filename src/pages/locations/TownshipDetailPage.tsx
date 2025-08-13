import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTownship, useDeleteTownship } from '../../services/queries/locations';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, DeleteConfirmationDialog } from '../../components/ui';
import { getStatusChipColor } from '../../utils/statusUtils';
import { getStatusLabel } from '../../constants/status';

const TownshipDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // API Queries
  const { data: townshipData, isLoading, error } = useTownship(slug || '');
  const deleteTownshipMutation = useDeleteTownship();

  // Delete confirmation
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation } = useDeleteConfirmation();

  const township = townshipData?.data;

  // Event handlers
  const handleBack = () => navigate('/locations');
  const handleEdit = () => navigate(`/locations/townships/${slug}/edit`);
  const handleDelete = () => {
    if (!township) return;
    
    openDeleteConfirmation(township.name_en || township.name_mm, 'township', async () => {
      try {
        await deleteTownshipMutation.mutateAsync(township.slug);
        navigate('/locations');
      } catch (error) {
        console.error('Failed to delete township:', error);
      }
    });
  };

  if (isLoading) {
    return <PageLoadingState title="Loading Township Details" />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Township"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!township) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Township Not Found
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          The township you're looking for doesn't exist or has been removed.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/locations')}>
          Back to Locations
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={township.name_en}
        subtitle={township.name_mm}
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Locations
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Township
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete Township
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Township Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Township Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Basic details about this township
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      English Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {township.name_en}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Myanmar Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {township.name_mm}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      label={getStatusLabel(township.is_active ? 'active' : 'inactive')}
                      size="small"
                      color={getStatusChipColor(township.is_active)}
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '60%', textAlign: 'right' }}>
                      {township.description || 'No description provided'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Slug
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" color="textSecondary">
                      {township.slug}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Region Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <LocationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Region Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Parent region details
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {township.region ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Region Name (EN)
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {township.region.name_en}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Region Name (MM)
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {township.region.name_mm}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Region Status
                      </Typography>
                      <Chip
                        label={getStatusLabel(township.region.is_active ? 'active' : 'inactive')}
                        size="small"
                        color={getStatusChipColor(township.region.is_active)}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Region Description
                      </Typography>
                      <Typography variant="body1" sx={{ maxWidth: '60%', textAlign: 'right' }}>
                        {township.region.description || 'No description provided'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Region Slug
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" color="textSecondary">
                        {township.region.slug}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                          border: '1px solid',
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        }}
                        onClick={() => navigate(`/locations/regions/${township.region!.slug}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="body2" fontWeight={500} color="primary.main">
                            View Region Details
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocationIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No Region Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This township is not associated with any region.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                 <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                   <BusinessIcon />
                 </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Township Statistics
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Key metrics and information
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="secondary.main" fontWeight={600}>
                      {township.id}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Township ID
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight={600}>
                      {township.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="info.main" fontWeight={600}>
                      {township.region_id}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Region ID
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.main" fontWeight={600}>
                      {township.region ? '✓' : '✗'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Has Region
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={deleteState.onConfirm || (() => {})}
        title="Delete Township"
        message="Are you sure you want to delete this township? This action cannot be undone."
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteTownshipMutation.isPending}
        error={deleteTownshipMutation.error?.message}
      />
    </Box>
  );
};

export default TownshipDetailPage;
