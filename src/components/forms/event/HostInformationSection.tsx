import React from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface HostInformationSectionProps {
  values: {
    host_user_id: number;
    host_contact_number: string;
  };
  errors: any;
  touched: any;
  handleChange: (event: React.ChangeEvent<any>) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
  users: any[];
  usersLoading?: boolean;
}

export const HostInformationSection: React.FC<HostInformationSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  users,
  usersLoading = false,
}) => {
  return (
    <FormSection title="Host Information">
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            size="small"
            options={users}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={users.find(user => user.id === values.host_user_id) || null}
            onChange={(_, newValue) => {
              handleChange({
                target: { name: 'host_user_id', value: newValue?.id || 0 }
              } as any);
            }}
            loading={usersLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  <span>
                    Host User <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
                  </span>
                }
                error={touched.host_user_id && Boolean(errors.host_user_id)}
                helperText={touched.host_user_id && errors.host_user_id}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label={
              <span>
                Host Contact Number <span style={{ color: 'red', fontSize: 'inherit' }}>*</span>
              </span>
            }
            name="host_contact_number"
            value={values.host_contact_number}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.host_contact_number && Boolean(errors.host_contact_number)}
            helperText={touched.host_contact_number && errors.host_contact_number}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};
