import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useApproveAdvertisement, useRejectAdvertisement } from '../../services/queries/advertisements';
import { useQueryClient } from '@tanstack/react-query';
import { advertisementKeys } from '../../services/queries/advertisements';

interface AdvertisementVerificationActionsProps {
  advertisementId: number;
  advertisementTitle: string;
  verificationStatus: string;
  onSuccess?: () => void;
  onShowSuccess?: (message: string) => void;
  onShowError?: (message: string) => void;
  size?: 'small' | 'medium';
}

export const AdvertisementVerificationActions: React.FC<AdvertisementVerificationActionsProps> = ({
  advertisementId,
  advertisementTitle,
  verificationStatus,
  onSuccess,
  onShowSuccess,
  onShowError,
  size = 'medium',
}) => {
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const approveAdvertisementMutation = useApproveAdvertisement();
  const rejectAdvertisementMutation = useRejectAdvertisement();

  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    try {
      await approveAdvertisementMutation.mutateAsync(advertisementId);
      setApproveDialogOpen(false);
      // Invalidate and refetch advertisements data
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: advertisementKeys.detail(advertisementId) });
      onShowSuccess?.(`${advertisementTitle} approved successfully!`);
      onSuccess?.();
    } catch (error: any) {
      onShowError?.(error.message || 'Failed to approve advertisement. Please try again.');
    }
  };

  const handleCancelApprove = () => {
    setApproveDialogOpen(false);
  };

  const handleReject = () => {
    setRejectionDialogOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      onShowError?.('Please provide a reason for rejection.');
      return;
    }

    try {
      await rejectAdvertisementMutation.mutateAsync({ 
        id: advertisementId, 
        reason: rejectionReason.trim() 
      });
      setRejectionDialogOpen(false);
      setRejectionReason('');
      // Invalidate and refetch advertisements data
      queryClient.invalidateQueries({ queryKey: advertisementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: advertisementKeys.detail(advertisementId) });
      onShowSuccess?.(`${advertisementTitle} rejected successfully!`);
      onSuccess?.();
    } catch (error: any) {
      onShowError?.(error.message || 'Failed to reject advertisement. Please try again.');
    }
  };

  const handleCancelRejection = () => {
    setRejectionDialogOpen(false);
    setRejectionReason('');
  };

  const buttonSize = size === 'small' ? 'small' : 'medium';
  
  return (
    <>
      <Tooltip title="Approve Advertisement">
        <IconButton
          size={buttonSize}
          color="success"
          onClick={handleApprove}
          disabled={approveAdvertisementMutation.isPending || rejectAdvertisementMutation.isPending}
        >
          <ApproveIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Reject Advertisement">
        <IconButton
          size={buttonSize}
          color="error"
          onClick={handleReject}
          disabled={approveAdvertisementMutation.isPending || rejectAdvertisementMutation.isPending}
        >
          <RejectIcon />
        </IconButton>
      </Tooltip>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleCancelApprove}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Advertisement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Are you sure you want to approve this advertisement?
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {advertisementTitle}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelApprove} disabled={approveAdvertisementMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmApprove}
            color="success"
            variant="contained"
            disabled={approveAdvertisementMutation.isPending}
          >
            {approveAdvertisementMutation.isPending ? 'Approving...' : 'Approve Advertisement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={handleCancelRejection}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Advertisement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this advertisement:
          </Typography>
          <Typography variant="body1" fontWeight="500" sx={{ mb: 2 }}>
            {advertisementTitle}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRejection} disabled={rejectAdvertisementMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRejection}
            color="error"
            variant="contained"
            disabled={rejectAdvertisementMutation.isPending || !rejectionReason.trim()}
          >
            {rejectAdvertisementMutation.isPending ? 'Rejecting...' : 'Reject Advertisement'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
