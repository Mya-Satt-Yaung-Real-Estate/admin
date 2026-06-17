import React from 'react';
import { Grid, TextField } from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface ContactSectionProps {
  values: Record<string, unknown>;
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<unknown>) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
}) => {
  return (
    <FormSection title="Contact Information">
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            name="contact_name"
            label="Contact Name"
            value={values.contact_name || ''}
            onChange={handleChange}
            error={touched.contact_name && Boolean(errors.contact_name)}
            helperText={touched.contact_name && errors.contact_name}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            name="contact_phone"
            label="Contact Phone"
            value={values.contact_phone || ''}
            onChange={handleChange}
            error={touched.contact_phone && Boolean(errors.contact_phone)}
            helperText={touched.contact_phone && errors.contact_phone}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            name="contact_email"
            label="Contact Email"
            type="email"
            value={values.contact_email || ''}
            onChange={handleChange}
            error={touched.contact_email && Boolean(errors.contact_email)}
            helperText={touched.contact_email && errors.contact_email}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
