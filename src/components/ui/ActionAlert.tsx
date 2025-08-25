import React from 'react';
import { Alert, AlertProps, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface ActionAlertProps {
  success?: {
    show: boolean;
    message: string;
  };
  error?: {
    show: boolean;
    message: string;
  };
  sx?: AlertProps['sx'];
  onClose?: () => void;
}

const ActionAlert: React.FC<ActionAlertProps> = ({ success, error, sx = { mb: 2 }, onClose }) => {
  if (success?.show) {
    return (
      <Alert 
        severity="success" 
        sx={sx}
        action={
          onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : undefined
        }
      >
        {success.message}
      </Alert>
    );
  }

  if (error?.show) {
    return (
      <Alert 
        severity="error" 
        sx={sx}
        action={
          onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : undefined
        }
      >
        {error.message}
      </Alert>
    );
  }

  return null;
};

export default ActionAlert;
