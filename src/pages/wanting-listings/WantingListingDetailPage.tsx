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
import { useWantingList, useDeleteWantingList, useRestoreWantingList, useToggleWantingListStatus } from '../../services/queries/wantingListings';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, PageLoadingState, PageErrorState, DeleteConfirmationDialog, ActionAlert, ConfirmationDialog } from '../../components/ui';
import { formatDate } from '../../constants/dateFormats';

const WantingListingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  // API Queries
  const { data: wantingListResponse, isLoading, isFetching, error, refetch } = useWantingList(slug!);
  const deleteWantingListMutation = useDeleteWantingList();
  const restoreWantingListMutation = useRestoreWantingList();
  const toggleWantingListStatusMutation = useToggleWantingListStatus();

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

  // Toggle status confirmation state
  const [toggleStatusConfirmOpen, setToggleStatusConfirmOpen] = useState(false);

  // Extract wanting list data
  const wantingList = wantingListResponse?.data;

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
  const handleBack = () => navigate('/wanting-listings');
  const handleEdit = () => navigate(`/wanting-listings/${slug}/edit`);
  const handleDelete = () => {
    if (!wantingList) return;

    openDeleteConfirmation(
      wantingList.title,
      'wanting list',
      async () => {
        try {
          await deleteWantingListMutation.mutateAsync(wantingList.slug);
          showSuccess(`${wantingList.title} deleted successfully!`, true);
          navigate('/wanting-listings');
        } catch (error: any) {
          showError(error.message || 'Failed to delete wanting list. Please try again.', true);
        }
      }
    );
  };

  const handleRestore = () => {
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!wantingList) return;

    try {
      await restoreWantingListMutation.mutateAsync(wantingList.slug);
      showSuccess(`${wantingList.title} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      // Redirect to the list page after successful restoration
      navigate('/wanting-listings');
    } catch (error: any) {
      showError(error.message || 'Failed to restore wanting list. Please try again.', true);
    }
  };

  const handleToggleStatus = () => {
    if (!wantingList) return;

    setToggleStatusConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!wantingList) return;

    try {
      const response = await toggleWantingListStatusMutation.mutateAsync(wantingList.slug);
      const newStatus = response.data.is_active ? 'enabled' : 'disabled';
      showSuccess(`${wantingList.title} ${newStatus} successfully!`, true);
      setToggleStatusConfirmOpen(false);
      // Refresh the specific wanting list data to update the UI
      refetch();
    } catch (error: any) {
      showError(error.message || 'Failed to toggle status. Please try again.', true);
    }
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Wanting List Details" />;
  }

  // Show loading state during refetch to ensure fresh data is displayed
  if (isFetching && !wantingListResponse?.data) {
    return <PageLoadingState title="Refreshing Wanting List Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Wanting List"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!wantingList) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Wanting List Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The wanting list you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Wanting Listings
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={wantingList.title}
        subtitle={typeof wantingList.description === 'string' && wantingList.description.length > 0 ? wantingList.description.substring(0, 50) + '...' : 'N/A'}
        breadcrumbs="Dashboard / Wanting List Management / Wanting List Details"
        actionButton={{
          text: 'Back to Wanting Listings',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/wanting-listings')
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
          if (wantingList.deleted_at === null ||
              wantingList.deleted_at === undefined ||
              wantingList.deleted_at === '') {
            isDeleted = false;
          } else {
            // If it's a string, check if it's not empty
            // If it's an object, consider it as deleted if it exists
            isDeleted = (typeof wantingList.deleted_at === 'string' && wantingList.deleted_at.trim() !== '') ||
                        (typeof wantingList.deleted_at === 'object' && wantingList.deleted_at !== null);
          }

          return isDeleted ? (
            // For deleted records, show restore button
            <Tooltip title="Restore Wanting List">
              <IconButton
                color="success"
                onClick={handleRestore}
                disabled={restoreWantingListMutation.isPending}
              >
                <RestoreIcon />
              </IconButton>
            </Tooltip>
          ) : (
            // For active records, show status, edit, and delete buttons
            <>
              <Tooltip title={wantingList.is_active ? "Disable Wanting List" : "Enable Wanting List"}>
                <IconButton
                  color={wantingList.is_active ? "error" : "success"}
                  onClick={handleToggleStatus}
                  disabled={toggleWantingListStatusMutation.isPending}
                >
                  {wantingList.is_active ? <CancelIcon /> : <CheckCircleIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Edit Wanting List">
                <IconButton
                  color="primary"
                  onClick={handleEdit}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Wanting List">
                <IconButton
                  color="error"
                  onClick={handleDelete}
                  disabled={deleteWantingListMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          );
        })()}
      </Box>

      <Grid container spacing={3}>
        {/* Main Wanting List Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {wantingList?.title || 'N/A'}
                  </Typography>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {wantingList?.description || 'N/A'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <StatusChip status={wantingList?.status?.status || 'unknown'} />
                    <StatusChip status={wantingList?.wanted_type || 'unknown'} />
                    <StatusChip status={wantingList?.is_active ? 'active' : 'inactive'} />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Wanting List Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Wanting List Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Type: {wantingList?.wanted_type === 'buyer' ? 'Buyer' : wantingList?.wanted_type === 'renter' ? 'Renter' : wantingList?.wanted_type || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <HomeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Property Type: {wantingList?.property_type?.name_en || 'N/A'} ({wantingList?.property_type?.name_mm || ''})
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        {wantingList?.preferred_location?.region ? "Preferred Region: " + (wantingList.preferred_location.region.name_en || 'N/A') + " (" + (wantingList.preferred_location.region.name_mm || '') + ")" : "Preferred Region: " + (wantingList?.location?.region_en || 'N/A') + " (" + (wantingList?.location?.region_mm || '') + ")"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        {wantingList?.preferred_location?.township ? "Preferred Township: " + (wantingList.preferred_location.township.name_en || 'N/A') + " (" + (wantingList.preferred_location.township.name_mm || '') + ")" : "Preferred Township: " + (wantingList?.location?.township_en || 'N/A') + " (" + (wantingList?.location?.township_mm || '') + ")"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PriceIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Budget Range: {wantingList?.budget?.min_budget || 'N/A'} - {wantingList?.budget?.max_budget || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Bedrooms: {wantingList?.specifications?.bedrooms || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BathIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Bathrooms: {wantingList?.specifications?.bathrooms || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AreaIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        {wantingList?.specifications?.min_area !== undefined && wantingList?.specifications?.max_area !== undefined && wantingList.specifications.min_area !== null && wantingList.specifications.max_area !== null
                          ? `Area: ${wantingList.specifications.min_area} - ${wantingList.specifications.max_area} sqft`
                          : `Area: ${wantingList?.specifications?.area_range || 'N/A'} sqft`}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Requirements */}
              {wantingList?.additional_requirement && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Additional Requirements
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {wantingList.additional_requirement}
                  </Typography>
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
                      Name: {wantingList?.contact?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      Email: {wantingList?.contact?.email || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      Phone: {wantingList?.contact?.phone || 'N/A'}
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
                    Created: {formatDate(wantingList?.created_at, 'display')}
                  </Typography>
                </Grid>
                {wantingList?.status?.expires_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Expires: {formatDate(wantingList.status.expires_at, 'display')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* User Information (if linked) */}
          {wantingList?.user && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {wantingList.user.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {wantingList.user.user_type === 'company' ? "Company Information" : "User Information"}
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
                      {wantingList.user.user_type === 'company' ? <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} /> : <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
                      <Typography variant="body2" fontWeight="500">
                        User Type: {wantingList.user.user_type === 'individual' ? 'Individual' : 'Company'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        Member Level: {wantingList.user.member_level || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        User Name: {wantingList.user.name || 'N/A'}
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
        isLoading={deleteWantingListMutation.isPending}
        error={deleteWantingListMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleConfirmRestore}
        itemName={wantingList?.title}
        itemType="wanting listing"
        action="restore"
        isLoading={restoreWantingListMutation.isPending}
        error={restoreWantingListMutation.error?.message}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmationDialog
        open={toggleStatusConfirmOpen}
        onClose={() => setToggleStatusConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        itemName={wantingList?.title}
        itemType="wanting listing"
        action="custom"
        isLoading={toggleWantingListStatusMutation.isPending}
        error={toggleWantingListStatusMutation.error?.message}
      />
    </Box>
  );
};

export default WantingListingDetailPage;