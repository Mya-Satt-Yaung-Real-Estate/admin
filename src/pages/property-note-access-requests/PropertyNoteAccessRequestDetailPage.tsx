import React, { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Block as RevokeIcon,
  Cancel as RejectIcon,
  CheckCircle as ApproveIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import {
  ActionAlert,
  ConfirmationDialog,
  PageErrorState,
  PageLoadingState,
  StatusChip,
} from '../../components/ui';
import { useAlertSystem } from '../../hooks';
import {
  useAddPropertyNoteAccessDevices,
  useApprovePropertyNoteAccessRequest,
  useChangePropertyNoteAccessScope,
  usePropertyNoteAccessRequest,
  useRejectPropertyNoteAccessRequest,
  useRevokePropertyNoteAccessRequest,
  useUpdatePropertyNoteVisibleUsers,
} from '../../services/queries/propertyNoteAccessRequests';
import { useUsers } from '../../services/queries/users';
import type {
  PropertyNoteAccessGrantDevice,
  PropertyNoteAccessRequest,
} from '../../types/propertyNoteAccess';
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

const filterActiveUsers = createFilterOptions<RegularUser>({
  stringify: (user) =>
    `${getRegularUserDisplayName(user)} ${user.name} ${user.phone ?? ''} ${user.email ?? ''}`,
});

const filterDevices = createFilterOptions<PropertyNoteAccessGrantDevice>({
  stringify: (device) =>
    `${device.device_name ?? ''} ${device.device_model ?? ''} ${device.device_id} ${device.platform}`,
});

/**
 * List label for grant device scope.
 */
const formatDeviceLabel = (deviceId: string | null | undefined): string => {
  if (!deviceId) return 'Any device';
  return deviceId;
};

/**
 * Short device id for table/summary (full id in tooltip).
 */
const truncateDeviceId = (deviceId: string | null | undefined): string => {
  if (!deviceId) return 'Any device';
  if (deviceId.length <= 16) return deviceId;
  return `${deviceId.slice(0, 8)}…${deviceId.slice(-4)}`;
};

/**
 * Resolve registered device name (or model) for a grant device_id.
 */
const resolveDeviceName = (
  deviceId: string | null | undefined,
  devicesById: Map<string, PropertyNoteAccessGrantDevice>
): string => {
  if (!deviceId) return 'Any device';
  const device = devicesById.get(deviceId);
  const name = device?.device_name?.trim() || device?.device_model?.trim();
  return name || 'Unknown device';
};

/**
 * True when expires_at is set and already in the past.
 */
const isExpiresAtPast = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false;
  const parsed = new Date(expiresAt.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
};

/**
 * Web/mobile unlock (source=points) → System approved; else Approver name.
 */
const formatApprovedBy = (row: PropertyNoteAccessRequest): string => {
  if (row.status !== 'approved') return '—';
  if (row.source === 'points') return 'System approved';
  return row.approver?.name?.trim() || '—';
};

/**
 * Small label + value block for summary fields.
 */
const SummaryField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
      sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.4 }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

const PropertyNoteAccessRequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const accessId = Number(id);
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  const { data: detailResponse, isLoading, isFetching, isPlaceholderData, error, refetch } =
    usePropertyNoteAccessRequest(accessId);
  const detail = detailResponse?.data;
  const access = detail?.access;
  /** True while URL grant id differs from on-screen placeholder data. */
  const isSwitchingGrant = isPlaceholderData || (access != null && access.id !== accessId);
  const relatedGrants = detail?.related_grants ?? [];
  const registeredDevices = detail?.registered_devices ?? [];
  const visibleUsersFromApi = detail?.visible_users ?? [];

  const devicesById = useMemo(() => {
    const map = new Map<string, PropertyNoteAccessGrantDevice>();
    for (const device of registeredDevices) {
      map.set(device.device_id, device);
    }
    return map;
  }, [registeredDevices]);

  const approveMutation = useApprovePropertyNoteAccessRequest();
  const rejectMutation = useRejectPropertyNoteAccessRequest();
  const revokeMutation = useRevokePropertyNoteAccessRequest();
  const addDevicesMutation = useAddPropertyNoteAccessDevices();
  const changeScopeMutation = useChangePropertyNoteAccessScope();
  const updateVisibleMutation = useUpdatePropertyNoteVisibleUsers();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'revoke' | 'switch_devices' | 'convert_any';
    targetId: number | null;
  }>({ open: false, type: 'approve', targetId: null });

  const [selectedDevices, setSelectedDevices] = useState<PropertyNoteAccessGrantDevice[]>([]);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [seeOthersUsers, setSeeOthersUsers] = useState<RegularUser[]>([]);
  const [seeOthersSearch, setSeeOthersSearch] = useState('');
  const [deviceError, setDeviceError] = useState<string | null>(null);
  /**
   * Grant detail + manage UI opens in a modal when a table row is clicked.
   */
  const [grantModalOpen, setGrantModalOpen] = useState(false);

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    status: 'active',
  });

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

  /**
   * Prefill see-others from detail API when data loads / refreshes.
   */
  useEffect(() => {
    if (!access?.user) {
      setSeeOthersUsers([]);
      return;
    }

    const byId = new Map(allActiveUsers.map((u) => [u.id, u]));
    const mapped: RegularUser[] = visibleUsersFromApi.map((vu) => {
      const existing = byId.get(vu.id);
      if (existing) {
        return existing;
      }
      return {
        id: vu.id,
        name: vu.name,
        slug: String(vu.id),
        email: vu.email ?? '',
        phone: vu.phone ?? undefined,
        user_type: 'individual',
        member_level: 'basic',
        is_active: true,
        created_at: '',
        updated_at: '',
        property_count: 0,
        point_balance: 0,
        total_points_allocated: 0,
        total_points_consumed: 0,
        point_packages_count: 0,
      };
    });
    setSeeOthersUsers(mapped);
  }, [access?.user, allActiveUsers, visibleUsersFromApi]);

  const seeOthersOptions = useMemo(() => {
    if (!access?.user) return allActiveUsers;
    return allActiveUsers.filter((user) => user.id !== access.user?.id);
  }, [allActiveUsers, access?.user]);

  /**
   * Devices not already covered by an approved grant for this user.
   * API only accepts device_ids registered in user_devices.
   */
  const addableDevices = useMemo(() => {
    const usableDeviceIds = new Set(
      relatedGrants
        .filter((g) => g.status === 'approved')
        .map((g) => g.device_id)
        .filter((d): d is string => !!d)
    );
    const hasUserOnly = relatedGrants.some(
      (g) => g.status === 'approved' && g.device_id === null
    );
    if (hasUserOnly) {
      return [];
    }
    return registeredDevices.filter((d) => !usableDeviceIds.has(d.device_id));
  }, [registeredDevices, relatedGrants]);

  const hasUserOnlyApproved = useMemo(
    () =>
      relatedGrants.some((g) => g.status === 'approved' && g.device_id === null),
    [relatedGrants]
  );

  const approvedDeviceGrantCount = useMemo(
    () =>
      relatedGrants.filter((g) => g.status === 'approved' && g.device_id !== null)
        .length,
    [relatedGrants]
  );

  const addDeviceBlockedReason = useMemo(() => {
    if (addableDevices.length > 0) return null;
    if (hasUserOnlyApproved) {
      return null;
    }
    if (registeredDevices.length === 0) {
      return 'No registered devices for this user. They must log in from the mobile app once so the device appears in user_devices.';
    }
    if (approvedDeviceGrantCount >= registeredDevices.length) {
      return `All ${registeredDevices.length} registered device(s) already have an Approved grant. Revoke one first, or register another device via mobile login.`;
    }
    return 'No devices available to add.';
  }, [
    addableDevices.length,
    approvedDeviceGrantCount,
    hasUserOnlyApproved,
    registeredDevices.length,
  ]);

  const canConvertToAny =
    !hasUserOnlyApproved && approvedDeviceGrantCount > 0;

  const busy =
    isSwitchingGrant ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    revokeMutation.isPending ||
    addDevicesMutation.isPending ||
    changeScopeMutation.isPending ||
    updateVisibleMutation.isPending;

  const handleBack = () => {
    navigate('/property-note-access-requests');
  };

  const handleConfirm = async (reason?: string) => {
    if (!confirmState.targetId) return;
    try {
      if (confirmState.type === 'approve') {
        await approveMutation.mutateAsync(confirmState.targetId);
        showSuccess('Request approved. Mobile approvers notified.');
        setConfirmState({ open: false, type: 'approve', targetId: null });
      } else if (confirmState.type === 'reject') {
        await rejectMutation.mutateAsync({
          id: confirmState.targetId,
          rejectReason: reason?.trim() || undefined,
        });
        showSuccess('Request rejected.');
        setConfirmState({ open: false, type: 'approve', targetId: null });
      } else if (confirmState.type === 'revoke') {
        await revokeMutation.mutateAsync(confirmState.targetId);
        showSuccess('Access revoked. Points are not refunded.');
        setConfirmState({ open: false, type: 'approve', targetId: null });
      } else if (confirmState.type === 'switch_devices') {
        if (selectedDevices.length === 0) {
          setDeviceError('Select at least one device.');
          return;
        }
        const response = await changeScopeMutation.mutateAsync({
          id: confirmState.targetId,
          payload: {
            scope: 'devices',
            device_ids: selectedDevices.map((d) => d.device_id),
          },
        });
        setSelectedDevices([]);
        setDeviceSearch('');
        setConfirmState({ open: false, type: 'approve', targetId: null });
        showSuccess('Scope changed to selected devices.');
        const nextId = response.data?.access?.id;
        if (nextId && nextId !== accessId) {
          navigate(`/property-note-access-requests/${nextId}`);
        }
      } else if (confirmState.type === 'convert_any') {
        const response = await changeScopeMutation.mutateAsync({
          id: confirmState.targetId,
          payload: { scope: 'user_only' },
        });
        setConfirmState({ open: false, type: 'approve', targetId: null });
        showSuccess('Scope changed to Any device.');
        const nextId = response.data?.access?.id;
        if (nextId && nextId !== accessId) {
          navigate(`/property-note-access-requests/${nextId}`);
        }
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : `Failed to ${confirmState.type}.`;
      showError(message);
    }
  };

  const handleAddDevices = async () => {
    if (selectedDevices.length === 0) {
      setDeviceError('Select at least one device.');
      return;
    }
    setDeviceError(null);
    try {
      await addDevicesMutation.mutateAsync({
        id: accessId,
        payload: {
          device_ids: selectedDevices.map((d) => d.device_id),
          charge_points: false,
          require_approver: false,
        },
      });
      setSelectedDevices([]);
      setDeviceSearch('');
      showSuccess('Device access granted.');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Failed to add device access.';
      showError(message);
    }
  };

  const handleSaveSeeOthers = async () => {
    try {
      await updateVisibleMutation.mutateAsync({
        id: accessId,
        visibleUserIds: seeOthersUsers.map((u) => u.id),
      });
      showSuccess('See-others list saved.');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Failed to save see-others users.';
      showError(message);
    }
  };

  /**
   * Enable Save only when the selected user set differs from the API list.
   */
  const hasSeeOthersChanges = useMemo(() => {
    const currentIds = seeOthersUsers.map((u) => u.id).sort((a, b) => a - b);
    const savedIds = visibleUsersFromApi.map((u) => u.id).sort((a, b) => a - b);
    if (currentIds.length !== savedIds.length) return true;
    return currentIds.some((id, index) => id !== savedIds[index]);
  }, [seeOthersUsers, visibleUsersFromApi]);

  /**
   * Full-page loader only on first open (no cached/placeholder data).
   * Row switches keep the previous grant visible via keepPreviousData.
   */
  if (isLoading && !detail) {
    return <PageLoadingState title="Loading Access Detail" />;
  }

  if ((error && !detail) || !access) {
    return (
      <PageErrorState
        error={error ?? new Error('Access request not found')}
        title="Error Loading Access Detail"
        message={
          error instanceof Error ? error.message : 'Access request not found.'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  const canApprove = access.status === 'pending';
  const canReject = access.status === 'pending';
  const canRevoke = access.status === 'approved';

  const statusHint =
    access.status === 'pending'
      ? 'Waiting for Admin approve or reject.'
      : access.status === 'admin_approved'
        ? 'Waiting for Approver. Admin cannot approve/reject/revoke here.'
        : access.status === 'approved'
          ? 'Access is active. Manage devices and see-others on the right.'
          : access.status === 'revoked'
            ? 'Access was revoked. Re-grant via Add on Access List, or Add devices.'
            : access.status === 'rejected'
              ? 'Request was rejected.'
              : null;

  const deviceName = resolveDeviceName(access.device_id, devicesById);
  const deviceIdFull = formatDeviceLabel(access.device_id);

  return (
    <Box>
      {isFetching && (
        <LinearProgress
          sx={{ position: 'sticky', top: 0, zIndex: 2, mb: 1, borderRadius: 1 }}
        />
      )}
      <PageHeader
        title={access.user?.name || `Access #${accessId}`}
        subtitle="Manage access below · click a grant row for grant details"
        breadcrumbs="Dashboard / Property Note / Access List / Detail"
        actionButton={{
          text: 'Back to Access List',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Manage access
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 1.5, color: 'primary.dark', fontWeight: 500 }}
          >
            Change scope, add devices, or edit see-others for the selected grant (Open row).
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2} columnSpacing={{ xs: 2, md: 6 }} alignItems="stretch">
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  flex: 1,
                }}
              >
              {hasUserOnlyApproved ? (
                <>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Switch to selected devices
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}
                  >
                    Revokes Any-device and grants only the devices you pick. Unselected phones lose
                    access. No points charged.
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}
                  >
                    Registered: {registeredDevices.length}
                  </Typography>
                  {registeredDevices.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="warning.main"
                      sx={{ mb: 1.5, p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}
                    >
                      No registered devices. User must log in from mobile once so devices appear in
                      user_devices.
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        mt: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Autocomplete
                        multiple
                        options={registeredDevices}
                        value={selectedDevices}
                        onChange={(_e, value) => {
                          setSelectedDevices(value);
                          if (value.length > 0) setDeviceError(null);
                        }}
                        inputValue={deviceSearch}
                        onInputChange={(_e, value, reason) => {
                          if (reason === 'input' || reason === 'clear') {
                            setDeviceSearch(value);
                          }
                        }}
                        filterOptions={filterDevices}
                        getOptionLabel={getDeviceSelectLabel}
                        isOptionEqualToValue={(a, b) => a.device_id === b.device_id}
                        disabled={busy}
                        openOnFocus
                        disableCloseOnSelect
                        sx={{ width: '100%' }}
                        ListboxProps={{
                          style: { maxHeight: 220 },
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.device_id}>
                            {getDeviceSelectLabel(option)}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Devices to keep"
                            placeholder="Search or pick devices…"
                            error={!!deviceError}
                            helperText={deviceError || undefined}
                            FormHelperTextProps={
                              deviceError
                                ? { sx: { color: 'error.main', mx: 0 } }
                                : undefined
                            }
                          />
                        )}
                      />
                      <Button
                        variant="contained"
                        color="warning"
                        disabled={busy || selectedDevices.length === 0}
                        onClick={() => {
                          if (selectedDevices.length === 0) {
                            setDeviceError('Select at least one device.');
                            return;
                          }
                          setDeviceError(null);
                          setConfirmState({
                            open: true,
                            type: 'switch_devices',
                            targetId: accessId,
                          });
                        }}
                      >
                        Switch to selected devices
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Add another device
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}
                  >
                    Registered: {registeredDevices.length} · Approved:{' '}
                    {approvedDeviceGrantCount} · Available: {addableDevices.length}
                  </Typography>
                  {addDeviceBlockedReason && (
                    <Typography
                      variant="body2"
                      color="warning.main"
                      sx={{ mb: 1.5, p: 1.5, bgcolor: 'warning.50', borderRadius: 1 }}
                    >
                      {addDeviceBlockedReason}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      mt: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      alignItems: 'flex-start',
                      mb: canConvertToAny ? 1.5 : 0,
                    }}
                  >
                    <Autocomplete
                      multiple
                      options={addableDevices}
                      value={selectedDevices}
                      onChange={(_e, value) => {
                        setSelectedDevices(value);
                        if (value.length > 0) setDeviceError(null);
                      }}
                      inputValue={deviceSearch}
                      onInputChange={(_e, value, reason) => {
                        if (reason === 'input' || reason === 'clear') {
                          setDeviceSearch(value);
                        }
                      }}
                      filterOptions={filterDevices}
                      getOptionLabel={getDeviceSelectLabel}
                      isOptionEqualToValue={(a, b) => a.device_id === b.device_id}
                      disabled={busy || addableDevices.length === 0}
                      openOnFocus
                      disableCloseOnSelect
                      sx={{ width: '100%' }}
                      ListboxProps={{
                        style: { maxHeight: 220 },
                      }}
                      renderOption={(props, option) => (
                        <li {...props} key={option.device_id}>
                          {getDeviceSelectLabel(option)}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Devices to grant"
                          placeholder={
                            addableDevices.length === 0
                              ? 'No devices available to add'
                              : 'Search or pick devices…'
                          }
                          error={!!deviceError}
                          helperText={deviceError || undefined}
                          FormHelperTextProps={
                            deviceError
                              ? { sx: { color: 'error.main', mx: 0 } }
                              : undefined
                          }
                        />
                      )}
                    />
                    <Button
                      variant="contained"
                      disabled={busy || selectedDevices.length === 0}
                      onClick={() => void handleAddDevices()}
                    >
                      Add devices
                    </Button>
                  </Box>
                  {canConvertToAny && (
                    <Button
                      sx={{ display: 'block' }}
                      variant="outlined"
                      color="warning"
                      disabled={busy}
                      onClick={() =>
                        setConfirmState({
                          open: true,
                          type: 'convert_any',
                          targetId: accessId,
                        })
                      }
                    >
                      Convert to Any device
                    </Button>
                  )}
                </>
              )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  flex: 1,
                }}
              >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                See-others (map visibility)
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, color: 'primary.main', fontWeight: 600 }}
              >
                Other users whose notes/pins this person may see. Not tied to a device.
              </Typography>
              <Box
                sx={{
                  mt: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                <Autocomplete
                  multiple
                  options={seeOthersOptions}
                  value={seeOthersUsers}
                  onChange={(_e, value) => setSeeOthersUsers(value)}
                  inputValue={seeOthersSearch}
                  onInputChange={(_e, value) => setSeeOthersSearch(value)}
                  filterOptions={filterActiveUsers}
                  loading={usersLoading}
                  getOptionLabel={getUserSelectLabel}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  disabled={busy}
                  openOnFocus
                  disableCloseOnSelect
                  sx={{ width: '100%' }}
                  ListboxProps={{
                    style: { maxHeight: 220 },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Visible users"
                      placeholder="Search name or phone…"
                    />
                  )}
                />
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={busy || !hasSeeOthersChanges}
                  onClick={() => void handleSaveSeeOthers()}
                >
                  Save see-others
                </Button>
              </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All device grants for this user
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Click a row to open grant details and manage access in a popup.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer sx={{ maxHeight: { xs: 480, md: 640 } }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Grant</TableCell>
                  <TableCell>Device name</TableCell>
                  <TableCell>Device id</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Approved By</TableCell>
                  <TableCell>Expires at</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatedGrants.map((row: PropertyNoteAccessRequest) => {
                  const isCurrent = row.id === accessId;
                  const rowName = resolveDeviceName(row.device_id, devicesById);
                  const rowIdFull = formatDeviceLabel(row.device_id);
                  return (
                    <TableRow
                      key={row.id}
                      selected={isCurrent && grantModalOpen}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setGrantModalOpen(true);
                        if (!isCurrent) {
                          navigate(`/property-note-access-requests/${row.id}`);
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="body2">#{row.id}</Typography>
                          {isCurrent && grantModalOpen && (
                            <Chip
                              label="Open"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {rowName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={rowIdFull}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {truncateDeviceId(row.device_id)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={row.status} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatApprovedBy(row)}</Typography>
                      </TableCell>
                      <TableCell>
                        {row.expires_at ? (
                          <Typography
                            variant="body2"
                            sx={
                              isExpiresAtPast(row.expires_at)
                                ? { color: 'error.main', fontWeight: 600 }
                                : undefined
                            }
                          >
                            {row.expires_at}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No expiry
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const canApproveRow = row.status === 'pending';
                          const canRejectRow = row.status === 'pending';
                          const canRevokeRow = row.status === 'approved';
                          const approveTitle = canApproveRow
                            ? 'Approve (send to mobile approvers)'
                            : row.status === 'admin_approved'
                              ? 'Waiting for mobile Approver'
                              : 'Only pending requests can be approved';
                          const rejectTitle = canRejectRow
                            ? 'Reject'
                            : row.status === 'admin_approved'
                              ? 'Waiting for mobile Approver — Admin cannot reject'
                              : 'Only pending requests can be rejected';
                          const revokeTitle = canRevokeRow
                            ? 'Revoke Access (no point refund)'
                            : 'Only approved access can be revoked';

                          return (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                              <Tooltip title={approveTitle}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    disabled={!canApproveRow || busy}
                                    onClick={() =>
                                      setConfirmState({
                                        open: true,
                                        type: 'approve',
                                        targetId: row.id,
                                      })
                                    }
                                  >
                                    <ApproveIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={rejectTitle}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    disabled={!canRejectRow || busy}
                                    onClick={() =>
                                      setConfirmState({
                                        open: true,
                                        type: 'reject',
                                        targetId: row.id,
                                      })
                                    }
                                  >
                                    <RejectIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={revokeTitle}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    disabled={!canRevokeRow || busy}
                                    onClick={() =>
                                      setConfirmState({
                                        open: true,
                                        type: 'revoke',
                                        targetId: row.id,
                                      })
                                    }
                                  >
                                    <RevokeIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {relatedGrants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary">
                        No grants found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Grant #{accessId}
          <IconButton
            aria-label="Close"
            onClick={() => setGrantModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Typography variant="h6" gutterBottom>
                This grant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                One access row for this user (device scope + status).
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <StatusChip status={access.status} />
                <Chip label={`#${accessId}`} size="small" variant="outlined" />
              </Box>
              {statusHint && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {statusHint}
                </Typography>
              )}

              <SummaryField label="User">
                <Typography variant="body1" fontWeight={600}>
                  {access.user?.name || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {access.user?.phone || access.user?.email || '—'}
                </Typography>
              </SummaryField>

              <SummaryField label="Device name">
                <Typography variant="body1" fontWeight={600}>
                  {deviceName}
                </Typography>
              </SummaryField>

              <SummaryField label="Device id">
                <Tooltip title={deviceIdFull}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace', cursor: 'default' }}
                  >
                    {truncateDeviceId(access.device_id)}
                  </Typography>
                </Tooltip>
              </SummaryField>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <SummaryField label="Expires">
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={
                        access.expires_at && isExpiresAtPast(access.expires_at)
                          ? { color: 'error.main' }
                          : undefined
                      }
                    >
                      {access.expires_at || 'No expiry'}
                    </Typography>
                  </SummaryField>
                </Grid>
                <Grid item xs={6}>
                  <SummaryField label="Approved By">
                    <Typography variant="body1">{formatApprovedBy(access)}</Typography>
                  </SummaryField>
                </Grid>
                <Grid item xs={6}>
                  <SummaryField label="Source">
                    <Typography variant="body1">{access.source || '—'}</Typography>
                  </SummaryField>
                </Grid>
              </Grid>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.4 }}
              >
                Timeline
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Requested
                  </Typography>
                  <Typography variant="body2">{access.created_at || '—'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Admin at
                  </Typography>
                  <Typography variant="body2">{access.admin_approved_at || '—'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Approver at
                  </Typography>
                  <Typography variant="body2">{access.approved_at || '—'}</Typography>
                </Grid>
              </Grid>

              {access.reject_reason && (
                <SummaryField label="Reject reason">
                  <Typography variant="body2">{access.reject_reason}</Typography>
                </SummaryField>
              )}

              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Tooltip
                  title={
                    canApprove
                      ? 'Approve (send to mobile approvers)'
                      : access.status === 'admin_approved'
                        ? 'Waiting for mobile Approver'
                        : 'Only pending requests can be approved'
                  }
                >
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<ApproveIcon />}
                      disabled={!canApprove || busy}
                      onClick={() =>
                        setConfirmState({ open: true, type: 'approve', targetId: access.id })
                      }
                    >
                      Approve
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    canReject
                      ? 'Reject'
                      : access.status === 'admin_approved'
                        ? 'Waiting for mobile Approver — Admin cannot reject'
                        : 'Only pending requests can be rejected'
                  }
                >
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      disabled={!canReject || busy}
                      onClick={() =>
                        setConfirmState({ open: true, type: 'reject', targetId: access.id })
                      }
                    >
                      Reject
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    canRevoke
                      ? 'Revoke Access (no point refund)'
                      : 'Only approved access can be revoked'
                  }
                >
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<RevokeIcon />}
                      disabled={!canRevoke || busy}
                      onClick={() =>
                        setConfirmState({ open: true, type: 'revoke', targetId: access.id })
                      }
                    >
                      Revoke
                    </Button>
                  </span>
                </Tooltip>
              </Box>

          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmState.open}
        onClose={() => setConfirmState({ open: false, type: 'approve', targetId: null })}
        onConfirm={handleConfirm}
        title={
          confirmState.type === 'approve'
            ? 'Approve access request?'
            : confirmState.type === 'reject'
              ? 'Reject access request?'
              : confirmState.type === 'switch_devices'
                ? 'Switch to selected devices?'
                : confirmState.type === 'convert_any'
                  ? 'Convert to Any device?'
                  : 'Revoke Property Note access?'
        }
        message={
          confirmState.type === 'approve'
            ? 'Approve this unlock request? Mobile approvers will be notified.'
            : confirmState.type === 'reject'
              ? 'Reject this unlock request?'
              : confirmState.type === 'switch_devices'
                ? `Revoke Any-device and grant only ${selectedDevices.length} selected device(s)? Unselected phones lose access. Points are not charged.`
                : confirmState.type === 'convert_any'
                  ? 'Revoke all device-specific grants and create one Any-device grant? All phones unlock. Points are not charged.'
                  : 'Revoke this approved access? Points are not refunded. Login stays active.'
        }
        action={
          confirmState.type === 'approve'
            ? 'approve'
            : confirmState.type === 'reject'
              ? 'reject'
              : 'custom'
        }
        actionLabel={
          confirmState.type === 'approve'
            ? 'Approve'
            : confirmState.type === 'reject'
              ? 'Reject'
              : confirmState.type === 'switch_devices'
                ? 'Switch scope'
                : confirmState.type === 'convert_any'
                  ? 'Convert to Any'
                  : 'Revoke Access'
        }
        actionColor={confirmState.type === 'approve' ? 'success' : 'error'}
        requireReason={false}
        isLoading={busy}
      />
    </Box>
  );
};

export default PropertyNoteAccessRequestDetailPage;
