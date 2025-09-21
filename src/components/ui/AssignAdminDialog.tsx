import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AssignmentInd as AssignIcon,
} from '@mui/icons-material';
import { AdminUser } from '../../types/booking';

interface AssignAdminDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (adminId: number) => void;
  isLoading?: boolean;
  error?: string | null;
  adminUsers: AdminUser[];
  loadingAdminUsers?: boolean;
  currentAssignedAdmin?: AdminUser | null;
}

const AssignAdminDialog: React.FC<AssignAdminDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
  adminUsers = [],
  loadingAdminUsers = false,
  currentAssignedAdmin = null,
}) => {
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedAdminId(currentAssignedAdmin?.id || null);
    }
  }, [open, currentAssignedAdmin]);

  const handleConfirm = () => {
    if (selectedAdminId) {
      onConfirm(selectedAdminId);
    }
  };

  const handleClose = () => {
    setSelectedAdminId(null);
    onClose();
  };

  const handleAdminSelect = (adminId: number) => {
    setSelectedAdminId(adminId);
  };

  const canConfirm = selectedAdminId && !isLoading;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignIcon color="primary" />
          <Typography variant="h6" component="span">
            Assign Admin
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingAdminUsers && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              Loading admin users...
            </Typography>
          </Box>
        )}

        {currentAssignedAdmin && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Currently Assigned:
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'info.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'info.200' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="info" />
                <Typography variant="body1" fontWeight="500">
                  {currentAssignedAdmin.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  {currentAssignedAdmin.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Autocomplete
          size="small"
          options={adminUsers}
          getOptionLabel={(option) => `${option.name} (${option.email})`}
          value={adminUsers.find(admin => admin.id === selectedAdminId) || null}
          onChange={(_, newValue) => {
            handleAdminSelect(newValue?.id || 0);
          }}
          loading={loadingAdminUsers}
          disabled={loadingAdminUsers || adminUsers.length === 0}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Admin to Assign"
              error={!selectedAdminId && adminUsers.length > 0}
              helperText={
                adminUsers.length === 0 && !loadingAdminUsers 
                  ? "No admin users available for assignment."
                  : loadingAdminUsers 
                  ? "Loading admin users..."
                  : ""
              }
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <PersonIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="body1" fontWeight="500">
                    {option.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {option.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm}
          variant="contained"
          color="primary"
          startIcon={isLoading ? undefined : <AssignIcon />}
        >
          {isLoading ? 'Assigning...' : 'Assign Admin'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignAdminDialog;
