import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  useShareProfitListing,
  useDeleteShareProfitListing,
  useRestoreShareProfitListing,
  useToggleShareProfitListingStatus,
  useApproveShareProfitListing,
  useRejectShareProfitListing,
  useRenewShareProfitListing,
  useShareProfitListingStatistics,
} from '../../services/queries/shareProfitListings';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, PageLoadingState, PageErrorState, DeleteConfirmationDialog, ActionAlert, ConfirmationDialog, RenewButton } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';

const ShareProfitListingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  // API Queries
  const { data: shareProfitListingResponse, isLoading, isFetching, error, refetch } = useShareProfitListing(slug!);
  const deleteShareProfitListingMutation = useDeleteShareProfitListing();
  const restoreShareProfitListingMutation = useRestoreShareProfitListing();
  const toggleShareProfitListingStatusMutation = useToggleShareProfitListingStatus();
  const approveShareProfitListingMutation = useApproveShareProfitListing();
  const rejectShareProfitListingMutation = useRejectShareProfitListing();
  const renewShareProfitListingMutation = useRenewShareProfitListing();
  const { data: statistics } = useShareProfitListingStatistics();

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  // Toggle status confirmation state
  const [toggleStatusConfirmOpen, setToggleStatusConfirmOpen] = useState(false);

  // Verification dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [renewConfirmOpen, setRenewConfirmOpen] = useState(false);

  const renewalDays = statistics?.data?.renewal?.days ?? 30;
  const renewalPointsEnabled = Boolean(statistics?.data?.renewal?.points_enabled);
  const renewalPointCost = statistics?.data?.renewal?.point_cost ?? 0;

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // Extract share profit listing data
  const shareProfitListing = shareProfitListingResponse?.data;

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

  // Event handlers
  const handleBack = () => navigate('/share-profit-listings');
  const handleEdit = () => navigate(`/share-profit-listings/${slug}/edit`);
  const handleDelete = () => {
    if (!shareProfitListing) return;

    openDeleteConfirmation(
      shareProfitListing.title,
      'share profit listing',
      async () => {
        try {
          await deleteShareProfitListingMutation.mutateAsync(shareProfitListing.slug);
          showSuccess(`${shareProfitListing.title} deleted successfully!`, true);
          navigate('/share-profit-listings');
        } catch (error: any) {
          showError(error.message || 'Failed to delete share profit listing. Please try again.', true);
        }
      }
    );
  };

  const handleRestore = () => {
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!shareProfitListing) return;

    try {
      await restoreShareProfitListingMutation.mutateAsync(shareProfitListing.slug);
      showSuccess(`${shareProfitListing.title} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      // Redirect to the list page after successful restoration
      navigate('/share-profit-listings');
    } catch (error: any) {
      showError(error.message || 'Failed to restore share profit listing. Please try again.', true);
    }
  };

  const handleToggleStatus = () => {
    if (!shareProfitListing) return;

    setToggleStatusConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!shareProfitListing) return;

    try {
      const response = await toggleShareProfitListingStatusMutation.mutateAsync(shareProfitListing.slug);
      const newStatus = response.data.is_active ? 'enabled' : 'disabled';
      showSuccess(`${shareProfitListing.title} ${newStatus} successfully!`, true);
      setToggleStatusConfirmOpen(false);
      // Refresh the specific share profit listing data to update the UI
      refetch();
    } catch (error: any) {
      showError(error.message || 'Failed to toggle status. Please try again.', true);
    }
  };

  const handleConfirmApprove = async () => {
    if (!shareProfitListing) return;

    try {
      await approveShareProfitListingMutation.mutateAsync(shareProfitListing.slug);
      showSuccess(`${shareProfitListing.title} approved successfully!`, true);
      setApproveDialogOpen(false);
      refetch();
    } catch (error: any) {
      showError(error.message || 'Failed to approve share profit listing. Please try again.', true);
    }
  };

  const handleConfirmReject = async () => {
    if (!shareProfitListing || !rejectionReason.trim()) return;

    try {
      await rejectShareProfitListingMutation.mutateAsync({
        slug: shareProfitListing.slug,
        reason: rejectionReason.trim(),
      });
      showSuccess(`${shareProfitListing.title} rejected successfully!`, true);
      setRejectDialogOpen(false);
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      showError(error.message || 'Failed to reject share profit listing. Please try again.', true);
    }
  };

  const handleConfirmRenew = async () => {
    if (!shareProfitListing) return;

    try {
      const response = await renewShareProfitListingMutation.mutateAsync(shareProfitListing.slug);
      const newExpiry = response.data?.renewal_info?.new_expiry;
      const expiryDate = newExpiry ? new Date(newExpiry).toLocaleDateString() : 'N/A';
      const pointsConsumed = response.data?.renewal_info?.points_consumed ?? 0;

      showSuccess(
        pointsConsumed > 0
          ? `${shareProfitListing.title} renewed! New expiry: ${expiryDate}. Points used: ${pointsConsumed}.`
          : `${shareProfitListing.title} renewed successfully! New expiry: ${expiryDate}`,
        true
      );
      setRenewConfirmOpen(false);
      refetch();
    } catch (error: any) {
      showError(error.message || 'Failed to renew share profit listing. Please try again.', true);
    }
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Share Profit Listing Details" />;
  }

  // Show loading state during refetch to ensure fresh data is displayed
  if (isFetching && !shareProfitListingResponse?.data) {
    return <PageLoadingState title="Refreshing Share Profit Listing Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Share Profit Listing"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!shareProfitListing) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Share Profit Listing Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The share profit listing you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Share Profit Listings
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={shareProfitListing.title}
        subtitle={typeof shareProfitListing.description === 'string' && shareProfitListing.description.length > 0 ? shareProfitListing.description.substring(0, 50) + '...' : 'N/A'}
        breadcrumbs="Dashboard / Share Profit Listing Management / Share Profit Listing Details"
        actionButton={{
          text: 'Back to Share Profit Listings',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/share-profit-listings')
        }}
      />

      {/* Success/Error Alert */}
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>

        {/* Check if the record is soft-deleted based on deleted_at field */}
        {(() => {
          // Properly check if deleted_at field exists and is not null/undefined/empty
          let isDeleted = false;
          if (shareProfitListing.deleted_at === null ||
              shareProfitListing.deleted_at === undefined ||
              shareProfitListing.deleted_at === '') {
            isDeleted = false;
          } else {
            // If it's a string, check if it's not empty
            // If it's an object, consider it as deleted if it exists
            isDeleted = (typeof shareProfitListing.deleted_at === 'string' && shareProfitListing.deleted_at.trim() !== '') ||
                        (typeof shareProfitListing.deleted_at === 'object' && shareProfitListing.deleted_at !== null);
          }

          return isDeleted ? (
            // For deleted records, show restore button
            <Tooltip title="Restore Share Profit Listing">
              <IconButton
                color="success"
                onClick={handleRestore}
                disabled={restoreShareProfitListingMutation.isPending}
              >
                <RestoreIcon />
              </IconButton>
            </Tooltip>
          ) : (
            // For active records, show status, edit, and delete buttons
            <>
              {shareProfitListing.status?.verification_status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setApproveDialogOpen(true)}
                    disabled={approveShareProfitListingMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={rejectShareProfitListingMutation.isPending}
                  >
                    Reject
                  </Button>
                </>
              )}

              <Tooltip title={shareProfitListing.is_active ? "Disable Share Profit Listing" : "Enable Share Profit Listing"}>
                <IconButton
                  color={shareProfitListing.is_active ? "error" : "success"}
                  onClick={handleToggleStatus}
                  disabled={toggleShareProfitListingStatusMutation.isPending}
                >
                  {shareProfitListing.is_active ? <CancelIcon /> : <CheckCircleIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Edit Share Profit Listing">
                <IconButton
                  color="primary"
                  onClick={handleEdit}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Share Profit Listing">
                <IconButton
                  color="error"
                  onClick={handleDelete}
                  disabled={deleteShareProfitListingMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>

              {shareProfitListing.status?.is_expired && (
                <RenewButton
                  onClick={() => setRenewConfirmOpen(true)}
                  disabled={renewShareProfitListingMutation.isPending}
                  tooltip="Renew Share Profit Listing"
                />
              )}
            </>
          );
        })()}
      </Box>

      <Grid container spacing={3}>
        {/* Main Share Profit Listing Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {shareProfitListing?.title || 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {shareProfitListing?.description || 'N/A'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <StatusChip status={shareProfitListing?.status?.status || 'unknown'} />
                    <StatusChip
                      status={shareProfitListing?.status?.verification_status || 'pending'}
                      statusType="verification_status"
                    />
                    <StatusChip status={shareProfitListing?.wanted_type || 'unknown'} />
                    <StatusChip status={shareProfitListing?.is_active ? 'active' : 'inactive'} />
                  </Box>
                  {shareProfitListing?.status?.verification_status === 'rejected' &&
                    shareProfitListing?.status?.rejection_reason && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        Rejection reason: {shareProfitListing.status.rejection_reason}
                      </Typography>
                    )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Share Profit Listing Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Share Profit Listing Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Type: {shareProfitListing?.wanted_type_label
                          || (shareProfitListing?.wanted_type === 'buyer' ? 'Buyer'
                            : shareProfitListing?.wanted_type === 'renter' ? 'Renter'
                            : shareProfitListing?.wanted_type === 'seller' ? 'Seller'
                            : shareProfitListing?.wanted_type === 'share_profit' ? 'Share Profit'
                            : shareProfitListing?.wanted_type || 'N/A')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <HomeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Property Type: {shareProfitListing?.property_type?.name_en || 'N/A'} ({shareProfitListing?.property_type?.name_mm || ''})
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        {shareProfitListing?.preferred_location?.region ? "Preferred Region: " + (shareProfitListing.preferred_location.region.name_en || 'N/A') + " (" + (shareProfitListing.preferred_location.region.name_mm || '') + ")" : "Preferred Region: " + (shareProfitListing?.location?.region_en || 'N/A') + " (" + (shareProfitListing?.location?.region_mm || '') + ")"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        {shareProfitListing?.preferred_location?.township ? "Preferred Township: " + (shareProfitListing.preferred_location.township.name_en || 'N/A') + " (" + (shareProfitListing.preferred_location.township.name_mm || '') + ")" : "Preferred Township: " + (shareProfitListing?.location?.township_en || 'N/A') + " (" + (shareProfitListing?.location?.township_mm || '') + ")"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PriceIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Budget Range: {shareProfitListing?.budget?.min_budget || 'N/A'} - {shareProfitListing?.budget?.max_budget || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Bedrooms: {shareProfitListing?.specifications?.bedrooms || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BathIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Bathrooms: {shareProfitListing?.specifications?.bathrooms || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AreaIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        {shareProfitListing?.specifications?.min_area !== undefined && shareProfitListing?.specifications?.max_area !== undefined && shareProfitListing.specifications.min_area !== null && shareProfitListing.specifications.max_area !== null
                          ? `Area: ${shareProfitListing.specifications.min_area} - ${shareProfitListing.specifications.max_area} sqft`
                          : `Area: ${shareProfitListing?.specifications?.area_range || 'N/A'} sqft`}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Requirements */}
              {shareProfitListing?.additional_requirement && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Additional Requirements
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {shareProfitListing.additional_requirement}
                  </Typography>
                </Box>
              )}

              {/**
               * Photos belong in the main column (wider space), not in Timestamps sidebar.
               */}
              {shareProfitListing?.media?.images && shareProfitListing.media.images.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Photos ({shareProfitListing.media.images.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {shareProfitListing.media.images.map((image) => (
                      <Grid item xs={12} sm={6} md={4} key={image.id}>
                        <Box
                          component="img"
                          src={image.url || image.medium_url || image.thumbnail_url || ''}
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
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }} noWrap>
                          {image.is_primary ? 'Primary' : image.filename}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} lg={4}>
          {/* Contact Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Contact Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Requestor contact details
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight="500">
                      Name: {shareProfitListing?.contact?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      Email: {shareProfitListing?.contact?.email || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      Phone: {shareProfitListing?.contact?.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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
                    Created: {formatDate(shareProfitListing?.created_at, 'display')}
                  </Typography>
                </Grid>
                {shareProfitListing?.status?.expires_at && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      color={shareProfitListing.status?.is_expired ? 'error' : 'textSecondary'}
                      fontWeight={shareProfitListing.status?.is_expired ? 600 : 400}
                    >
                      Expires: {formatDate(shareProfitListing.status.expires_at, 'display')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* User Information (if linked) */}
          {shareProfitListing?.user && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {shareProfitListing.user.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {shareProfitListing.user.user_type === 'company' ? "Company Information" : "User Information"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Requestor's user profile details
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {shareProfitListing.user.user_type === 'company' ? <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} /> : <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
                      <Typography variant="body2" fontWeight="500">
                        User Type: {shareProfitListing.user.user_type === 'individual' ? 'Individual' : 'Company'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        Member Level: {shareProfitListing.user.member_level || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  {shareProfitListing.user.user_type === 'company' && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="500">
                          Company Name: {shareProfitListing.user.company_name || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        User Name: {shareProfitListing.user.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteShareProfitListingMutation.isPending}
        error={deleteShareProfitListingMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleConfirmRestore}
        itemName={shareProfitListing?.title}
        itemType="share profit listing"
        action="restore"
        isLoading={restoreShareProfitListingMutation.isPending}
        error={restoreShareProfitListingMutation.error?.message}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmationDialog
        open={toggleStatusConfirmOpen}
        onClose={() => setToggleStatusConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        itemName={shareProfitListing?.title}
        itemType="share profit listing"
        action="custom"
        isLoading={toggleShareProfitListingStatusMutation.isPending}
        error={toggleShareProfitListingStatusMutation.error?.message}
      />

      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Share Profit Listing</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Are you sure you want to approve this share profit listing?
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {shareProfitListing?.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={approveShareProfitListingMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmApprove}
            color="success"
            variant="contained"
            disabled={approveShareProfitListingMutation.isPending}
          >
            {approveShareProfitListingMutation.isPending ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectionReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Share Profit Listing</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Rejecting: <strong>{shareProfitListing?.title}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            error={rejectionReason.trim() === ''}
            helperText={rejectionReason.trim() === '' ? 'Rejection reason is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason('');
            }}
            disabled={rejectShareProfitListingMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReject}
            color="error"
            variant="contained"
            disabled={rejectShareProfitListingMutation.isPending || rejectionReason.trim() === ''}
          >
            {rejectShareProfitListingMutation.isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={renewConfirmOpen}
        onClose={() => setRenewConfirmOpen(false)}
        onConfirm={handleConfirmRenew}
        title="Renew Share Profit Listing"
        message={
          renewalPointsEnabled
            ? `Extend expiry by ${renewalDays} days. Listing owner will be charged ${renewalPointCost} points first, then renew. Active status is not changed.`
            : `Extend expiry by ${renewalDays} days (from system config). Active status is not changed.`
        }
        itemName={shareProfitListing?.title}
        itemType="share profit listing"
        action="custom"
        actionLabel="Renew"
        actionColor="warning"
        isLoading={renewShareProfitListingMutation.isPending}
        error={renewShareProfitListingMutation.error?.message}
      />
    </Box>
  );
};

export default ShareProfitListingDetailPage;