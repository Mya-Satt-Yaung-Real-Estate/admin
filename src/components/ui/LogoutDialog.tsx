import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/useAuthStore';
import { getUserInitials } from '@/utils';

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const { user } = useAuthStore();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="logout-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'warning.main',
              width: 40,
              height: 40,
            }}
          >
            <WarningIcon />
          </Avatar>
          <Typography variant="h6" component="div">
            Confirm Logout
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <DialogContentText id="logout-dialog-description">
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Are you sure you want to log out?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will be signed out of your account and redirected to the login page.
            </Typography>
          </Box>
          
          {/* User Info */}
          {user && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 48,
                  height: 48,
                  fontSize: '1rem',
                }}
              >
                {getUserInitials(user.name)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color="warning"
          startIcon={isLoading ? undefined : <LogoutIcon />}
          sx={{ minWidth: 100 }}
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
