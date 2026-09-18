import React, { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Typography,
  createFilterOptions,
} from '@mui/material';
import { VpnKey as GrantIcon } from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import {
  ActionAlert,
  ConfirmationDialog,
  PageErrorState,
  PageLoadingState,
} from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import {
  useGrantPropertyNoteAccess,
  usePropertyNoteAccessGrantOptions,
} from '../../services/queries/propertyNoteAccessRequests';
import { useUsers } from '../../services/queries/users';
import { RegularUser, getRegularUserDisplayName } from '../../types/user';

const getUserSelectLabel = (user: RegularUser): string => {
  const name = getRegularUserDisplayName(user);
  const phone = user.phone?.trim() || '—';
  return `${name} - ${phone}`;
};

/**
 * Client-side filter across the full active-user list (name / phone / email).
 */
const filterActiveUsers = createFilterOptions<RegularUser>({
  stringify: (user) =>
    `${getRegularUserDisplayName(user)} ${user.name} ${user.phone ?? ''} ${user.email ?? ''}`,
});

const PropertyNoteAccessGrantPage: React.FC = () => {
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const grantMutation = useGrantPropertyNoteAccess();
  const {
    data: grantOptions,
    isLoading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = usePropertyNoteAccessGrantOptions();

  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<RegularUser | null>(null);
  const [chargePoints, setChargePoints] = useState(true);
  const [applyExpiry, setApplyExpiry] = useState(true);
  const [requireApprover, setRequireApprover] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  /**
   * No page/per_page → API returns all matching users (needed for full search/filter).
   */
  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    status: 'active',
  });

  const users = useMemo(() => {
    const rawUsers: RegularUser[] = Array.isArray((usersResponse as { data?: RegularUser[] })?.data)
      ? ((usersResponse as { data: RegularUser[] }).data)
      : Array.isArray(usersResponse)
        ? (usersResponse as RegularUser[])
        : [];

    const blockedIds = new Set(grantOptions?.blocked_user_ids ?? []);

    return rawUsers.filter(
      (user) =>
        (user.user_type === 'individual' || user.user_type === 'company') &&
        !blockedIds.has(user.id)
    );
  }, [usersResponse, grantOptions?.blocked_user_ids]);

  const unlockCost = grantOptions?.unlock_point_cost ?? 0;
  const accessDays = grantOptions?.access_days ?? 0;

  const previewPoints = chargePoints ? unlockCost : 0;
  const previewExpiry = applyExpiry ? `${accessDays} days` : 'Never expires';
  const previewStatus = requireApprover ? 'admin_approved → Approver' : 'approved (immediate)';

  const handleGrantClick = () => {
    if (!selectedUser) {
      setUserError('Select a user to grant access.');
      return;
    }
    setUserError(null);
    setConfirmOpen(true);
  };

  const handleConfirmGrant = async () => {
    if (!selectedUser) return;

    try {
      const response = await grantMutation.mutateAsync({
        user_id: selectedUser.id,
        charge_points: chargePoints,
        apply_expiry: applyExpiry,
        require_approver: requireApprover,
      });

      const result = response.data;
      const message =
        response.message ||
        (result?.awaiting_approver
          ? 'Granted. Waiting for mobile approver.'
          : 'Property Note access granted.');

      showSuccess(message);
      setSelectedUser(null);
      setUserSearch('');
      setChargePoints(true);
      setApplyExpiry(true);
      setRequireApprover(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Failed to grant Property Note access.';
      showError(message);
    } finally {
      /**
       * Always close confirm after Grant click (success or error).
       */
      setConfirmOpen(false);
    }
  };

  if (optionsLoading && !grantOptions) {
    return <PageLoadingState message="Loading grant options..." />;
  }

  if (optionsError && !grantOptions) {
    return (
      <PageErrorState
        error={optionsError instanceof Error ? optionsError.message : 'Failed to load grant options'}
        onRetry={() => {
          void refetchOptions();
        }}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Grant Property Note Access"
        subtitle="Path A — Admin enable with optional points, expiry, and approver"
        breadcrumbs="Dashboard / Property Note / Grant Access"
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Select user
        </Typography>

        <Autocomplete
          options={users}
          loading={usersLoading}
          value={selectedUser}
          onChange={(_event, value) => {
            setSelectedUser(value);
            if (value) {
              setUserError(null);
              setUserSearch(getUserSelectLabel(value));
            } else {
              setUserSearch('');
            }
          }}
          inputValue={userSearch}
          onInputChange={(_event, value, reason) => {
            /**
             * Keep typing + selection in sync.
             * "reset" runs after pick — without it the field keeps the search text (e.g. 4221).
             */
            if (reason === 'input' || reason === 'clear' || reason === 'reset') {
              setUserSearch(value);
            }
          }}
          getOptionLabel={(user) => getUserSelectLabel(user)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={filterActiveUsers}
          openOnFocus
          ListboxProps={{
            style: { maxHeight: 280 },
          }}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {getUserSelectLabel(option)}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="User"
              placeholder="Type name or phone to filter..."
              error={Boolean(userError)}
              helperText={
                userError ??
                `Eligible active users only (${users.length}). Already granted / awaiting approver hidden.`
              }
            />
          )}
        />

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
          Flags (default on)
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={chargePoints}
              onChange={(e) => setChargePoints(e.target.checked)}
              color="primary"
            />
          }
          label={`Charge points (${unlockCost} pts from System Config)`}
        />
        <FormControlLabel
          control={
            <Switch
              checked={applyExpiry}
              onChange={(e) => setApplyExpiry(e.target.checked)}
              color="primary"
            />
          }
          label={`Apply expiry (${accessDays} days from System Config)`}
        />
        <FormControlLabel
          control={
            <Switch
              checked={requireApprover}
              onChange={(e) => setRequireApprover(e.target.checked)}
              color="primary"
            />
          }
          label="Require Approver"
        />

        <Box
          sx={{
            mt: 2,
            mb: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="body2">
            Preview — points: <strong>{previewPoints}</strong>
          </Typography>
          <Typography variant="body2">
            Preview — expiry: <strong>{previewExpiry}</strong>
          </Typography>
          <Typography variant="body2">
            Preview — status: <strong>{previewStatus}</strong>
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<GrantIcon />}
          onClick={handleGrantClick}
          disabled={grantMutation.isPending}
        >
          Grant Access
        </Button>
      </Paper>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void handleConfirmGrant();
        }}
        title="Grant Property Note Access?"
        message={
          selectedUser
            ? `Grant access to ${getRegularUserDisplayName(selectedUser)}? Points: ${previewPoints}. Expiry: ${previewExpiry}. Flow: ${previewStatus}.`
            : 'Select a user first.'
        }
        action="custom"
        actionLabel="Grant"
        actionColor="primary"
        isLoading={grantMutation.isPending}
      />
    </Box>
  );
};

export default PropertyNoteAccessGrantPage;
