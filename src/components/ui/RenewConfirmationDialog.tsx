import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Property } from '../../types/property';

interface RenewConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  property: Property | null;
  isLoading?: boolean;
  error?: string | null;
}

const RenewConfirmationDialog: React.FC<RenewConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  property,
  isLoading = false,
  error = null,
}) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  if (!property) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RefreshIcon color="warning" />
        Renew Property
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to renew this property?
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Property Details:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Title:</strong> {property.title_en}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Current Expiry:</strong> {property.dates?.expires_at ? 
              new Date(property.dates.expires_at).toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Renewal Count:</strong> {property.renewal_info?.renewal_count || 0}
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Renewal Notes (Optional)"
          placeholder="Add any notes about this renewal..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          sx={{ mt: 1 }}
        />

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          startIcon={isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
          disabled={isLoading}
        >
          {isLoading ? 'Renewing...' : 'Renew Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenewConfirmationDialog;
