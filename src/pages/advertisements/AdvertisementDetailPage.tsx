import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,

  Visibility as ViewCountIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Image as ImageIcon,
  PlayArrow as PlayIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Diamond as DiamondIcon,
  CheckCircle as CheckCircleIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAdvertisement, useDeleteAdvertisement, useRestoreAdvertisement } from '../../services/queries/advertisements';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, PageLoadingState, PageErrorState, DeleteConfirmationDialog, ConfirmationDialog, ActionAlert } from '../../components/ui';
import { AdvertisementVerificationActions } from '../../components/ui/AdvertisementVerificationActions';
import { formatDate } from '../../constants/dateFormats';

const AdvertisementDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const theme = useTheme();

  // Media viewer state
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoViewerOpen, setVideoViewerOpen] = useState(false);

  // API Queries
  const { data: advertisementResponse, isLoading, error } = useAdvertisement(Number(id));
  const deleteAdvertisementMutation = useDeleteAdvertisement();
  const restoreAdvertisementMutation = useRestoreAdvertisement();

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
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

  // Extract advertisement data
  const advertisement = advertisementResponse?.data;
  
  // Debug: Log advertisement data to see media structure
  console.log('Advertisement data:', advertisement);
  console.log('Media data:', advertisement?.media);
  console.log('Images:', advertisement?.media?.images);
  console.log('Videos:', advertisement?.media?.videos);

  // Event handlers
  const handleBack = () => navigate('/advertisements');
  const handleEdit = () => navigate(`/advertisements/${id}/edit`);
  
  // Image viewer handlers
  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
  };

  // Video viewer handlers
  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setVideoViewerOpen(true);
  };

  const handleCloseVideoViewer = () => {
    setVideoViewerOpen(false);
    setSelectedVideo(null);
  };

  const handleDelete = () => {
    if (!advertisement) return;
    
    openDeleteConfirmation(
      advertisement.title_en,
      'advertisement',
      async () => {
        try {
          await deleteAdvertisementMutation.mutateAsync(advertisement.id);
          navigate(`/advertisements?success=${encodeURIComponent(`${advertisement.title_en} deleted successfully!`)}`);
        } catch (error: any) {
          showError(error.message || 'Failed to delete advertisement. Please try again.', true);
        }
      }
    );
  };

  const handleRestore = () => {
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!advertisement) return;
    
    try {
      await restoreAdvertisementMutation.mutateAsync(advertisement.id);
      showSuccess(`${advertisement.title_en} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      // Refresh the data to update the UI
      window.location.reload();
    } catch (error: any) {
      showError(error.message || 'Failed to restore advertisement. Please try again.', true);
    }
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Advertisement Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Advertisement"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!advertisement) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Advertisement Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The advertisement you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Advertisements
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={advertisement.title_en}
        subtitle={advertisement.title_mm}
        breadcrumbs="Dashboard / Advertisement Management / Advertisement Details"
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Advertisements
        </Button>
        
        {/* Show different actions based on deleted status */}
        {!advertisement.is_deleted ? (
          <>
            <Tooltip title="Edit Advertisement">
              <IconButton
                color="primary"
                onClick={handleEdit}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            {/* Verification Actions - Only show for pending advertisements */}
            {advertisement.verification_status === 'pending' && (
              <AdvertisementVerificationActions
                advertisementId={advertisement.id}
                advertisementTitle={advertisement.title_en}
                verificationStatus={advertisement.verification_status}
                onShowSuccess={showSuccess}
                onShowError={showError}
                size="medium"
              />
            )}
            
            <Tooltip title="Delete Advertisement">
              <IconButton
                color="error"
                onClick={handleDelete}
                disabled={deleteAdvertisementMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Restore Advertisement">
            <IconButton
              color="success"
              onClick={handleRestore}
              disabled={restoreAdvertisementMutation.isPending}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Advertisement Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {advertisement.title_en}
                  </Typography>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {advertisement.title_mm}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <StatusChip status={advertisement.status} />
                    <StatusChip status={advertisement.verification_status} statusType="verification_status" />
                    {advertisement.is_featured && (
                      <Chip
                        label="Featured"
                        color="warning"
                        size="small"
                        icon={<StarIcon />}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {advertisement.description}
                </Typography>
              </Box>

              {/* Location Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Region: {advertisement.location?.region?.name_en || advertisement.region?.name_en || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Township: {advertisement.location?.township?.name_en || advertisement.township?.name_en || 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Address: {advertisement.location?.address || advertisement.address || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* User Information Card */}
          {advertisement.user && (
            <Card sx={{ mb: 3, mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {advertisement.advertisement_mode === 'platform' ? <BusinessIcon /> : (advertisement.user.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {advertisement.advertisement_mode === 'platform' ? "Platform Advertisement" : (advertisement.user.user_type === 'company' ? "Company Information" : "User Information")}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {advertisement.advertisement_mode === 'platform' ? "Platform-owned advertisement information" : "Details about the user who posted this advertisement"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {advertisement.advertisement_mode === 'platform' ? (
                  // Platform Advertisement Information
                  <Box>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                      This advertisement is owned and managed by the platform (Mya Satt Yaung).
                    </Typography>
                  </Box>
                ) : (
                  // User Advertisement Information
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {advertisement.user.user_type === 'company' ? <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} /> : <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
                        <Typography variant="body2" fontWeight="500">
                          User Type: {advertisement.user.user_type === 'individual' ? 'Individual' : 'Company'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DiamondIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="500">
                          Member Level: {advertisement.user.member_level || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          Email: {advertisement.user.email || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          Status: {advertisement.user.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="500">
                          Name: {advertisement.user.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                                 )}
               </CardContent>
             </Card>
           )}
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} lg={4}>

          {/* Statistics Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ViewCountIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Statistics
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Advertisement performance metrics
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary" fontWeight={600}>
                      {advertisement.stats?.view_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Views
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight={600}>
                      {advertisement.stats?.contact_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Contacts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.main" fontWeight={600}>
                      {advertisement.stats?.favorite_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Favorites
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <PhoneIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Contact Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Contact details
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Contact: {advertisement.contact_info?.contact_name || 'N/A'}
                </Typography>
              </Box>

              {advertisement.contact_info?.phone_numbers && advertisement.contact_info.phone_numbers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Phone Numbers:
                  </Typography>
                  {advertisement.contact_info.phone_numbers.map((phone, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                      {phone}
                    </Typography>
                  ))}
                </Box>
              )}

              {advertisement.contact_info?.email && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Email:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {advertisement.contact_info.email}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'default.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Timestamps
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Important dates
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Created: {advertisement.dates?.created_at ? formatDate(advertisement.dates.created_at, 'display') : 'N/A'}
                  </Typography>
                </Grid>
                {advertisement.dates?.published_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Published: {formatDate(advertisement.dates.published_at, 'display')}
                    </Typography>
                  </Grid>
                )}
                {advertisement.dates?.verified_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Verified: {formatDate(advertisement.dates.verified_at, 'display')}
                    </Typography>
                  </Grid>
                )}
                {advertisement.dates?.expires_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Expires: {formatDate(advertisement.dates.expires_at, 'display')}
                    </Typography>
                  </Grid>
                )}
                {advertisement.dates?.last_renewed_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Last Renewed: {formatDate(advertisement.dates.last_renewed_at, 'display')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Media Section */}
                {((advertisement.media?.images && advertisement.media.images.length > 0) ||
          (advertisement.media?.videos && advertisement.media.videos.length > 0) || 
          (advertisement.media && Array.isArray(advertisement.media) && advertisement.media.length > 0)) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ImageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Media ({advertisement.media?.images?.length || 0} images, {advertisement.media?.videos?.length || 0} videos)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Advertisement photos and videos
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {/* Images */}
                  {advertisement.media?.images?.map((image) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                      <Paper
                        sx={{
                          p: 1,
                          textAlign: 'center',
                          border: image.is_primary ? '2px solid' : '1px solid',
                          borderColor: image.is_primary ? 'primary.main' : 'divider',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: theme.shadows[4],
                          },
                        }}
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image.thumbnail_url}
                          alt={image.file_name || 'Advertisement image'}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {image.is_primary ? 'Primary Image' : 'Gallery Image'}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          Click to view
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                  
                  {/* Videos */}
                  {advertisement.media?.videos?.map((video) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                      <Paper
                        sx={{
                          p: 1,
                          textAlign: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: theme.shadows[4],
                          },
                        }}
                        onClick={() => handleVideoClick(video)}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={video.thumbnail_url || '/placeholder-video.jpg'}
                            alt={video.file_name || 'Advertisement video'}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                              borderRadius: '50%',
                              width: 48,
                              height: 48,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PlayIcon sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                        </Box>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Video
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          Click to play
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                {/* Fallback: If media is a direct array */}
                {advertisement.media && Array.isArray(advertisement.media) && advertisement.media.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      All Media ({advertisement.media.length} files)
                    </Typography>
                    <Grid container spacing={2}>
                      {advertisement.media.map((media: any) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={media.id}>
                          <Paper
                            sx={{
                              p: 1,
                              textAlign: 'center',
                              border: media.is_primary ? '2px solid' : '1px solid',
                              borderColor: media.is_primary ? 'primary.main' : 'divider',
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: theme.shadows[4],
                              },
                            }}
                            onClick={() => media.type === 'image' ? handleImageClick(media) : handleVideoClick(media)}
                          >
                            {media.type === 'image' ? (
                              <img
                                src={media.thumbnail_url || media.url}
                                alt={media.filename || 'Advertisement media'}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                }}
                              />
                            ) : (
                              <Box sx={{ position: 'relative' }}>
                                <img
                                  src={media.thumbnail_url || '/placeholder-video.jpg'}
                                  alt={media.filename || 'Advertisement video'}
                                  style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                    borderRadius: '50%',
                                    width: 48,
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <PlayIcon sx={{ color: 'white', fontSize: 24 }} />
                                </Box>
                              </Box>
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              {media.type === 'image' ? (media.is_primary ? 'Primary Image' : 'Gallery Image') : 'Video'}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                              Click to {media.type === 'image' ? 'view' : 'play'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Image Viewer Modal */}
      <Dialog
        open={imageViewerOpen}
        onClose={handleCloseImageViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          {selectedImage && (
            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              <img
                src={selectedImage.url}
                alt={selectedImage.filename || 'Advertisement image'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <IconButton
                  onClick={handleCloseImageViewer}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                  <Typography variant="body2">
                    {selectedImage.file_name || 'Advertisement image'}
                  </Typography>
                  {selectedImage.is_primary && (
                    <Chip
                      label="Primary Image"
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Viewer Modal */}
      <Dialog
        open={videoViewerOpen}
        onClose={handleCloseVideoViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          {selectedVideo && (
            <Box sx={{ position: 'relative', textAlign: 'center', width: '100%' }}>
              <video
                src={selectedVideo.url}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '8px',
                }}
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <IconButton
                  onClick={handleCloseVideoViewer}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                  <Typography variant="body2">
                    {selectedVideo.file_name || 'Advertisement video'}
                  </Typography>
                  <Chip
                    label="Video"
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteAdvertisementMutation.isPending}
        error={deleteAdvertisementMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleConfirmRestore}
        itemName={advertisement?.title_en}
        itemType="advertisement"
        action="restore"
        isLoading={restoreAdvertisementMutation.isPending}
        error={restoreAdvertisementMutation.error?.message}
      />
    </Box>
  );
};

export default AdvertisementDetailPage;
