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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useApproveProperty, useRejectProperty } from '../../services/queries/properties';
import { useQueryClient } from '@tanstack/react-query';
import { propertyKeys } from '../../services/queries/properties';

interface VerificationActionsProps {
  propertyId: number;
  propertyTitle: string;
  verificationStatus: string;
  onSuccess?: () => void;
  onShowSuccess?: (message: string) => void;
  onShowError?: (message: string) => void;
  size?: 'small' | 'medium';
}

export const VerificationActions: React.FC<VerificationActionsProps> = ({
  propertyId,
  propertyTitle,
  verificationStatus,
  onSuccess,
  onShowSuccess,
  onShowError,
  size = 'medium',
}) => {
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  
  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const queryClient = useQueryClient();
  const approvePropertyMutation = useApproveProperty();
  const rejectPropertyMutation = useRejectProperty();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleApprove = () => {
    setApproveDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmApprove = async () => {
    try {
      await approvePropertyMutation.mutateAsync(propertyId);
      setApproveDialogOpen(false);
      // Invalidate and refetch properties data
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
      onShowSuccess?.(`${propertyTitle} approved successfully!`);
      onSuccess?.();
    } catch (error: any) {
      onShowError?.(error.message || 'Failed to approve property. Please try again.');
    }
  };

  const handleCancelApprove = () => {
    setApproveDialogOpen(false);
  };

  const handleReject = () => {
    setRejectionDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) return;
    
    try {
      await rejectPropertyMutation.mutateAsync({ id: propertyId, reason: rejectionReason.trim() });
      setRejectionDialogOpen(false);
      setRejectionReason('');
      // Invalidate and refetch properties data
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
      onShowSuccess?.(`${propertyTitle} rejected successfully!`);
      onSuccess?.();
    } catch (error: any) {
      onShowError?.(error.message || 'Failed to reject property. Please try again.');
    }
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
      <Tooltip title="Verification Actions">
        <IconButton
          size={buttonSize}
          onClick={handleMenuOpen}
          color="default"
          disabled={approvePropertyMutation.isPending || rejectPropertyMutation.isPending}
          sx={{ 
            bgcolor: 'grey.100', 
            '&:hover': { bgcolor: 'grey.200' } 
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      
      {/* Verification Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleApprove}>
          <ListItemIcon>
            <ApproveIcon color="success" />
          </ListItemIcon>
          <ListItemText>Approve Property</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleReject}>
          <ListItemIcon>
            <RejectIcon color="error" />
          </ListItemIcon>
          <ListItemText>Reject Property</ListItemText>
        </MenuItem>
      </Menu>

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
