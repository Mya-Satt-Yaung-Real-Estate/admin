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
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
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

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
  itemName,
  itemType = 'item',
  isLoading = false,
  error = null,
  requireReason = false,
  reasonLabel = 'Reason for deletion',
  reasonPlaceholder = 'Enter reason for deletion (optional)',
}) => {
  const [reason, setReason] = useState('');

  const defaultMessage = itemName 
    ? `Are you sure you want to delete the ${itemType} "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  const finalMessage = message || defaultMessage;

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
          <WarningIcon color="warning" />
          <Typography variant="h6" component="span">
            {title}
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
          label={reasonLabel}
          placeholder={reasonPlaceholder}
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
          color="error"
          startIcon={isLoading ? undefined : <DeleteIcon />}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
