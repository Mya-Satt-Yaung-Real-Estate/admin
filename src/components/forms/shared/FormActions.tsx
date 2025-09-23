import React from 'react';
import { Card, CardContent, Typography, Divider, Box, Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

interface FormActionsProps {
  onSubmit?: () => void;
  onCancel: () => void;
  submitText: string;
  cancelText?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  cancelDisabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  submitText,
  cancelText = 'Cancel',
  isSubmitting = false,
  isDisabled = false,
  cancelDisabled = false,
}) => {
  return (
    <Card sx={{ position: 'sticky', top: 24 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isSubmitting || isDisabled}
            onClick={() => {
              if (onSubmit) {
                onSubmit();
              }
            }}
          >
            {isSubmitting ? `${submitText}...` : submitText}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSubmitting || cancelDisabled}
          >
            {cancelText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
