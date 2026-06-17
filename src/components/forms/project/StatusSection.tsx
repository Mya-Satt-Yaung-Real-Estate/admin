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
import { PROJECT_PUBLISH_STATUSES } from '../../../validations/schemas/projectSchemas';

interface StatusSectionProps {
  values: Record<string, unknown>;
  handleChange: (e: React.ChangeEvent<unknown> | SelectChangeEvent<unknown>) => void;
  setFieldValue: (field: string, value: unknown) => void;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
  values,
  handleChange,
  setFieldValue,
}) => {
  return (
    <FormSection title="Status & Settings">
      <Grid container spacing={1.5}>
        <Grid item xs={12}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Publish Status</InputLabel>
            <Select
              name="publish_status"
              label="Publish Status"
              required
              value={values.publish_status || 'draft'}
              onChange={handleChange}
            >
              {PROJECT_PUBLISH_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="show_on_homepage"
                checked={Boolean(values.show_on_homepage)}
                onChange={(e) => setFieldValue('show_on_homepage', e.target.checked)}
              />
            }
            label="Show on Homepage"
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
