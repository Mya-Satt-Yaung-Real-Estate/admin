import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  RestoreFromTrash as RestoreIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEvent, useDeleteEvent, useRestoreEvent } from '../../services/queries/events';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, DeleteConfirmationDialog, ConfirmationDialog, ActionAlert } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Event Details',
  description: 'View detailed information about the event',
  backButtonPath: '/events',
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // API Queries
  const { data: eventResponse, isLoading, error, refetch } = useEvent(slug || '');
  const deleteEventMutation = useDeleteEvent();
  const restoreEventMutation = useRestoreEvent();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete: handleDeleteConfirm,
  } = useDeleteConfirmation();

  // Handle success message from URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      // Clear the success parameter from URL
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('success');
      navigate(`${location.pathname}${newSearch.toString() ? '?' + newSearch.toString() : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);

  // Extract event data
  const event = eventResponse?.data;

  // Event handlers
  const handleBack = () => navigate(PAGE_CONFIG.backButtonPath);
  const handleEdit = () => navigate(`/events/${slug}/edit`);

  const handleDelete = () => {
    if (event && slug) {
      openDeleteConfirmation(event.name_en, 'event', async () => {
        try {
          await deleteEventMutation.mutateAsync(slug);
          showSuccess('Event deleted successfully!');
          navigate('/events');
        } catch (error: any) {
          showError(error.message || 'Failed to delete event');
        }
      });
    }
  };

  const handleRestore = () => {
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (event && slug) {
      try {
        await restoreEventMutation.mutateAsync(slug);
        showSuccess('Event restored successfully!');
        setRestoreConfirmOpen(false);
        refetch();
      } catch (error: any) {
        showError(error.message || 'Failed to restore event');
      }
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
  };

  // Check if event is deleted
  const isDeleted = event?.deleted_at !== null;

  // Loading and error states
  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={refetch} />;
  if (!event) return <PageErrorState error={new Error('Event not found')} onRetry={refetch} />;

  return (
    <Box>
      {/* Alert System */}
      <ActionAlert
        success={alert.success}
        error={alert.error}
        onClose={clearAlert}
      />

      {/* Back Button - Right aligned */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          color="primary"
        >
          Back to Events
        </Button>
      </Box>

      {/* Page Header */}
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
      />

      {/* Event Title Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
                {event.name_en}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight="500">
                {event.name_mm}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isDeleted ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    disabled={deleteEventMutation.isPending}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<RestoreIcon />}
                  onClick={handleRestore}
                  disabled={restoreEventMutation.isPending}
                >
                  Restore
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Row 1: Event Details + Event Settings + Host Info + Event Image (4 columns) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Column 1: Event Details (3/12) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ScheduleIcon color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight="600">
                  Event Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CategoryIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="500">
                      Category:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                    {event.category?.name_en || 'Unknown'}
                    {event.category?.name_mm && ` (${event.category.name_mm})`}
                  </Typography>
                </Grid>

                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CalendarIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="500">
                      Date:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                    {formatDate(event.date, 'display')}
                  </Typography>
                </Grid>

                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <TimeIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="500">
                      Time:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                    {event.start_time} to {event.end_time}
                  </Typography>
                </Grid>

                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                    <LocationIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                    <Typography variant="body2" fontWeight="500">
                      Location:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Box sx={{ mb: 0.5 }}>
                    {event.location && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {event.location}
                      </Typography>
                    )}
                    {event.township && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Township: {event.township.name_en} ({event.township.name_mm})
                      </Typography>
                    )}
                    {event.region && (
                      <Typography variant="body2">
                        Region: {event.region.name_en} ({event.region.name_mm})
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {event.tag && event.tag.length > 0 && (
                  <>
                    <Grid item xs={5}>
                      <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                        Event Tags:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {event.tag.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Column 2: Event Settings (3/12) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SettingsIcon color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight="600">
                  Event Settings
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                    Online:
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <Chip
                    label={event.is_online ? 'Yes' : 'No'}
                    size="small"
                    color={event.is_online ? 'success' : 'error'}
                    variant="filled"
                    sx={{ mb: 0.5 }}
                  />
                </Grid>

                <Grid item xs={5}>
                  <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                    Free:
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <Chip
                    label={event.is_free ? 'Yes' : 'No'}
                    size="small"
                    color={event.is_free ? 'success' : 'error'}
                    variant="filled"
                    sx={{ mb: 0.5 }}
                  />
                </Grid>

                {event.price && !event.is_free && (
                  <>
                    <Grid item xs={5}>
                      <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                        Price:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" fontWeight="600" color="primary" sx={{ mb: 0.5 }}>
                        ${event.price}
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={5}>
                  <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                    Registration:
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <Chip
                    label={event.need_registration ? 'Yes' : 'No'}
                    size="small"
                    color={event.need_registration ? 'success' : 'error'}
                    variant="filled"
                    sx={{ mb: 0.5 }}
                  />
                </Grid>

                <Grid item xs={5}>
                  <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                    Capacity:
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                    {event.user_capacity ? `${event.registration_user_count}/${event.user_capacity}` : 'Unlimited'}
                  </Typography>
                </Grid>

                <Grid item xs={5}>
                  <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                    Active:
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <Chip
                    label={event.is_active ? 'Yes' : 'No'}
                    size="small"
                    color={event.is_active ? 'success' : 'error'}
                    variant="filled"
                    sx={{ mb: 0.5 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Column 3: Host Information (3/12) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight="600">
                  Host Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <PersonIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="500">
                      Host:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                    {event.host_user?.company_name || 'Unknown'}
                  </Typography>
                </Grid>

                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <PhoneIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="500">
                      Contact:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                    {event.host_contact_number || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CalendarIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="500">
                      Created:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                    {formatDate(event.created_at, 'display')}
                  </Typography>
                </Grid>

                {event.deleted_at && (
                  <>
                    <Grid item xs={5}>
                      <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                        Deleted:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {formatDate(event.deleted_at, 'display')}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Column 4: Event Image (3/12) */}
        <Grid item xs={12} md={3}>
          {event.images && (
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ImageIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight="600">
                    Event Image
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={event.images.medium_url || event.images.url}
                    alt={event.images.filename}
                    sx={{
                      width: '100%',
                      maxWidth: 200,
                      height: 200,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => handleImageClick(event.images!.url)}
                  />
                </Box>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    {event.images!.filename}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Click to view full size
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Row 2: Description (Full Width) */}
      {event.description && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DescriptionIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight="600">
                    Event Description
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteConfirmation}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteState.itemName}"? This action cannot be undone.`}
        itemName={event.name_en}
        itemType="event"
        isLoading={deleteEventMutation.isPending}
        error={deleteEventMutation.error?.message}
      />

      <ConfirmationDialog
        open={restoreConfirmOpen}
        onConfirm={handleConfirmRestore}
        onClose={() => setRestoreConfirmOpen(false)}
        title="Restore Event"
        message={`Are you sure you want to restore "${event.name_en}"?`}
        itemName={event.name_en}
        itemType="event"
        action="restore"
        isLoading={restoreEventMutation.isPending}
        error={restoreEventMutation.error?.message}
      />

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={handleCloseImageViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageViewer}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Event Image"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventDetailPage;