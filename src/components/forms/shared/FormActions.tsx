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
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  submitText,
  cancelText = 'Cancel',
  isSubmitting = false,
  isDisabled = false,
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
            type="submit"
            variant="contained"
            fullWidth
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isSubmitting || isDisabled}
            onClick={() => {
              console.log('Submit button clicked');
              console.log('isSubmitting:', isSubmitting);
              console.log('isDisabled:', isDisabled);
            }}
          >
            {isSubmitting ? `${submitText}...` : submitText}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSubmitting || isDisabled}
          >
            {cancelText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
