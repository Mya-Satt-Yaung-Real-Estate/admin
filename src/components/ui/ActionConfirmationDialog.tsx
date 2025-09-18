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
  Restore as RestoreIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface ActionConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  actionType: 'delete' | 'restore';
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
  error?: string | null;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

const ActionConfirmationDialog: React.FC<ActionConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  actionType,
  title,
  message,
  itemName,
  itemType = 'item',
  isLoading = false,
  error = null,
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
}) => {
  const [reason, setReason] = useState('');

  // Default values based on action type
  const defaultTitle = actionType === 'delete' ? 'Confirm Delete' : 'Confirm Restore';
  const defaultReasonLabel = actionType === 'delete' ? 'Reason for deletion' : 'Reason for restoration';
  const defaultReasonPlaceholder = actionType === 'delete' 
    ? 'Enter reason for deletion (optional)' 
    : 'Enter reason for restoration (optional)';
  const defaultMessage = itemName 
    ? actionType === 'delete'
      ? `Are you sure you want to delete the ${itemType} "${itemName}"? This action cannot be undone.`
      : `Are you sure you want to restore the ${itemType} "${itemName}"?`
    : actionType === 'delete'
      ? `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
      : `Are you sure you want to restore this ${itemType}?`;

  const finalTitle = title || defaultTitle;
  const finalMessage = message || defaultMessage;
  const finalReasonLabel = reasonLabel || defaultReasonLabel;
  const finalReasonPlaceholder = reasonPlaceholder || defaultReasonPlaceholder;

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason(''); // Reset reason when dialog closes
  };

  const handleClose = () => {
    setReason(''); // Reset reason when dialog closes
    onClose();
  };

  const canConfirm = !requireReason || reason.trim().length > 0;

  // Button configuration based on action type
  const buttonVariant = actionType === 'delete' ? 'error' : 'success';
  const buttonIcon = actionType === 'delete' ? <DeleteIcon /> : <RestoreIcon />;
  const buttonText = isLoading 
    ? (actionType === 'delete' ? 'Deleting...' : 'Restoring...') 
    : (actionType === 'delete' ? 'Delete' : 'Restore');

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
          <WarningIcon color={actionType === 'delete' ? 'warning' : 'info'} />
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
        />
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
          color={buttonVariant}
          startIcon={isLoading ? undefined : buttonIcon}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionConfirmationDialog;