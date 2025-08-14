import React, { useState } from 'react';
import {
  Box,
  Paper,
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
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
  Visibility as ViewCountIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Image as ImageIcon,
  PlayArrow as PlayIcon,

} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperty, useDeleteProperty } from '../../services/queries/properties';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, PageLoadingState, PageErrorState, DeleteConfirmationDialog, VerificationActions } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();

  // Media viewer state
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoViewerOpen, setVideoViewerOpen] = useState(false);
  


  // API Queries
  const { data: propertyResponse, isLoading, error } = useProperty(Number(id));
  const deletePropertyMutation = useDeleteProperty();

  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // Extract property data
  const property = propertyResponse?.data;

  // Event handlers
  const handleBack = () => navigate('/properties');
  const handleEdit = () => navigate(`/properties/${id}/edit`);
  const handleDelete = () => {
    if (!property) return;
    
    openDeleteConfirmation(
      property.title_en,
      'property',
      () => {
        deletePropertyMutation.mutate(property.id);
      }
    );
  };

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



  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Property Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Property"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!property) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Property Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The property you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Properties
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={property.title_en}
        subtitle={property.title_mm}
        breadcrumbs="Dashboard / Property Management / Property Details"
      />

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Properties
        </Button>
        
        {/* Verification Actions */}
        <VerificationActions
          propertyId={property.id}
          propertyTitle={property.title_en}
          verificationStatus={property.verification_status}
        />
        
        <Tooltip title="Edit Property">
          <IconButton
            color="primary"
            onClick={handleEdit}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Property">
          <IconButton
            color="error"
            onClick={handleDelete}
            disabled={deletePropertyMutation.isPending}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Main Property Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {property.title_en}
                  </Typography>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {property.title_mm}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <StatusChip status={property.status} />
                    <StatusChip status={property.verification_status} statusType="verification_status" />
                    {property.is_featured && (
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
                  {property.description}
                </Typography>
              </Box>

              {/* Property Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <HomeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          Property Type: {property.property_type?.name_en || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {property.property_type?.name_mm || ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          Listing Type: {property.listing_type?.name_en || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {property.listing_type?.name_mm || ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Bedrooms: {property.bedrooms || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BathIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Bathrooms: {property.bathrooms || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AreaIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Area: {property.area_sqft} sqft
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Condition: {property.property_condition}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Features
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {property.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Location Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Region: {property.location?.region?.name_en || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Township: {property.location?.township?.name_en || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Address: {property.location?.address || 'N/A'}
                    </Typography>
                  </Grid>
                  {property.location?.latitude && property.location?.longitude && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Coordinates: {property.location.latitude}, {property.location.longitude}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} lg={4}>
          {/* Price Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PriceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Price
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Property pricing information
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="h4" color="success.main" fontWeight={600} gutterBottom>
                {property.formatted_price}
              </Typography>

              {property.bank_installment_available && (
                <Chip
                  label="Bank Installment Available"
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </CardContent>
          </Card>

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
                    Property performance metrics
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary" fontWeight={600}>
                      {property.stats?.view_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Views
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight={600}>
                      {property.stats?.contact_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Contacts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.main" fontWeight={600}>
                      {property.stats?.favorite_count || 0}
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
                    Owner contact details
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="500" gutterBottom>
                  Owner: {property.contact_info?.owner_name || 'N/A'}
                </Typography>
              </Box>

              {property.contact_info?.phone_numbers && property.contact_info.phone_numbers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Phone Numbers:
                  </Typography>
                  {property.contact_info.phone_numbers.map((phone, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                      {phone}
                    </Typography>
                  ))}
                </Box>
              )}

              {property.contact_info?.email && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Email:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {property.contact_info.email}
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
                    Created: {formatDate(property.dates?.created_at, 'display')}
                  </Typography>
                </Grid>
                {property.dates?.published_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Published: {formatDate(property.dates.published_at, 'display')}
                    </Typography>
                  </Grid>
                )}
                {property.dates?.verified_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Verified: {formatDate(property.dates.verified_at, 'display')}
                    </Typography>
                  </Grid>
                )}
                {property.dates?.expires_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Expires: {formatDate(property.dates.expires_at, 'display')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Media Section */}
        {property.media && (property.media.images?.length > 0 || property.media.videos?.length > 0) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ImageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Media ({property.media?.images?.length || 0} images, {property.media?.videos?.length || 0} videos)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Property photos and videos
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {/* Images */}
                  {property.media?.images?.map((image) => (
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
                          alt={image.filename}
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
                  {property.media?.videos?.map((video) => (
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
                            alt={video.filename}
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
                alt={selectedImage.filename}
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
                    {selectedImage.filename}
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
                    {selectedVideo.filename}
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
        isLoading={deletePropertyMutation.isPending}
        error={deletePropertyMutation.error?.message}
      />
    </Box>
  );
};

export default PropertyDetailPage;
