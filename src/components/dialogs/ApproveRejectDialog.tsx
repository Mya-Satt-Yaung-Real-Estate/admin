import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
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

interface ApproveRejectDialogProps {
  dialog: ApproveRejectDialogState;
  onClose: () => void;
  onConfirm: () => void;
  onInputChange: (field: 'notes' | 'reason' | 'payment_method' | 'payment_reference', value: string) => void;
  isLoading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ApproveRejectDialog: React.FC<ApproveRejectDialogProps> = ({
  dialog,
  onClose,
  onConfirm,
  onInputChange,
  isLoading = false,
}) => {
  return (
    <Dialog 
      open={dialog.open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {dialog.type === 'approve' ? 'Approve Request' : 'Reject Request'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Request Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">Request ID</Typography>
              <Typography variant="body2" fontWeight={500}>#{dialog.request?.id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">User</Typography>
              <Typography variant="body2" fontWeight={500}>{dialog.request?.user?.name || 'Unknown User'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Package</Typography>
              <Typography variant="body2" fontWeight={500}>{dialog.request?.package?.name_en || 'Unknown Package'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Points</Typography>
              <Typography variant="body2" fontWeight={500}>{(dialog.request?.points_requested || 0).toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Price</Typography>
              <Typography variant="body2" fontWeight={500}>{dialog.request?.formatted_price || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Payment Method</Typography>
              <Typography variant="body2" fontWeight={500}>{dialog.request?.formatted_payment_method || '-'}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">Request Date</Typography>
            <Typography variant="body2" fontWeight={500}>
              {dialog.request?.requested_at ? formatDate(dialog.request.requested_at, 'display') : 'N/A'}
            </Typography>
          </Box>
        </Box>

        {dialog.type === 'approve' && (
          <>
            <TextField
              select
              label="Payment Method"
              fullWidth
              margin="normal"
              value={dialog.payment_method}
              onChange={(e) => onInputChange('payment_method', e.target.value)}
              error={!!dialog.errors.payment_method}
              helperText={dialog.errors.payment_method}
            >
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="mobile_money">Mobile Money</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            
            <TextField
              label="Payment Reference (Optional)"
              fullWidth
              margin="normal"
              value={dialog.payment_reference}
              onChange={(e) => onInputChange('payment_reference', e.target.value)}
              error={!!dialog.errors.payment_reference}
              helperText={dialog.errors.payment_reference}
              placeholder="Enter payment reference number (optional)..."
            />
            
            <TextField
              label="Admin Notes"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={dialog.notes}
              onChange={(e) => onInputChange('notes', e.target.value)}
              error={!!dialog.errors.notes}
              helperText={dialog.errors.notes}
              placeholder="Add notes about the approval (required)..."
              required
            />
          </>
        )}
        {dialog.type === 'reject' && (
          <TextField
            label="Rejection Reason"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={dialog.reason}
            onChange={(e) => onInputChange('reason', e.target.value)}
            error={!!dialog.errors.reason}
            helperText={dialog.errors.reason}
            placeholder="Please provide a reason for rejection..."
            required
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="primary"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color={dialog.type === 'approve' ? 'success' : 'error'} 
          variant="contained"
          disabled={isLoading}
        >
          {isLoading 
            ? 'Processing...' 
            : dialog.type === 'approve' ? 'Approve' : 'Reject'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApproveRejectDialog;
