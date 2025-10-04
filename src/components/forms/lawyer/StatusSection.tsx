import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ToggleOn as StatusIcon } from '@mui/icons-material';
import { LawyerFormData } from '../../../types/lawyer';

interface StatusSectionProps {
  values: LawyerFormData;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <StatusIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="600">
            Status Settings
          </Typography>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={values.status || false}
                onChange={(e) => setFieldValue('status', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="500">
                  Lawyer Status
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {values.status ? 'Active - Lawyer is available for services' : 'Inactive - Lawyer is not available'}
                </Typography>
              </Box>
            }
          />
          
          {touched.status && errors.status && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.status}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusSection;
