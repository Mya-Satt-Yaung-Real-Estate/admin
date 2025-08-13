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
import { useRegion, useDeleteRegion } from '../../services/queries/locations';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, DeleteConfirmationDialog } from '../../components/ui';
import { getStatusChipColor } from '../../utils/statusUtils';
import { getStatusLabel } from '../../constants/status';

const RegionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // API Queries
  const { data: regionData, isLoading, error } = useRegion(slug || '');
  const deleteRegionMutation = useDeleteRegion();

  // Delete confirmation
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation } = useDeleteConfirmation();

  const region = regionData?.data;

  // Event handlers
  const handleBack = () => navigate('/locations');
  const handleEdit = () => navigate(`/locations/regions/${slug}/edit`);
  const handleDelete = () => {
    if (!region) return;
    
    openDeleteConfirmation(region.name_en || region.name_mm, 'region', async () => {
      try {
        await deleteRegionMutation.mutateAsync(region.slug);
        navigate('/locations');
      } catch (error) {
        console.error('Failed to delete region:', error);
      }
    });
  };

  if (isLoading) {
    return <PageLoadingState title="Loading Region Details" />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Region"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!region) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Region Not Found
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          The region you're looking for doesn't exist or has been removed.
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
        title={region.name_en}
        subtitle={region.name_mm}
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
          Edit Region
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete Region
        </Button>
      </Box>

      <Grid container spacing={3}>
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
                    Basic details about this region
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
                      {region.name_en}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Myanmar Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {region.name_mm}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      label={getStatusLabel(region.is_active ? 'active' : 'inactive')}
                      size="small"
                      color={getStatusChipColor(region.is_active)}
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
                      {region.description || 'No description provided'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Slug
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" color="textSecondary">
                      {region.slug}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Statistics
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Region statistics and metrics
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary" fontWeight={600}>
                      {region.townships?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Townships
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight={600}>
                      {region.townships?.filter(t => t.is_active).length || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Townships
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="info.main" fontWeight={600}>
                      {region.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Region Status
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Townships List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Townships ({region.townships?.length || 0})
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Townships within this region
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {!region.townships || region.townships.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BusinessIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No Townships
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This region doesn't have any townships yet.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {region.townships.map((township) => (
                    <Grid item xs={12} sm={6} md={4} key={township.id}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                        onClick={() => navigate(`/locations/townships/${township.slug}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BusinessIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            {township.name_en}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                          {township.name_mm}
                        </Typography>

                        {township.description && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            {township.description}
                          </Typography>
                        )}

                        <Chip
                          label={getStatusLabel(township.is_active ? 'active' : 'inactive')}
                          size="small"
                          color={getStatusChipColor(township.is_active)}
                          variant="outlined"
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={deleteState.onConfirm || (() => {})}
        title="Delete Region"
        message="Are you sure you want to delete this region? This action cannot be undone and will also remove all associated townships."
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteRegionMutation.isPending}
        error={deleteRegionMutation.error?.message}
      />
    </Box>
  );
};

export default RegionDetailPage;
