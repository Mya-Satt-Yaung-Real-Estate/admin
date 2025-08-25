import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  action?: 'delete' | 'restore' | 'approve' | 'reject' | 'custom';
  actionLabel?: string;
  actionColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  error?: string | null;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemType = 'item',
  action = 'delete',
  actionLabel,
  actionColor,
  isLoading = false,
  error = null,
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
}) => {
  const [reason, setReason] = useState('');

  // Action configurations
  const actionConfigs = {
    delete: {
      icon: <DeleteIcon />,
      color: 'error' as const,
      label: 'Delete',
      loadingLabel: 'Deleting...',
      title: 'Confirm Delete',
      message: `Are you sure you want to delete the ${itemType} "${itemName}"? This action cannot be undone.`,
      warningIcon: <WarningIcon color="warning" />,
    },
    restore: {
      icon: <RestoreIcon />,
      color: 'success' as const,
      label: 'Restore',
      loadingLabel: 'Restoring...',
      title: 'Confirm Restore',
      message: `Are you sure you want to restore the ${itemType} "${itemName}"?`,
      warningIcon: <CheckCircleIcon color="success" />,
    },
    approve: {
      icon: <CheckCircleIcon />,
      color: 'success' as const,
      label: 'Approve',
      loadingLabel: 'Approving...',
      title: 'Confirm Approval',
      message: `Are you sure you want to approve the ${itemType} "${itemName}"?`,
      warningIcon: <CheckCircleIcon color="success" />,
    },
    reject: {
      icon: <WarningIcon />,
      color: 'error' as const,
      label: 'Reject',
      loadingLabel: 'Rejecting...',
      title: 'Confirm Rejection',
      message: `Are you sure you want to reject the ${itemType} "${itemName}"?`,
      warningIcon: <WarningIcon color="warning" />,
    },
    custom: {
      icon: <CheckCircleIcon />,
      color: 'primary' as const,
      label: 'Confirm',
      loadingLabel: 'Processing...',
      title: 'Confirm Action',
      message: `Are you sure you want to perform this action on "${itemName}"?`,
      warningIcon: <WarningIcon color="primary" />,
    },
  };

  const config = actionConfigs[action];
  
  // Use provided values or fall back to defaults
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const finalActionLabel = actionLabel || config.label;
  const finalActionColor = actionColor || config.color;
  const finalReasonLabel = reasonLabel || (action === 'reject' ? 'Reason for rejection' : `Reason for ${action}`);
  const finalReasonPlaceholder = reasonPlaceholder || (action === 'reject' ? 'Enter reason for rejection' : `Enter reason for ${action} (optional)`);

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason(''); // Reset reason when dialog closes
  };

  const handleClose = () => {
    setReason(''); // Reset reason when dialog closes
    onClose();
  };

  const canConfirm = !requireReason || reason.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {config.warningIcon}
          <Typography variant="h6" component="span">
            {finalTitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          {finalMessage}
        </Typography>

        {(requireReason || action === 'reject') && (
          <TextField
            fullWidth
            label={finalReasonLabel}
            placeholder={finalReasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            variant="outlined"
            disabled={isLoading}
            required={requireReason}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading || !canConfirm}
          variant="contained"
          color={finalActionColor}
          startIcon={isLoading ? undefined : config.icon}
        >
          {isLoading ? config.loadingLabel : finalActionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
