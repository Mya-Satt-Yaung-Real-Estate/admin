import React from 'react';
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface EventSettingsSectionProps {
  values: {
    is_free: boolean;
    price: number | undefined;
    need_registration: boolean;
    is_online: boolean;
    is_active: boolean;
    user_capacity: number | undefined;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
}

export const EventSettingsSection: React.FC<EventSettingsSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}) => {
  return (
    <FormSection title="Event Settings">
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={values.is_free}
                onChange={(e) => {
                  handleChange({
                    target: { name: 'is_free', value: e.target.checked }
                  } as any);
                  if (e.target.checked) {
                    handleChange({
                      target: { name: 'price', value: undefined }
                    } as any);
                  }
                }}
              />
            }
            label="Free Event"
          />
        </Grid>

        {!values.is_free && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Price (optional)"
              name="price"
              type="number"
              value={values.price || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.price && Boolean(errors.price)}
              helperText={touched.price && errors.price}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={values.need_registration}
                onChange={(e) => {
                  handleChange({
                    target: { name: 'need_registration', value: e.target.checked }
                  } as any);
                }}
              />
            }
            label="Registration Required"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={values.is_online}
                onChange={(e) => {
                  handleChange({
                    target: { name: 'is_online', value: e.target.checked }
                  } as any);
                }}
              />
            }
            label="Online Event"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={values.is_active}
                onChange={(e) => {
                  handleChange({
                    target: { name: 'is_active', value: e.target.checked }
                  } as any);
                }}
              />
            }
            label="Active"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="User Capacity (optional)"
            name="user_capacity"
            type="number"
            value={values.user_capacity || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.user_capacity && Boolean(errors.user_capacity)}
            helperText={touched.user_capacity && errors.user_capacity}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
