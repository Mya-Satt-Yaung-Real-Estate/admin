import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { FormErrors, UseFormReturnType } from '../../types';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  form: UseFormReturnType;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  onBack?: () => void;
  submitText?: string;
  cancelText?: string;
  backText?: string;
  isLoading?: boolean;
  errors?: FormErrors;
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  showBackButton?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const FormContainer: React.FC<FormContainerProps> = ({
  title,
  subtitle,
  children,
  form,
  onSubmit,
  onCancel,
  onBack,
  submitText = 'Save',
  cancelText = 'Cancel',
  backText = 'Back',
  isLoading = false,
  errors = {},
  showSubmitButton = true,
  showCancelButton = true,
  showBackButton = false,
  maxWidth = 'md',
}) => {
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Box sx={{ maxWidth: maxWidth, mx: 'auto', width: '100%' }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Please fix the following errors:
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <Typography variant="body2">
                    {message}
                  </Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {children}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {showBackButton && onBack && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                disabled={isLoading}
              >
                {backText}
              </Button>
            )}

            {showCancelButton && onCancel && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
            )}

            {showSubmitButton && (
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : submitText}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default FormContainer; 