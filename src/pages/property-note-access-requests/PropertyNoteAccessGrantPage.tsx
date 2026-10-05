import React, { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
  createFilterOptions,
} from '@mui/material';
import { VpnKey as GrantIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  usePropertyNoteAccessUserDevices,
} from '../../services/queries/propertyNoteAccessRequests';
import { useUsers } from '../../services/queries/users';
import type { PropertyNoteAccessGrantDevice } from '../../types/propertyNoteAccess';
import { RegularUser, getRegularUserDisplayName } from '../../types/user';

const getUserSelectLabel = (user: RegularUser): string => {
  const name = getRegularUserDisplayName(user);
  const phone = user.phone?.trim() || '—';
  return `${name} - ${phone}`;
};

const getDeviceSelectLabel = (device: PropertyNoteAccessGrantDevice): string => {
  const name = device.device_name?.trim() || device.device_model?.trim() || device.device_id;
  return `${name} (${device.platform})`;
};

/**
 * Client-side filter across the full active-user list (name / phone / email).
 */
const filterActiveUsers = createFilterOptions<RegularUser>({
  stringify: (user) =>
    `${getRegularUserDisplayName(user)} ${user.name} ${user.phone ?? ''} ${user.email ?? ''}`,
});

const PropertyNoteAccessGrantPage: React.FC = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const grantMutation = useGrantPropertyNoteAccess();
  const {
    data: grantOptions,
    isLoading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = usePropertyNoteAccessGrantOptions();

  const [userSearch, setUserSearch] = useState('');
  const [seeOthersSearch, setSeeOthersSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<RegularUser | null>(null);
  const [seeOthersUsers, setSeeOthersUsers] = useState<RegularUser[]>([]);
  const [grantScope, setGrantScope] = useState<'user' | 'user_device'>('user');
  const [selectedDevices, setSelectedDevices] = useState<PropertyNoteAccessGrantDevice[]>([]);
  /**
   * Path A toggles — Approver is always required (no UI switch).
   */
  const [chargePoints, setChargePoints] = useState(true);
  const [applyExpiry, setApplyExpiry] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  /**
   * No page/per_page → API returns all matching users (needed for full search/filter).
   */
  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    status: 'active',
  });

  const { data: userDevices = [], isLoading: devicesLoading } = usePropertyNoteAccessUserDevices(
    selectedUser?.id ?? null
  );

  const allActiveUsers = useMemo(() => {
    const rawUsers: RegularUser[] = Array.isArray((usersResponse as { data?: RegularUser[] })?.data)
      ? ((usersResponse as { data: RegularUser[] }).data)
      : Array.isArray(usersResponse)
        ? (usersResponse as RegularUser[])
        : [];

    return rawUsers.filter(
      (user) => user.user_type === 'individual' || user.user_type === 'company'
    );
  }, [usersResponse]);

  const users = useMemo(() => {
    const blockedIds = new Set(grantOptions?.blocked_user_ids ?? []);

    return allActiveUsers.filter((user) => !blockedIds.has(user.id));
  }, [allActiveUsers, grantOptions?.blocked_user_ids]);

  /**
   * See-others list: any active user except the grantee.
   */
  const seeOthersOptions = useMemo(() => {
    if (!selectedUser) {
      return allActiveUsers;
    }
    return allActiveUsers.filter((user) => user.id !== selectedUser.id);
  }, [allActiveUsers, selectedUser]);

  const accessDays = grantOptions?.access_days ?? 0;
  const unlockPointCost = grantOptions?.unlock_point_cost ?? 0;

  /**
   * With Approver always on, points deduct on Approver final approve (not at Grant click).
   */
  const previewPoints = chargePoints
    ? `${unlockPointCost} (charge on Approver approve)`
    : '0 (no charge)';
  const previewExpiry = applyExpiry ? `${accessDays} days` : 'No expiry';
  const previewStatus = 'admin_approved → Approver → Approved';
  const previewSeeOthers =
    seeOthersUsers.length === 0
      ? 'Own data only'
      : seeOthersUsers.map((user) => getRegularUserDisplayName(user)).join(', ');
  const previewScope =
    grantScope === 'user'
      ? 'User only (any device)'
      : selectedDevices.length === 0
        ? 'User + Device (pick devices)'
        : `User + Device: ${selectedDevices.map(getDeviceSelectLabel).join(', ')}`;

  const handleGrantClick = () => {
    if (!selectedUser) {
      setUserError('Select a user to grant access.');
      return;
    }
    if (grantScope === 'user_device' && selectedDevices.length === 0) {
      setDeviceError('Select at least one device for User + Device grant.');
      return;
    }
    setUserError(null);
    setDeviceError(null);
    setConfirmOpen(true);
  };

  const handleConfirmGrant = async () => {
    if (!selectedUser) return;

    try {
      const response = await grantMutation.mutateAsync({
        user_id: selectedUser.id,
        charge_points: chargePoints,
        apply_expiry: applyExpiry,
        /**
         * Always await Approver — toggle not shown on this form.
         */
        require_approver: true,
        visible_user_ids: seeOthersUsers.map((user) => user.id),
        device_ids:
          grantScope === 'user_device' ? selectedDevices.map((device) => device.device_id) : [],
      });

      const result = response.data;
      const seeCount = result?.visible_user_ids?.length ?? seeOthersUsers.length;
      const message =
        response.message ||
        (result?.awaiting_approver
          ? 'Granted. Waiting for approver confirmation.'
          : 'Property Note access granted.');

      showSuccess(seeCount > 0 ? `${message} See-others: ${seeCount} user(s).` : message);
      setSelectedUser(null);
      setUserSearch('');
      setSeeOthersUsers([]);
      setSeeOthersSearch('');
      setGrantScope('user');
      setSelectedDevices([]);
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
        subtitle="Admin grant with Charge / Expiry flags; always awaits Approver before access is active"
        breadcrumbs="Dashboard / Property Note / Grant Access"
        actionButton={{
          text: 'Back to Access List',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/property-note-access-requests'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 960 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Select user
            </Typography>

            <Autocomplete
              options={users}
              loading={usersLoading}
              value={selectedUser}
              onChange={(_event, value) => {
                setSelectedUser(value);
                setSelectedDevices([]);
                setDeviceError(null);
                if (value) {
                  setUserError(null);
                  setUserSearch(getUserSelectLabel(value));
                  setSeeOthersUsers((prev) => prev.filter((user) => user.id !== value.id));
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
                    `Eligible active users only (${users.length}). Hidden: granted, awaiting approver, or revoked (Re-active first).`
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              See others (optional)
            </Typography>

            <Autocomplete
              multiple
              options={seeOthersOptions}
              loading={usersLoading}
              value={seeOthersUsers}
              onChange={(_event, value) => {
                setSeeOthersUsers(value);
              }}
              inputValue={seeOthersSearch}
              onInputChange={(_event, value, reason) => {
                if (reason === 'input' || reason === 'clear') {
                  setSeeOthersSearch(value);
                }
              }}
              getOptionLabel={(user) => getUserSelectLabel(user)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterOptions={filterActiveUsers}
              openOnFocus
              disableCloseOnSelect
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
                  label="See others"
                  placeholder="Pick users whose notes/pins this user may see..."
                  helperText="Optional. Empty = own map data only. Grantee is excluded."
                />
              )}
            />
          </Grid>
        </Grid>

        <FormControl sx={{ mt: 3, display: 'block' }}>
          <FormLabel>Access scope</FormLabel>
          <RadioGroup
            row
            value={grantScope}
            onChange={(e) => {
              const next = e.target.value === 'user_device' ? 'user_device' : 'user';
              setGrantScope(next);
              setSelectedDevices([]);
              setDeviceError(null);
            }}
          >
            <FormControlLabel value="user" control={<Radio />} label="User only (any device)" />
            <FormControlLabel value="user_device" control={<Radio />} label="User + Device" />
          </RadioGroup>
        </FormControl>

        {grantScope === 'user_device' && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              Devices
            </Typography>
            <Autocomplete
              multiple
              options={userDevices}
              loading={devicesLoading}
              disabled={!selectedUser}
              value={selectedDevices}
              onChange={(_event, value) => {
                setSelectedDevices(value);
                if (value.length > 0) {
                  setDeviceError(null);
                }
              }}
              getOptionLabel={(device) => getDeviceSelectLabel(device)}
              isOptionEqualToValue={(option, value) => option.device_id === value.device_id}
              openOnFocus
              disableCloseOnSelect
              ListboxProps={{
                style: { maxHeight: 280 },
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.device_id}>
                  {getDeviceSelectLabel(option)}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Devices"
                  placeholder={selectedUser ? 'Select one or more devices...' : 'Select a user first'}
                  error={Boolean(deviceError)}
                  helperText={
                    deviceError ??
                    (selectedUser
                      ? userDevices.length === 0
                        ? 'No registered devices for this user.'
                        : 'Each selected device gets its own access row.'
                      : 'Pick a user to load devices.')
                  }
                />
              )}
            />
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Flags (default on)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Approver is always required after Grant — not shown as a toggle.
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={chargePoints}
                onChange={(e) => setChargePoints(e.target.checked)}
                color="primary"
              />
            }
            label={
              chargePoints
                ? `Charge points (${unlockPointCost} pts on Approver approve)`
                : 'Charge points (off)'
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={applyExpiry}
                onChange={(e) => setApplyExpiry(e.target.checked)}
                color="primary"
              />
            }
            label={
              applyExpiry
                ? `Apply expiry (${accessDays} days from final approve)`
                : 'Apply expiry (off — no expiry)'
            }
          />
        </Box>

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
            Preview — scope: <strong>{previewScope}</strong>
          </Typography>
          <Typography variant="body2">
            Preview — points: <strong>{previewPoints}</strong>
          </Typography>
          <Typography variant="body2">
            Preview — expiry: <strong>{previewExpiry}</strong>
          </Typography>
          <Typography variant="body2">
            Preview — status: <strong>{previewStatus}</strong>
          </Typography>
          <Typography variant="body2">
            Preview — see others: <strong>{previewSeeOthers}</strong>
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
            ? `Grant access to ${getRegularUserDisplayName(selectedUser)}? Scope: ${previewScope}. Points: ${previewPoints}. Expiry: ${previewExpiry}. Flow: ${previewStatus}. See others: ${previewSeeOthers}.`
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
