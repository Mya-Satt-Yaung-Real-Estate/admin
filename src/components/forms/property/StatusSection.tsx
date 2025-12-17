import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
  Typography,
  Alert,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { PROPERTY_STATUSES } from '../../../validations';

interface StatusSectionProps {
  values: any;
  handleChange: (e: React.ChangeEvent<any> | SelectChangeEvent<any>) => void;
  setFieldValue?: (field: string, value: any) => void;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
  values,
  handleChange,
  setFieldValue,
}) => {
  return (
    <FormSection 
      title="Status & Settings" 
      subtitle="Configure property status and settings"
    >
      <Grid container spacing={1.5}>
        {/* Status */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel size="small">Status</InputLabel>
            <Select
              name="status"
              label="Status"
              size="small"
              value={values.status || ''}
              onChange={handleChange}
            >
              <MenuItem value="">Select Status</MenuItem>
              {PROPERTY_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Tan Tan Tan */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="tan_tan_tan"
                checked={Boolean(values.tan_tan_tan)}
                onChange={(e) => {
                  console.log('tan_tan_tan switch changed:', e.target.checked);
                  console.log('Current values.tan_tan_tan:', values.tan_tan_tan, typeof values.tan_tan_tan);
                  if (setFieldValue) {
                    setFieldValue('tan_tan_tan', e.target.checked);
                  } else {
                    handleChange(e);
                  }
                }}
              />
            }
            label="Tan Tan Tan"
          />
        </Grid>

        {/* Bank Installment */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="bank_installment_available"
                checked={Boolean(values.bank_installment_available)}
                onChange={(e) => {
                  if (setFieldValue) {
                    setFieldValue('bank_installment_available', e.target.checked);
                  } else {
                    handleChange(e);
                  }
                }}
              />
            }
            label="Bank Installment Available"
          />
        </Grid>

        {/* Is Trending */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="is_trending"
                checked={Boolean(values.is_trending)}
                onChange={(e) => {
                  console.log('is_trending switch changed:', e.target.checked);
                  console.log('Current values.is_trending:', values.is_trending, typeof values.is_trending);
                  if (setFieldValue) {
                    setFieldValue('is_trending', e.target.checked);
                  } else {
                    handleChange(e);
                  }
                }}
              />
            }
            label="Is Premium"
          />
          {values.is_trending && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                Enabling premium feature will require additional points from the user's account when the property is published.
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
    </FormSection>
  );
};
