import React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Business as BusinessIcon, Person as PersonIcon } from '@mui/icons-material';
import { getUserSelectLabel, RegularUser } from '../../../types/user';

interface ActivityModeSectionProps {
  isPlatformActivity: boolean;
  onPlatformActivityChange: (value: boolean) => void;
}

interface ActivityUserSelectProps {
  userId: number | null;
  onUserIdChange: (value: number | null) => void;
  users: RegularUser[];
  usersLoading?: boolean;
  error?: string;
}

export const ActivityModeSection: React.FC<ActivityModeSectionProps> = ({
  isPlatformActivity,
  onPlatformActivityChange,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Switch
          checked={isPlatformActivity}
          onChange={(event) => onPlatformActivityChange(event.target.checked)}
          color="primary"
        />
        <BusinessIcon color={isPlatformActivity ? 'primary' : 'action'} sx={{ fontSize: 20 }} />
        <Typography
          variant="body1"
          fontWeight={500}
          color={isPlatformActivity ? 'primary.main' : 'text.secondary'}
        >
          Platform Activity
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Switch
          checked={!isPlatformActivity}
          onChange={(event) => onPlatformActivityChange(!event.target.checked)}
          color="primary"
        />
        <PersonIcon color={!isPlatformActivity ? 'primary' : 'action'} sx={{ fontSize: 20 }} />
        <Typography
          variant="body1"
          fontWeight={500}
          color={!isPlatformActivity ? 'primary.main' : 'text.secondary'}
        >
          User Activity
        </Typography>
      </Box>
    </Box>
  );
};

export const ActivityUserSelect: React.FC<ActivityUserSelectProps> = ({
  userId,
  onUserIdChange,
  users,
  usersLoading = false,
  error,
}) => {
  return (
    <Autocomplete
      id="user_id"
      options={users}
      loading={usersLoading}
      value={users.find((user) => user.id === userId) ?? null}
      onChange={(_event, selectedUser) => onUserIdChange(selectedUser?.id ?? null)}
      getOptionLabel={(user) => getUserSelectLabel(user)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="User"
          required
          error={Boolean(error)}
          helperText={error || 'Active individual and company users only.'}
          placeholder="Search name or phone..."
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
        />
      )}
    />
  );
};

export const ActivityPlatformNotice: React.FC = () => (
  <Alert severity="info">
    This activity will be owned and managed by the platform.
  </Alert>
);
