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
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
  Visibility as ViewCountIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Image as ImageIcon,
  PlayArrow as PlayIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Diamond as DiamondIcon,
  PriceChange as PriceChangeIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useProperty, useDeleteProperty, useRestoreProperty, useRenewProperty } from '../../services/queries/properties';
import { employeesAPI } from '../../services/api/employees';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, PageLoadingState, PageErrorState, DeleteConfirmationDialog, ConfirmationDialog, VerificationActions, ActionAlert, RenewButton, RenewConfirmationDialog, CommentsModal } from '../../components/ui';
import { ReferralAssignmentModal } from '../../components/modals/ReferralAssignmentModal';
import { formatDate } from '../../constants/dateFormats';
import { formatPropertyCondition } from '../../utils/propertyUtils';
import { PropertyEmployeeReferral } from '../../types/employee';

const PropertyDetailPage: React.FC = () => {
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
  const { data: propertyResponse, isLoading, isFetching, error } = useProperty(Number(id));
  const deletePropertyMutation = useDeleteProperty();
  const restorePropertyMutation = useRestoreProperty();
  const renewPropertyMutation = useRenewProperty();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  // Renew confirmation state
  const [renewConfirmOpen, setRenewConfirmOpen] = useState(false);

  // Comments modal state
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);

  // Referral assignment modal state
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  // Employees list state
  const [employees, setEmployees] = useState<PropertyEmployeeReferral[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);


  // Extract property data
  const property = propertyResponse?.data;

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

  // Load employees when property is loaded
  React.useEffect(() => {
    if (property) {
      loadEmployees();
    }
  }, [property]);

  // ========================================================================
  // COMMENTS MODAL FUNCTIONS
  // ========================================================================

  const handleOpenCommentsModal = () => {
    setCommentsModalOpen(true);
  };

  const handleCloseCommentsModal = () => {
    setCommentsModalOpen(false);
  };

  // ========================================================================
  // REFERRAL MODAL FUNCTIONS
  // ========================================================================

  const handleOpenReferralModal = () => {
    setReferralModalOpen(true);
  };

  const handleCloseReferralModal = () => {
    setReferralModalOpen(false);
  };

      const handleReferralSuccess = () => {
        showSuccess('Employees assigned successfully');
        // Refresh employees list
        loadEmployees();
      };

      const handleAssignmentRemoved = () => {
        // Refresh employees list when an assignment is removed
        loadEmployees();
      };

  // ========================================================================
  // EMPLOYEES FUNCTIONS
  // ========================================================================

  const loadEmployees = async () => {
    if (!property) return;

    try {
      setEmployeesLoading(true);
      const response = await employeesAPI.getPropertyReferrals(property.id);
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setEmployeesLoading(false);
    }
  };


  // Event handlers
  const handleBack = () => navigate('/properties');
  const handleEdit = () => navigate(`/properties/${id}/edit`);
  const handleDelete = () => {
    if (!property) return;
    
    openDeleteConfirmation(
      property.title_en,
      'property',
      async () => {
        try {
          await deletePropertyMutation.mutateAsync(property.id);
          showSuccess(`${property.title_en} deleted successfully!`, true);
          navigate('/properties');
        } catch (error: any) {
          showError(error.message || 'Failed to delete property. Please try again.', true);
        }
      }
    );
  };

  const handleRestore = () => {
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!property) return;
    
    try {
      await restorePropertyMutation.mutateAsync(property.id);
      showSuccess(`${property.title_en} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      // Refresh the data to update the UI
      window.location.reload();
    } catch (error: any) {
      showError(error.message || 'Failed to restore property. Please try again.', true);
    }
  };

  const handleRenew = () => {
    setRenewConfirmOpen(true);
  };

  const handleConfirmRenew = async (notes?: string) => {
    if (!property) return;
    
    try {
      const response = await renewPropertyMutation.mutateAsync({ 
        id: property.id, 
        notes 
      });
      
      const newExpiry = response.data?.renewal_info?.new_expiry;
      const expiryDate = newExpiry ? new Date(newExpiry).toLocaleDateString() : 'N/A';
      
      showSuccess(
        `${property.title_en} renewed successfully! New expiry: ${expiryDate}`, 
        true
      );
      setRenewConfirmOpen(false);
      // Refresh the data to update the UI
      window.location.reload();
    } catch (error: any) {
      showError(error.message || 'Failed to renew property. Please try again.', true);
    }
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

  // Show loading state during refetch to ensure fresh data is displayed
  if (isFetching && !propertyResponse?.data) {
    return <PageLoadingState title="Refreshing Property Details" />;
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
        actionButton={{
          text: 'Back to Properties',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/properties')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        
        {/* Show different actions based on deleted status */}
        {!property.is_deleted ? (
          <>
            {/* Verification Actions */}
            <VerificationActions
              propertyId={property.id}
              propertyTitle={property.title_en}
              verificationStatus={property.verification_status}
              onShowSuccess={showSuccess}
              onShowError={showError}
            />
            
            {/* Referral Assignment Button */}
            <Tooltip title="Assign Referral Employee">
              <IconButton
                color="info"
                onClick={handleOpenReferralModal}
              >
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
            
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
            
            {/* Renew button - only show for expired properties */}
            {property.is_expired && (
              <RenewButton
                onClick={handleRenew}
                disabled={renewPropertyMutation.isPending}
                tooltip="Renew Property"
              />
            )}
          </>
        ) : (
          <Tooltip title="Restore Property">
            <IconButton
              color="success"
              onClick={handleRestore}
              disabled={restorePropertyMutation.isPending}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        )}
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
                    {property.tan_tan_tan && (
                      <Chip
                        label="Tan Tan Tan"
                        color="success"
                        size="small"
                        icon={<PriceChangeIcon />}
                      />
                    )}
                    {property.is_trending && (
                      <Chip
                        label="Trending"
                        color="warning"
                        size="small"
                        icon={<TrendingUpIcon />}
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
                      <Typography variant="body2" fontWeight="500">
                        Property Type: {property.property_type?.name_en || 'N/A'} ({property.property_type?.name_mm || ''})
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Listing Type: {property.listing_type?.name_en || 'N/A'} ({property.listing_type?.name_mm || ''})
                      </Typography>
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
                        Condition: {formatPropertyCondition(property.property_condition)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>


              {/* Location Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Region: {property.location?.region?.name_en || 'N/A'} ({property.location?.region?.name_mm || 'N/A'})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Township: {property.location?.township?.name_en || 'N/A'} ({property.location?.township?.name_mm || 'N/A'})
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Address: {property.location?.address || 'N/A'}
                    </Typography>
                  </Grid>
                  {/* {property.location?.latitude && property.location?.longitude && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Coordinates: {property.location.latitude}, {property.location.longitude}
                      </Typography>
                    </Grid>
                  )} */}
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Property Location Map Card */}
          {property.location?.latitude && property.location?.longitude && (
            <Card sx={{ mb: 3, mt:3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <LocationIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Property's Location Map
                    </Typography>
                    {/* <Typography variant="body2" color="textSecondary">
                      Interactive map showing property location
                    </Typography> */}
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                  Coordinates: {property.location.latitude}, {property.location.longitude}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* User Information Card */}
          {property.user && (
              <Card sx={{ mb: 3, mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {property.property_mode === 'platform' ? <BusinessIcon /> : (property.user.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {property.property_mode === 'platform' ? "Company Property" : (property.user.user_type === 'company' ? "Company Information" : "User Information")}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {property.property_mode === 'platform' ? "Platform-owned property information" : "Details about the user who posted this property"}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {property.property_mode === 'platform' ? (
                    // Platform Property Information
                    <Box>
                      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                        This property is owned and managed by the platform (Mya Satt Yaung).
                      </Typography>
                    </Box>
                  ) : (
                    // User Property Information
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {property.user.user_type === 'company' ? <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} /> : <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
                          <Typography variant="body2" fontWeight="500">
                            User Type: {property.user.user_type === 'individual' ? 'Individual' : 'Company'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DiamondIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500">
                            Member Level: {property.user.member_level || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            Email: {property.user.email || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            Status: {property.user.is_active ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </Grid>
                      {property.user.user_type === 'individual' && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight="500">
                              Name: {property.user.name || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {property.user.user_type === 'company' && (
                        <>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Typography variant="body2" fontWeight="500">
                                Company: {property.user.name || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Typography variant="body2" color="textSecondary">
                                Company Type: {property.user.company_profile?.company_type_name || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <ViewCountIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Typography variant="body2" color="textSecondary">
                                Views: {property.user.company_profile?.view_count || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Typography variant="body2" color="textSecondary">
                                Phone: {property.user.company_profile?.phone_number || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Typography variant="body2" color="textSecondary">
                                Location: {property.user.company_profile?.location_en || 'N/A'} ({property.user.company_profile?.location_mm || ''})
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Typography variant="body2" color="textSecondary">
                                Address: {property.user.company_profile?.address || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  )}
                </CardContent>
              </Card>
          )}

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
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="error.main" fontWeight={600}>
                      {property.stats?.like_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Likes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: 'secondary.50', 
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: 'secondary.100',
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                    onClick={handleOpenCommentsModal}
                  >
                    <Typography variant="h4" color="secondary.main" fontWeight={600}>
                      {property.stats?.comment_count || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Comments
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
          <Card sx={{ mb: 3 }}>
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

          {/* Assigned Employees */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Referral Employees
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Employees assigned to this property
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {employeesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : employees.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    No employees assigned to this property yet.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {employees.map((assignment) => {
                    const identifier = assignment.employee?.employee_id || assignment.employee?.email;
                    return (
                      <Box
                        key={assignment.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {assignment.employee?.name} ({identifier})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {assignment.assignment_type_label} • {new Date(assignment.assigned_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                          {assignment.employee?.position && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {assignment.employee.position}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={assignment.assignment_status}
                            size="small"
                            color={assignment.assignment_status === 'active' ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
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

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleConfirmRestore}
        itemName={property?.title_en}
        itemType="property"
        action="restore"
        isLoading={restorePropertyMutation.isPending}
        error={restorePropertyMutation.error?.message}
      />

      {/* Renew Confirmation Dialog */}
      <RenewConfirmationDialog
        open={renewConfirmOpen}
        onClose={() => setRenewConfirmOpen(false)}
        onConfirm={handleConfirmRenew}
        property={property}
        isLoading={renewPropertyMutation.isPending}
        error={renewPropertyMutation.error?.message}
      />

      {/* Comments Modal */}
      <CommentsModal
        open={commentsModalOpen}
        onClose={handleCloseCommentsModal}
        title={`Comments for ${property?.title_en || 'Property'}`}
        propertyId={property?.id || 0}
        canDelete={true}
      />

      {/* Referral Assignment Modal */}
      <ReferralAssignmentModal
        open={referralModalOpen}
        onClose={handleCloseReferralModal}
        property={property}
        onSuccess={handleReferralSuccess}
        onAssignmentRemoved={handleAssignmentRemoved}
      />
    </Box>
  );
};

export default PropertyDetailPage;
