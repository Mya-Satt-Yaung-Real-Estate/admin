import React from 'react';
import { Autocomplete, FormControl, TextField } from '@mui/material';
import { getCompanyUserSelectLabel, RegularUser } from '../../../types/user';

interface CompanyUserSelectProps {
  userId?: number | null;
  onUserIdChange: (userId: number | undefined) => void;
  users: RegularUser[];
  usersLoading?: boolean;
  error?: string;
  touched?: boolean;
  submitAttempted?: boolean;
  onBlur?: () => void;
  disabled?: boolean;
}

export const CompanyUserSelect: React.FC<CompanyUserSelectProps> = ({
  userId,
  onUserIdChange,
  users,
  usersLoading = false,
  error,
  touched,
  submitAttempted = false,
  onBlur,
  disabled = false,
}) => {
  const companyUsers = users.filter((u) => u.user_type === 'company');
  const selected = companyUsers.find((u) => u.id === userId) ?? null;
  const hasError = Boolean(error && (touched || submitAttempted));

  return (
    <FormControl fullWidth variant="outlined" error={hasError}>
      <Autocomplete
        disabled={disabled}
        loading={usersLoading}
        options={companyUsers}
        value={selected}
        onChange={(_e, value) => onUserIdChange(value?.id)}
        onBlur={onBlur}
        getOptionLabel={getCompanyUserSelectLabel}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="outlined"
            label="Company user *"
            placeholder="Select company"
            error={hasError}
            helperText={hasError ? error : ''}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: true,
            }}
          />
        )}
      />
    </FormControl>
  );
};
