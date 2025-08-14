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
import { useApproveProperty, useRejectProperty } from '../../services/queries/properties';

interface VerificationActionsProps {
  propertyId: number;
  propertyTitle: string;
  verificationStatus: string;
  onSuccess?: () => void;
  size?: 'small' | 'medium';
}

export const VerificationActions: React.FC<VerificationActionsProps> = ({
  propertyId,
  propertyTitle,
  verificationStatus,
  onSuccess,
  size = 'medium',
}) => {
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const approvePropertyMutation = useApproveProperty();
  const rejectPropertyMutation = useRejectProperty();

  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    approvePropertyMutation.mutate(propertyId, {
      onSuccess: () => {
        setApproveDialogOpen(false);
        onSuccess?.();
      },
    });
  };

  const handleCancelApprove = () => {
    setApproveDialogOpen(false);
  };

  const handleReject = () => {
    setRejectionDialogOpen(true);
  };

  const handleConfirmRejection = () => {
    if (!rejectionReason.trim()) return;
    
    rejectPropertyMutation.mutate(
      { id: propertyId, reason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setRejectionDialogOpen(false);
          setRejectionReason('');
          onSuccess?.();
        },
      }
    );
  };

  const handleCancelRejection = () => {
    setRejectionDialogOpen(false);
    setRejectionReason('');
  };

  // Only show buttons for pending properties
  if (verificationStatus !== 'pending') {
    return null;
  }

  const buttonSize = size === 'small' ? 'small' : 'medium';
  
  return (
    <>
      <Tooltip title="Approve Property">
        <IconButton
          size={buttonSize}
          color="success"
          onClick={handleApprove}
          disabled={approvePropertyMutation.isPending || rejectPropertyMutation.isPending}
        >
          <ApproveIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Reject Property">
        <IconButton
          size={buttonSize}
          color="error"
          onClick={handleReject}
          disabled={approvePropertyMutation.isPending || rejectPropertyMutation.isPending}
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
        <DialogTitle>Approve Property</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Are you sure you want to approve this property?
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {propertyTitle}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelApprove} disabled={approvePropertyMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmApprove}
            color="success"
            variant="contained"
            disabled={approvePropertyMutation.isPending}
          >
            {approvePropertyMutation.isPending ? 'Approving...' : 'Approve Property'}
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
        <DialogTitle>Reject Property</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Rejecting: <strong>{propertyTitle}</strong>
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
          <Button onClick={handleCancelRejection} disabled={rejectPropertyMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRejection}
            color="error"
            variant="contained"
            disabled={rejectPropertyMutation.isPending || rejectionReason.trim() === ''}
          >
            {rejectPropertyMutation.isPending ? 'Rejecting...' : 'Reject Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
