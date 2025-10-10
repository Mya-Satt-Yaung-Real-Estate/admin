import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ShareURLModalProps {
  open: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertySlug: string;
  baseUrl?: string;
}

export const ShareURLModal: React.FC<ShareURLModalProps> = ({
  open,
  onClose,
  propertyTitle,
  propertySlug,
  baseUrl = 'https://jadeproperty.site/property',
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  
  const shareUrl = `${baseUrl}/${propertySlug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
    }
  };

  const handleClose = () => {
    setCopySuccess(false);
    onClose();
  };

  return (
    <>
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShareIcon color="primary" />
              <Typography variant="h6" component="div">
                Share Property
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Share this property with others by copying the URL below:
          </Typography>

          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
            {propertyTitle}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              value={shareUrl}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
                sx: {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'grey.50',
                },
              }}
            />
            <Tooltip title="Copy URL">
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyUrl}
                size="small"
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                Copy
              </Button>
            </Tooltip>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This URL will only work for published and approved properties. 
              Make sure the property is visible to the public before sharing.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          URL copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};
