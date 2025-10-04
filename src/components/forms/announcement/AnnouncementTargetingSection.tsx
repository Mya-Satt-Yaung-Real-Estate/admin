import React from 'react';
import {
  Grid,
  FormControlLabel,
  Switch,
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { FormSection } from '../shared/FormSection';

interface AnnouncementTargetingSectionProps {
  values: any;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
  users?: Array<{ id: number; name: string; email: string }>;
  usersLoading?: boolean;
}

export const AnnouncementTargetingSection: React.FC<AnnouncementTargetingSectionProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  users = [],
  usersLoading = false,
}) => {
  const handleAllUsersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setFieldValue('all_users', checked);
    if (checked) {
      setFieldValue('user_ids', []);
    }
  };

  const handleUserSelection = (_event: any, newValue: any[]) => {
    setFieldValue('user_ids', newValue.map(user => user.id));
  };

  const selectedUsers = users.filter(user => values.user_ids.includes(user.id));

  return (
    <FormSection 
      title="Targeting" 
      subtitle="Select who should receive this announcement"
    >
      <Grid container spacing={1.5}>
        {/* All Users Toggle */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={values.all_users}
                onChange={handleAllUsersChange}
                name="all_users"
              />
            }
            label="Send to all users"
          />
        </Grid>

        {/* User Selection - Only show when not sending to all users */}
        {!values.all_users && (
          <Grid item xs={12}>
            <Autocomplete
              size="small"
              multiple
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUsers}
              onChange={handleUserSelection}
              loading={usersLoading}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={`${option.name} (${option.email})`}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Users"
                  error={touched.user_ids && Boolean(errors.user_ids)}
                  helperText={touched.user_ids && errors.user_ids}
                  placeholder="Search and select users..."
                />
              )}
            />
            {values.user_ids.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {values.user_ids.length} user{values.user_ids.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
            )}
          </Grid>
        )}

        {/* Show summary when all users is selected */}
        {values.all_users && (
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'info.light', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.main'
            }}>
              <Typography variant="body2" color="info.dark">
                This announcement will be sent to all users in the system.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </FormSection>
  );
};
