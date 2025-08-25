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
} from '@mui/material';
import { FormSection } from '../shared/FormSection';
import { PROPERTY_STATUSES } from '../../../validations';

interface StatusSectionProps {
  values: any;
  handleChange: (e: React.ChangeEvent<any> | SelectChangeEvent<any>) => void;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
  values,
  handleChange,
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

        {/* Featured Property */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="is_featured"
                checked={Boolean(values.is_featured)}
                onChange={(e) => {
                  console.log('is_featured switch changed:', e.target.checked);
                  console.log('Current values.is_featured:', values.is_featured, typeof values.is_featured);
                  handleChange(e);
                }}
              />
            }
            label="Featured Property"
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
