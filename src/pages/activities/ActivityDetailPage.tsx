import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  RestoreFromTrash as RestoreIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import {
  ActionAlert,
  ConfirmationDialog,
  DeleteConfirmationDialog,
  PageErrorState,
  PageLoadingState,
  StatusChip,
} from '../../components/ui';
import { useAlertSystem, useDeleteConfirmation } from '../../hooks';
import {
  useActivity,
  useDeleteActivity,
  useRestoreActivity,
} from '../../services/queries/activities';
import { formatDate } from '../../constants/dateFormats';

const ActivityDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  const { data: activityResponse, isLoading, error, refetch } = useActivity(slug || '');
  const deleteActivityMutation = useDeleteActivity();
  const restoreActivityMutation = useRestoreActivity();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const activity = activityResponse?.data;

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      const nextSearch = new URLSearchParams(location.search);
      nextSearch.delete('success');
      navigate(`${location.pathname}${nextSearch.toString() ? `?${nextSearch.toString()}` : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);

  const handleBack = () => navigate('/activities');
  const handleEdit = () => navigate(`/activities/${slug}/edit`);

  const handleDelete = () => {
    if (!activity) return;
    openDeleteConfirmation(activity.title, 'activity', async () => {
      try {
        await deleteActivityMutation.mutateAsync(activity.slug);
        showSuccess(`${activity.title} deleted successfully!`, true);
        navigate('/activities');
      } catch (err: any) {
        showError(err?.message || 'Failed to delete activity.', true);
      }
    });
  };

  const handleConfirmRestore = async () => {
    if (!activity) return;
    try {
      await restoreActivityMutation.mutateAsync(activity.slug);
      showSuccess(`${activity.title} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      navigate('/activities');
    } catch (err: any) {
      showError(err?.message || 'Failed to restore activity.', true);
    }
  };

  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={() => refetch()} />;
  if (!activity) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Activity not found
        </Typography>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Activities
        </Button>
      </Box>
    );
  }

  const images = activity.media?.images?.length
    ? activity.media.images
    : activity.media?.primary_image
      ? [activity.media.primary_image]
      : [];
  const isPlatformActivity = activity.user?.user_type === 'admin';
  const ownerName = isPlatformActivity
    ? 'Platform'
    : (activity.user?.company_name || activity.user?.name || 'Unknown');

  return (
    <Box>
      <PageHeader
        title={activity.title}
        subtitle={activity.description ? `${activity.description.slice(0, 80)}${activity.description.length > 80 ? '…' : ''}` : 'Activity details'}
        breadcrumbs="Dashboard / Activities / Detail"
        actionButton={{
          text: 'Back to Activities',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {activity.is_deleted ? (
          <Tooltip title="Restore Activity">
            <IconButton color="success" onClick={() => setRestoreConfirmOpen(true)}>
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
              Edit
            </Button>
            <Tooltip title="Delete Activity">
              <IconButton color="error" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <StatusChip status={activity.status} />
                {activity.show_on_homepage && (
                  <Chip icon={<HomeIcon sx={{ fontSize: 16 }} />} label="Homepage" size="small" color="info" />
                )}
                {activity.is_deleted && <Chip label="Deleted" size="small" color="error" />}
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {activity.description || 'No description provided.'}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Photos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {images.length === 0 ? (
                <Typography color="text.secondary">No photos uploaded.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {images.map((image) => (
                    <Grid item xs={12} sm={6} md={4} key={image.id}>
                      <Box
                        component="img"
                        src={image.url || image.medium_url || image.thumbnail_url}
                        alt={image.filename}
                        sx={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: image.is_primary ? '2px solid' : '1px solid',
                          borderColor: image.is_primary ? 'primary.main' : 'divider',
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Owner
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography>{ownerName}</Typography>
              </Box>
              {isPlatformActivity ? (
                <Typography variant="body2" color="text.secondary">
                  This activity is owned and managed by the platform.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {activity.user?.user_type || '—'}
                  </Typography>
                  {activity.user?.email && (
                    <Typography variant="body2" color="text.secondary">
                      {activity.user.email}
                    </Typography>
                  )}
                  {activity.user?.phone && (
                    <Typography variant="body2" color="text.secondary">
                      {activity.user.phone}
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2">
                Published: {activity.published_at ? formatDate(activity.published_at, 'displayWithTime') : '—'}
              </Typography>
              <Typography variant="body2">
                Created: {formatDate(activity.created_at, 'displayWithTime')}
              </Typography>
              <Typography variant="body2">
                Updated: {formatDate(activity.updated_at, 'displayWithTime')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete Activity"
        message={`Are you sure you want to delete "${deleteState.itemName}"?`}
        isLoading={deleteActivityMutation.isPending}
      />

      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleConfirmRestore}
        itemName={activity.title}
        itemType="activity"
        action="restore"
        isLoading={restoreActivityMutation.isPending}
        error={restoreActivityMutation.error?.message}
      />
    </Box>
  );
};

export default ActivityDetailPage;
