import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as OrderIcon,
  Person as PersonIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AttachMoney as PriceIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { usePointPurchaseRequest, useApproveRejectPointPurchaseRequest } from '../../services/queries/points';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, StatusChip, ActionAlert } from '../../components/ui';
import ApproveRejectDialog from '../../components/dialogs/ApproveRejectDialog';
import { useAlertSystem } from '../../hooks';
import { formatDate } from '../../constants/dateFormats';
import { PointPurchaseRequest } from '../../types/point';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ApproveRejectDialogState {
  open: boolean;
  type: 'approve' | 'reject';
  request: PointPurchaseRequest | null;
  notes: string;
  reason: string;
  payment_method: string;
  payment_reference: string;
  errors: {
    notes?: string;
    reason?: string;
    payment_method?: string;
    payment_reference?: string;
  };
}

const PointPurchaseRequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // State for approve/reject dialog
  const [approveRejectDialog, setApproveRejectDialog] = useState<ApproveRejectDialogState>({
    open: false,
    type: 'approve',
    request: null,
    notes: '',
    reason: '',
    payment_method: '',
    payment_reference: '',
    errors: {},
  });

  // Hooks
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Queries
  const { data: requestData, isLoading, error, refetch } = usePointPurchaseRequest(parseInt(id || '0'));
  const approveRejectMutation = useApproveRejectPointPurchaseRequest();

  // Event handlers
  const handleEdit = () => {
    navigate(`/points/purchase-requests/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/points/purchase-requests');
  };

  const handleApprove = () => {
    if (!requestData?.data) return;
    
    setApproveRejectDialog({
      open: true,
      type: 'approve',
      request: requestData.data,
      notes: '',
      reason: '',
      payment_method: requestData.data.payment_method,
      payment_reference: requestData.data.payment_reference,
      errors: {},
    });
  };

  const handleReject = () => {
    if (!requestData?.data) return;
    
    setApproveRejectDialog({
      open: true,
      type: 'reject',
      request: requestData.data,
      notes: '',
      reason: '',
      payment_method: requestData.data.payment_method,
      payment_reference: requestData.data.payment_reference,
      errors: {},
    });
  };

  // Validation function
  const validateDialogForm = (): boolean => {
    const errors: { notes?: string; reason?: string; payment_method?: string; payment_reference?: string } = {};

    if (approveRejectDialog.type === 'reject' && !approveRejectDialog.reason.trim()) {
      errors.reason = 'Rejection reason is required';
    }

    if (approveRejectDialog.type === 'approve') {
      if (!approveRejectDialog.payment_method) {
        errors.payment_method = 'Payment method is required';
      }
      if (!approveRejectDialog.notes.trim()) {
        errors.notes = 'Admin notes are required';
      }
      // Payment reference is optional, so no validation needed
    }

    setApproveRejectDialog(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleApproveRejectConfirm = async () => {
    if (!approveRejectDialog.request) return;

    // Validate form
    if (!validateDialogForm()) {
      return;
    }

    try {
      const { type, request, notes, reason, payment_method, payment_reference } = approveRejectDialog;
      
      const response = await approveRejectMutation.mutateAsync({ 
        id: request.id, 
        data: { 
          action: type, 
          notes: notes.trim() || undefined,
          rejection_reason: type === 'reject' ? reason.trim() : undefined,
          payment_method: type === 'approve' ? (payment_method as 'bank_transfer' | 'cash' | 'mobile_money' | 'other' | undefined) : undefined,
          payment_reference: type === 'approve' ? (payment_reference?.trim() || undefined) : undefined,
        }
      });
      
      showSuccess(response.message || `Request ${type === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setApproveRejectDialog({ 
        open: false, 
        type: 'approve', 
        request: null, 
        notes: '', 
        reason: '', 
        payment_method: '',
        payment_reference: '',
        errors: {} 
      });
      refetch(); // Refresh the data
    } catch (error: any) {
      showError(error?.message || `Failed to ${approveRejectDialog.type} request`);
    }
  };

  const handleApproveRejectClose = () => {
    setApproveRejectDialog({ 
      open: false, 
      type: 'approve', 
      request: null, 
      notes: '', 
      reason: '', 
      payment_method: '',
      payment_reference: '',
      errors: {} 
    });
  };

  const handleDialogInputChange = (field: 'notes' | 'reason' | 'payment_method' | 'payment_reference', value: string) => {
    setApproveRejectDialog(prev => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined // Clear error when user starts typing
      }
    }));
  };

  // Loading and error states
  if (isLoading) {
    return <PageLoadingState title="Loading Point Purchase Request" />;
  }

  if (error || !requestData?.data) {
    return (
      <Box>
        <PageHeader
          title="Point Purchase Request Details"
          subtitle="View point purchase request information"
        />
        <ActionAlert 
          error={{
            show: true,
            message: error?.message || 'Failed to load point purchase request. Please try again.'
          }}
          sx={{ mt: 2 }} 
          onClose={clearAlert} 
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to List
          </Button>
        </Box>
      </Box>
    );
  }

  const request = requestData.data;

  return (
    <Box>
      <PageHeader
        title="Point Purchase Request Details"
        subtitle="View point purchase request information"
        actionButton={{
          text: 'Edit',
          icon: <EditIcon />,
          onClick: handleEdit,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {request.can_approve && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={handleApprove}
            >
              Approve Request
            </Button>
          )}

          {request.can_reject && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
              onClick={handleReject}
            >
              Reject Request
            </Button>
          )}
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to List
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Information Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <OrderIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                Request Information
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Request ID and Status */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Request ID
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  #{request.id}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <StatusChip 
                  status={request.status}
                  statusType="verification_status"
                  size="medium"
                />
              </Grid>

              {/* Package Information */}
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Package
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon sx={{ fontSize: 20, color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    {request.package.name_en}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {request.package.name_mm}
                </Typography>
              </Grid>

              {/* Points and Price */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Points Requested
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    {request.points_requested?.toLocaleString() || 0} points
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Price
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PriceIcon sx={{ fontSize: 20, color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    {request.formatted_price}
                  </Typography>
                </Box>
              </Grid>

              {/* Payment Information - Only show if not pending */}
              {request.status !== 'pending' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Payment Method
                    </Typography>
                    <Chip
                      label={request.formatted_payment_method}
                      color="info"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  {request.payment_reference && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Payment Reference
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {request.payment_reference}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Dates */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Requested At
                </Typography>
                <Typography variant="body1">
                  {formatDate(request.requested_at, 'display')}
                </Typography>
              </Grid>

              {request.approved_at && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Approved At
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(request.approved_at, 'display')}
                  </Typography>
                </Grid>
              )}

              {/* Admin Notes */}
              {request.admin_notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Admin Notes
                  </Typography>
                  <Typography variant="body1">
                    {request.admin_notes}
                  </Typography>
                </Grid>
              )}

              {/* Rejection Reason */}
              {request.rejected_reason && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Rejection Reason
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    {request.rejected_reason}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* User Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      User Information
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {request.user.name}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {request.user.email}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    User Type
                  </Typography>
                  <Chip
                    label={request.user.user_type}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Current Point Balance
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary.main">
                    {request.user.current_point_balance?.toLocaleString() || 0} points
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Approved/Rejected By Information */}
            {request.approved_by && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {request.status === 'rejected' ? 'Rejected By' : 'Approved By'}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {request.approved_by.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Approve/Reject Dialog */}
      <ApproveRejectDialog
        dialog={approveRejectDialog}
        onClose={handleApproveRejectClose}
        onConfirm={handleApproveRejectConfirm}
        onInputChange={handleDialogInputChange}
        isLoading={approveRejectMutation.isPending}
      />
    </Box>
  );
};

export default PointPurchaseRequestDetailPage;
