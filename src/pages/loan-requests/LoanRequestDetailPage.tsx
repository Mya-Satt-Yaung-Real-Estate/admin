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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  RequestQuote as RequestQuoteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  RestoreFromTrash as RestoreIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Note as NoteIcon,
  Verified as VerifiedIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useLoanRequest, useUpdateLoanRequest, useDeleteLoanRequest, useRestoreLoanRequest } from '../../services/queries/loan-requests';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { StatusChip, PageLoadingState, PageErrorState, ActionAlert } from '../../components/ui';
import ActionConfirmationDialog from '../../components/ui/ActionConfirmationDialog';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../constants/dateFormats';

const LoanRequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // API Queries
  const { data: loanRequestResponse, isLoading, isFetching, error } = useLoanRequest(slug || '');
  const updateMutation = useUpdateLoanRequest();
  const deleteMutation = useDeleteLoanRequest();
  const restoreMutation = useRestoreLoanRequest();

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

  // Extract loan request data
  const loanRequest = loanRequestResponse?.data;

  // Event handlers
  const handleBack = () => navigate('/loan-requests');
  
  const handleDelete = () => {
    if (!loanRequest) return;
    
    openDeleteConfirmation(
      `Loan Request #${loanRequest.id}`,
      'loan request',
      async () => {
        try {
          await deleteMutation.mutateAsync(loanRequest.slug);
          showSuccess(`Loan Request #${loanRequest.id} deleted successfully!`, true);
          // Navigate back to the list after deletion
          navigate('/loan-requests');
        } catch (error: any) {
          showError(error.message || 'Failed to delete loan request. Please try again.', true);
        }
      },
      'delete'
    );
  };

  const handleRestore = () => {
    if (!loanRequest) return;
    
    openDeleteConfirmation(
      `Loan Request #${loanRequest.id}`,
      'loan request',
      async () => {
        try {
          await restoreMutation.mutateAsync(loanRequest.slug);
          showSuccess(`Loan Request #${loanRequest.id} restored successfully!`, true);
          // Instead of reloading the page, we can refetch the data
          // The mutation's onSuccess will handle cache invalidation
        } catch (error: any) {
          showError(error.message || 'Failed to restore loan request. Please try again.', true);
        }
      },
      'restore'
    );
  };

  const handleUpdateStatus = () => {
    if (status && slug) {
      updateMutation.mutate({
        slug,
        data: {
          status: status as any,
          admin_note: adminNote,
        },
      }, {
        onSuccess: () => {
          showSuccess('Loan request status updated successfully!', true);
        },
        onError: (error: any) => {
          showError(error.message || 'Failed to update loan request status. Please try again.', true);
        }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Loan Request Details" />;
  }

  // Show loading state during refetch to ensure fresh data is displayed
  if (isFetching && !loanRequestResponse?.data) {
    return <PageLoadingState title="Refreshing Loan Request Details" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Loan Request"
        message={(error as any).message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not found state
  if (!loanRequest) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Loan Request Not Found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The loan request you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Loan Requests
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Loan Request #${loanRequest.id}`}
        subtitle={loanRequest.full_name}
        breadcrumbs="Dashboard / Loan Requests / Loan Request Details"
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
          Back to Loan Requests
        </Button>
        
        {loanRequest?.deleted_at ? (
          <Tooltip title="Restore Loan Request">
            <IconButton
              color="success"
              onClick={handleRestore}
              disabled={restoreMutation.isPending}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Delete Loan Request">
            <IconButton
              color="error"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Loan Request Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {/* Loan Request #{loanRequest.id} */}
                    Loan Request
                  </Typography>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {loanRequest.full_name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <StatusChip status={loanRequest.status} />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Applicant Information */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Applicant Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Personal details of the loan applicant
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Full Name: {loanRequest.full_name}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Email: {loanRequest.email}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Phone: {loanRequest.phone}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        NRC Number: {loanRequest.nrc_number}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Date of Birth: {loanRequest.date_of_birth}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Current Address: {loanRequest.current_address}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Employment Information */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <WorkIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Employment Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Professional details of the applicant
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WorkIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Occupation: {loanRequest.occupation}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Employer: {loanRequest.employer}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachMoneyIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Monthly Income: {formatCurrency(parseFloat(loanRequest.monthly_income))}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WorkIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Work Experience: {loanRequest.work_experience} years
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Loan Details */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <RequestQuoteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Loan Details
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Financial information for the loan request
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachMoneyIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Requested Amount: {formatCurrency(parseFloat(loanRequest.requested_amount))}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <NoteIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Loan Purpose: {loanRequest.loan_purpose}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <HomeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Property Value: {formatCurrency(parseFloat(loanRequest.property_value))}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachMoneyIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Down Payment: {formatCurrency(parseFloat(loanRequest.down_payment))}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Property Location: {loanRequest.property_location}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <HomeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        Property Type: {loanRequest.property_type?.name_en || 'N/A'} ({loanRequest.property_type?.name_mm || ''})
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Additional Information */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <NoteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Additional Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Additional notes and consent information
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <NoteIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          Additional Notes:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {loanRequest.additional_notes || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {loanRequest.agree_terms ? (
                        <VerifiedIcon sx={{ fontSize: 20, color: 'success.main' }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 20, color: 'error.main' }} />
                      )}
                      <Typography variant="body2" fontWeight="500">
                        Agree to Terms: {loanRequest.agree_terms ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {loanRequest.consent_personal_data ? (
                        <VerifiedIcon sx={{ fontSize: 20, color: 'success.main' }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 20, color: 'error.main' }} />
                      )}
                      <Typography variant="body2" fontWeight="500">
                        Consent to Personal Data: {loanRequest.consent_personal_data ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {loanRequest.authorize_credit_check ? (
                        <VerifiedIcon sx={{ fontSize: 20, color: 'success.main' }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 20, color: 'error.main' }} />
                      )}
                      <Typography variant="body2" fontWeight="500">
                        Authorize Credit Check: {loanRequest.authorize_credit_check ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} lg={4}>
          {/* User Information Card */}
          {loanRequest.user && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {loanRequest.user?.name ? <BusinessIcon /> : <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      User Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Details about the user who submitted this loan request
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        User Name: {loanRequest.user?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="500">
                        User Email: {loanRequest.user?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Status Update Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <RestoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Update Status
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Change the status of this loan request
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Admin Note (Optional)"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                startIcon={<RestoreIcon />}
                onClick={handleUpdateStatus}
                disabled={!status || !slug || updateMutation.isPending || !!loanRequest?.deleted_at}
                fullWidth
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>

          {/* Timestamps Card */}
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
                    Created: {formatDate(loanRequest.created_at, 'display')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Updated: {formatDate(loanRequest.updated_at, 'display')}
                  </Typography>
                </Grid>
                {loanRequest.deleted_at && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Deleted: {formatDate(loanRequest.deleted_at, 'display')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Confirmation Dialog */}
      <ActionConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        actionType={deleteState.actionType || 'delete'}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteMutation.isPending || restoreMutation.isPending}
        error={deleteMutation.error?.message || restoreMutation.error?.message}
      />
    </Box>
  );
};

export default LoanRequestDetailPage;