import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
  Stack,
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
  InfoOutlined as InfoIcon,
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
  useReactivatePropertyNotePointUnlock,
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
  if (!deviceId) return '-';
  return deviceId;
};

/**
 * Short device id for table/summary (full id in tooltip).
 * User-only grants (null device_id) show dash — name column already says Any device.
 */
const truncateDeviceId = (deviceId: string | null | undefined): string => {
  if (!deviceId) return '-';
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
 * Approved and still within paid period (null expires_at = no expiry).
 */
const isUsableApprovedGrant = (grant: PropertyNoteAccessRequest): boolean => {
  if (grant.status !== 'approved') return false;
  return !isExpiresAtPast(grant.expires_at);
};

/**
 * Activity time for live-scope detection (revoke / scope switch touch).
 */
const grantActivityMs = (grant: PropertyNoteAccessRequest): number => {
  if (grant.updated_at) {
    const parsed = Date.parse(grant.updated_at);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (grant.created_at) {
    const parsed = Date.parse(grant.created_at.replace(' ', 'T'));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return grant.id;
};

/**
 * True when `a` is more recently touched than `b` (updated_at, then id).
 */
const isNewerGrant = (
  a: PropertyNoteAccessRequest,
  b: PropertyNoteAccessRequest
): boolean => {
  const ta = grantActivityMs(a);
  const tb = grantActivityMs(b);
  if (ta !== tb) return ta > tb;
  return a.id > b.id;
};

/**
 * Action By — only 3 kinds: Approver name | Super Admin | System approved.
 */
const formatActionBy = (row: PropertyNoteAccessRequest): string => {
  if (row.status === 'approved') {
    if (row.approver?.name?.trim()) return row.approver.name.trim();
    if (row.admin?.name?.trim()) return row.admin.name.trim();
    if (row.source === 'points') return 'System approved';
    return '—';
  }
  if (row.status === 'rejected') {
    if (row.approver?.name?.trim()) return row.approver.name.trim();
    if (row.admin?.name?.trim()) return row.admin.name.trim();
    return '—';
  }
  if (row.status === 'revoked') {
    return row.admin?.name?.trim() || '—';
  }
  return '—';
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

/**
 * Static live-scope dot — green = allowed, orange = restorable (no pulse).
 */
const ScopeDot: React.FC<{ tone: 'allowed' | 'restorable'; label: string }> = ({
  tone,
  label,
}) => (
  <Tooltip title={label}>
    <Box
      component="span"
      aria-label={label}
      sx={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-block',
        bgcolor: tone === 'allowed' ? 'success.main' : 'warning.main',
        boxShadow:
          tone === 'allowed'
            ? '0 0 0 3px rgba(46, 125, 50, 0.18)'
            : '0 0 0 3px rgba(237, 108, 2, 0.18)',
      }}
    />
  </Tooltip>
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
  const reactivateMutation = useReactivatePropertyNotePointUnlock();
  const addDevicesMutation = useAddPropertyNoteAccessDevices();
  const changeScopeMutation = useChangePropertyNoteAccessScope();
  const updateVisibleMutation = useUpdatePropertyNoteVisibleUsers();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type:
      | 'approve'
      | 'reject'
      | 'revoke'
      | 'switch_devices'
      | 'convert_any'
      | 'reactivate_point_unlock';
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
   * Devices not usable, and not waiting for Re-active (revoked + paid period still valid).
   */
  const addableDevices = useMemo(() => {
    const usableDeviceIds = new Set(
      relatedGrants
        .filter((g) => isUsableApprovedGrant(g))
        .map((g) => g.device_id)
        .filter((d): d is string => !!d)
    );
    const restorableDeviceIds = new Set(
      relatedGrants
        .filter((g) => g.status === 'revoked' && !isExpiresAtPast(g.expires_at) && g.device_id)
        .map((g) => g.device_id as string)
    );
    const hasUserOnly = relatedGrants.some(
      (g) => isUsableApprovedGrant(g) && g.device_id === null
    );
    if (hasUserOnly) {
      return [];
    }
    return registeredDevices.filter(
      (d) => !usableDeviceIds.has(d.device_id) && !restorableDeviceIds.has(d.device_id)
    );
  }, [registeredDevices, relatedGrants]);

  const restorableRevokedDeviceCount = useMemo(
    () =>
      relatedGrants.filter(
        (g) => g.status === 'revoked' && !isExpiresAtPast(g.expires_at) && g.device_id
      ).length,
    [relatedGrants]
  );

  /**
   * Drop Add selections that must use Re-active instead.
   */
  useEffect(() => {
    setSelectedDevices((prev) =>
      prev.filter((device) =>
        addableDevices.some((option) => option.device_id === device.device_id)
      )
    );
  }, [addableDevices]);

  const hasUserOnlyApproved = useMemo(
    () =>
      relatedGrants.some((g) => isUsableApprovedGrant(g) && g.device_id === null),
    [relatedGrants]
  );

  const approvedDeviceGrantCount = useMemo(
    () =>
      relatedGrants.filter((g) => isUsableApprovedGrant(g) && g.device_id !== null)
        .length,
    [relatedGrants]
  );

  /**
   * Most recently touched approved|revoked grant → latest mode when nothing is usable.
   * After revoke Any-device, that row wins over older revoked device rows (by updated_at).
   */
  const latestScopeGrant = useMemo(() => {
    let latest: PropertyNoteAccessRequest | null = null;
    for (const grant of relatedGrants) {
      if (grant.status !== 'approved' && grant.status !== 'revoked') continue;
      if (!latest || isNewerGrant(grant, latest)) {
        latest = grant;
      }
    }
    return latest;
  }, [relatedGrants]);

  /**
   * Live scope: usable Approved wins; else most recently touched approved|revoked grant.
   */
  const liveScope = useMemo((): 'any-device' | 'user-device' | 'none' => {
    if (hasUserOnlyApproved) return 'any-device';
    if (approvedDeviceGrantCount > 0) return 'user-device';
    if (!latestScopeGrant) return 'none';
    return latestScopeGrant.device_id === null ? 'any-device' : 'user-device';
  }, [approvedDeviceGrantCount, hasUserOnlyApproved, latestScopeGrant]);

  /**
   * Single live Any-device row: usable Approved, else most recently touched Any-device.
   */
  const liveAnyDeviceGrantId = useMemo(() => {
    let usable: PropertyNoteAccessRequest | null = null;
    let latestAny: PropertyNoteAccessRequest | null = null;
    for (const grant of relatedGrants) {
      if (grant.device_id !== null) continue;
      if (grant.status !== 'approved' && grant.status !== 'revoked') continue;
      if (isUsableApprovedGrant(grant)) {
        usable = grant;
      }
      if (!latestAny || isNewerGrant(grant, latestAny)) {
        latestAny = grant;
      }
    }
    return usable?.id ?? latestAny?.id ?? null;
  }, [relatedGrants]);

  /**
   * Per device_id: usable Approved wins, else most recently touched approved|revoked id.
   * Older duplicate device rows stay history-only (badge / action / Re-active off).
   */
  const liveDeviceFocusIdByDeviceId = useMemo(() => {
    const latestGrant = new Map<string, PropertyNoteAccessRequest>();
    const usableId = new Map<string, number>();
    for (const grant of relatedGrants) {
      if (!grant.device_id) continue;
      if (grant.status !== 'approved' && grant.status !== 'revoked') continue;
      const prev = latestGrant.get(grant.device_id);
      if (!prev || isNewerGrant(grant, prev)) {
        latestGrant.set(grant.device_id, grant);
      }
      if (isUsableApprovedGrant(grant)) {
        usableId.set(grant.device_id, grant.id);
      }
    }
    const result = new Map<string, number>();
    latestGrant.forEach((grant, deviceId) => {
      result.set(deviceId, usableId.get(deviceId) ?? grant.id);
    });
    return result;
  }, [relatedGrants]);

  const addDeviceBlockedReason = useMemo(() => {
    if (addableDevices.length > 0) return null;
    if (hasUserOnlyApproved) {
      return null;
    }
    if (registeredDevices.length === 0) {
      return 'No registered devices for this user. They must log in from the app once so the device appears in user_devices.';
    }
    if (restorableRevokedDeviceCount > 0) {
      return `${restorableRevokedDeviceCount} revoked device(s) still have a valid paid period — open that Revoked row and use Re-active (not Add devices).`;
    }
    if (approvedDeviceGrantCount >= registeredDevices.length) {
      return `All ${registeredDevices.length} registered device(s) already have an Approved grant. Revoke one first, or register another device via login.`;
    }
    return 'No devices available to add.';
  }, [
    addableDevices.length,
    approvedDeviceGrantCount,
    hasUserOnlyApproved,
    registeredDevices.length,
    restorableRevokedDeviceCount,
  ]);

  const canConvertToAny =
    !hasUserOnlyApproved && approvedDeviceGrantCount > 0;

  /**
   * At least one Approved grant still within paid period.
   */
  const hasUsableApproved = useMemo(
    () => relatedGrants.some((g) => isUsableApprovedGrant(g)),
    [relatedGrants]
  );

  /**
   * No usable (non-expired) Approved grant left but revoke history exists — show Re-active.
   */
  const needsRestore = useMemo(() => {
    const hasRevoked = relatedGrants.some((g) => g.status === 'revoked');
    return !hasUsableApproved && hasRevoked;
  }, [relatedGrants, hasUsableApproved]);

  /**
   * Approved status remains but paid period ended — revoke only (no device / see-others).
   */
  const isExpiredApprovedOnly = useMemo(() => {
    if (hasUsableApproved) return false;
    return relatedGrants.some((g) => g.status === 'approved' && isExpiresAtPast(g.expires_at));
  }, [relatedGrants, hasUsableApproved]);

  /**
   * True until Admin re-actives (Path B unlock allowed again; no Approved grant).
   */
  const pointUnlockBlockedByRevoke = detail?.point_unlock_blocked_by_revoke === true;

  /**
   * Open revoked row with valid paid period → Re-active this row only.
   * Any-device live: only the live Any-device row (not older Any-device, not devices).
   */
  const openGrantRestorable = useMemo(() => {
    if (!access || access.status !== 'revoked') return false;
    if (isExpiresAtPast(access.expires_at)) return false;

    const openIsAnyDevice = access.device_id === null;
    if (liveScope === 'user-device' && openIsAnyDevice) {
      return false;
    }
    if (liveScope === 'any-device' && !openIsAnyDevice) {
      return false;
    }

    /**
     * Any-device live: only the current live Any-device grant id.
     */
    if (liveScope === 'any-device' && access.id !== liveAnyDeviceGrantId) {
      return false;
    }

    /**
     * user+device live: only the live focus row for that device_id.
     */
    if (
      liveScope === 'user-device' &&
      !openIsAnyDevice &&
      access.device_id &&
      access.id !== liveDeviceFocusIdByDeviceId.get(access.device_id)
    ) {
      return false;
    }

    /**
     * Live Any-device already Approved — this revoked Any-device is history only.
     */
    if (openIsAnyDevice && hasUserOnlyApproved) {
      return false;
    }

    /**
     * Same device already usable — do not restore a duplicate device row.
     */
    if (
      !openIsAnyDevice &&
      relatedGrants.some(
        (g) => isUsableApprovedGrant(g) && g.device_id === access.device_id
      )
    ) {
      return false;
    }

    return true;
  }, [
    access,
    hasUserOnlyApproved,
    liveAnyDeviceGrantId,
    liveDeviceFocusIdByDeviceId,
    liveScope,
    relatedGrants,
  ]);

  /**
   * Open row's scope slot already has usable Approved (Any-device or same device).
   */
  const openSlotAlreadyUsable = useMemo(() => {
    if (!access) return false;
    if (access.device_id === null) return hasUserOnlyApproved;
    return relatedGrants.some(
      (g) => isUsableApprovedGrant(g) && g.device_id === access.device_id
    );
  }, [access, hasUserOnlyApproved, relatedGrants]);

  /**
   * Open row is the live focus for its scope.
   */
  const openMatchesLiveScope = useMemo(() => {
    if (!access) return false;
    if (liveScope === 'none') return true;
    if (liveScope === 'any-device') {
      return access.device_id === null && access.id === liveAnyDeviceGrantId;
    }
    if (!access.device_id) return false;
    return access.id === liveDeviceFocusIdByDeviceId.get(access.device_id);
  }, [access, liveAnyDeviceGrantId, liveDeviceFocusIdByDeviceId, liveScope]);

  const showReactivatePanel =
    openGrantRestorable ||
    (needsRestore &&
      pointUnlockBlockedByRevoke &&
      openMatchesLiveScope &&
      !openSlotAlreadyUsable);

  const busy =
    isSwitchingGrant ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    revokeMutation.isPending ||
    reactivateMutation.isPending ||
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
        showSuccess('Request approved. Approvers notified.');
        setConfirmState({ open: false, type: 'approve', targetId: null });
      } else if (confirmState.type === 'reject') {
        await rejectMutation.mutateAsync({
          id: confirmState.targetId,
          rejectReason: reason?.trim() || undefined,
        });
        showSuccess('Request rejected.');
        setConfirmState({ open: false, type: 'approve', targetId: null });
      } else if (confirmState.type === 'revoke') {
        const revokedId = confirmState.targetId;
        await revokeMutation.mutateAsync(revokedId);
        setConfirmState({ open: false, type: 'approve', targetId: null });
        showSuccess('Access revoked. Use Re-active on that Revoked row to restore (not Add devices).');
        if (revokedId !== accessId) {
          navigate(`/property-note-access-requests/${revokedId}`);
        }
      } else if (confirmState.type === 'reactivate_point_unlock') {
        const response = await reactivateMutation.mutateAsync(confirmState.targetId);
        setConfirmState({ open: false, type: 'approve', targetId: null });
        if (response.data?.already_allowed) {
          showSuccess(
            response.data.point_unlock_only
              ? 'Point unlock was already allowed.'
              : 'User already has active access.'
          );
        } else if (response.data?.restored) {
          showSuccess(
            response.data.point_unlock_only
              ? 'Status set to Approved. Paid period expired — user must unlock with points.'
              : response.data.restored_count && response.data.restored_count > 1
                ? `Access restored for ${response.data.restored_count} grants. No points charged.`
                : 'Access restored (Approved). Previous paid period still valid — no points charged.'
          );
        } else {
          showSuccess(
            'Paid period expired. Point unlock re-activated — user must unlock with points.'
          );
        }
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
        showSuccess('Changed to Any Device type.');
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

  const deviceName = resolveDeviceName(access.device_id, devicesById);
  const deviceIdFull = formatDeviceLabel(access.device_id);

  const statusHint =
    access.status === 'pending'
      ? 'Waiting for Admin approve or reject.'
      : access.status === 'admin_approved'
        ? 'Waiting for Approver. Admin cannot approve/reject/revoke here.'
        : access.status === 'approved'
          ? isExpiresAtPast(access.expires_at)
            ? 'Paid period ended. Revoke is still allowed. Device and see-others stay locked until a new usable unlock.'
            : 'Access is active. Manage devices and see-others on the right.'
          : access.status === 'revoked'
            ? openGrantRestorable
              ? `Access revoked. Re-active restores only this row #${accessId} (${deviceName}).`
              : openSlotAlreadyUsable
                ? 'History row only. Live scope already has usable Approved — Re-active stays off (avoids duplicate Any-device / device).'
              : !openMatchesLiveScope
                ? 'History row only. Live scope is different — open a matching device or Any-device row to Re-active.'
                : pointUnlockBlockedByRevoke
                  ? 'Access revoked (suspended). Re-active — paid period ended; point unlock only.'
                  : 'Access revoked. Paid period ended. Open an Approved row to Add devices, or wait for point unlock.'
            : access.status === 'rejected'
              ? 'Request was rejected.'
              : null;

  return (
    <Box sx={{ position: 'relative' }}>
      {/**
       * Fixed-height progress slot — avoids page jump when fetch starts/stops.
       */}
      <Box sx={{ height: 3, mb: 1 }}>
        {isFetching && (
          <LinearProgress sx={{ height: 3, borderRadius: 1 }} />
        )}
      </Box>
      <PageHeader
        title={access.user?.name || `Access #${accessId}`}
        subtitle="Manage access below · click a grant row to switch · Info for details"
        breadcrumbs="Dashboard / Property Note / Access List / Detail"
        actionButton={{
          text: 'Back to Access List',
          icon: <ArrowBackIcon />,
          onClick: handleBack,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pointerEvents: isSwitchingGrant ? 'none' : 'auto' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', sm: 'baseline' }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6">Manage access</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 520 }}>
              {showReactivatePanel
                ? openGrantRestorable
                  ? `Re-active restores only #${accessId} (${deviceName}) — same paid period.`
                  : 'Full suspend Re-active. Paid period ended — unlock with points only.'
                : !openMatchesLiveScope && access.status === 'revoked'
                  ? 'History row — open a matching Current-scope row to Re-active.'
                : openSlotAlreadyUsable && access.status === 'revoked'
                  ? 'History row — Current scope already has Approved access.'
                : isExpiredApprovedOnly
                  ? 'Paid period ended. Revoke still works; device manage stays locked.'
                  : 'Revoked row → Re-active. Approved row → Add devices or change scope.'}
            </Typography>
          </Stack>

          {(openGrantRestorable ||
            (needsRestore && pointUnlockBlockedByRevoke && openMatchesLiveScope) ||
            (!openMatchesLiveScope && access.status === 'revoked') ||
            (openMatchesLiveScope && openSlotAlreadyUsable && access.status === 'revoked') ||
            (needsRestore &&
              !pointUnlockBlockedByRevoke &&
              !openGrantRestorable &&
              openMatchesLiveScope) ||
            (isExpiredApprovedOnly && !needsRestore)) && (
            <Box sx={{ mb: 1.5 }}>
              {openGrantRestorable && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  Revoked · Re-active restores only #{accessId} ({deviceName}) — no points.
                </Alert>
              )}
              {!openGrantRestorable &&
                needsRestore &&
                pointUnlockBlockedByRevoke &&
                openMatchesLiveScope && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  Suspended · Re-active allows point unlock only (paid period ended).
                </Alert>
              )}
              {!openMatchesLiveScope && access.status === 'revoked' && (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  History row (current scope is{' '}
                  {liveScope === 'user-device' ? 'user+device' : 'Any-device'}). Badge / Re-active
                  stay off here.
                </Alert>
              )}
              {openMatchesLiveScope &&
                openSlotAlreadyUsable &&
                access.status === 'revoked' && (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Current scope already Approved — this older revoked row is history only.
                </Alert>
              )}
              {needsRestore &&
                !pointUnlockBlockedByRevoke &&
                !openGrantRestorable &&
                openMatchesLiveScope && (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Point unlock is allowed. Waiting for the user to unlock with points.
                </Alert>
              )}
              {isExpiredApprovedOnly && !needsRestore && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  Paid period ended. Revoke still available; manage devices after a new unlock.
                </Alert>
              )}
            </Box>
          )}

          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
              {showReactivatePanel ? (
                <>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Re-active · #{accessId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {openGrantRestorable
                      ? `Restore ${deviceName} with the same paid period. No points.`
                      : `Paid period ended for #${accessId}. Unlock with points only.`}
                  </Typography>
                  {(openGrantRestorable || pointUnlockBlockedByRevoke) ? (
                    <Button
                      variant="contained"
                      color="warning"
                      disabled={busy}
                      sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                      onClick={() =>
                        setConfirmState({
                          open: true,
                          type: 'reactivate_point_unlock',
                          targetId: accessId,
                        })
                      }
                    >
                      Re-active
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Already re-activated. If not Approved yet, user must unlock with points.
                    </Typography>
                  )}
                </>
              ) : hasUserOnlyApproved ? (
                <>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Switch to selected devices
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revokes Any-device. Only picked phones keep access. No points.
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Registered: ${registeredDevices.length}`}
                    />
                  </Stack>
                  {registeredDevices.length === 0 ? (
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                      No registered devices. User must log in from the app once.
                    </Alert>
                  ) : (
                    <>
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
                        sx={{ alignSelf: 'flex-start' }}
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
                    </>
                  )}
                </>
              ) : !hasUsableApproved ? (
                <>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Device management locked
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid period ended. User must unlock with points before devices can be managed
                    again.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Add another device
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Registered: ${registeredDevices.length}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color="success"
                      label={`Approved: ${approvedDeviceGrantCount}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={addableDevices.length > 0 ? 'primary' : 'default'}
                      label={`Available: ${addableDevices.length}`}
                    />
                  </Stack>
                  {addDeviceBlockedReason && (
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                      {addDeviceBlockedReason}
                    </Alert>
                  )}
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
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 0.25 }}
                  >
                    <Button
                      variant="contained"
                      disabled={busy || selectedDevices.length === 0}
                      onClick={() => void handleAddDevices()}
                    >
                      Add devices
                    </Button>
                    {canConvertToAny && (
                      <Button
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
                        Change to Any Device type
                      </Button>
                    )}
                  </Stack>
                </>
              )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
              <Typography variant="subtitle1" fontWeight={700}>
                See-others (map visibility)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasUsableApproved
                  ? 'Other users whose notes/pins this person may see. Not tied to a device.'
                  : 'Locked while paid period has ended. Revoke is still allowed below.'}
              </Typography>
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
                disabled={busy || !hasUsableApproved}
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
                disabled={busy || !hasUsableApproved || !hasSeeOthersChanges}
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => void handleSaveSeeOthers()}
              >
                Save see-others
              </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6">All device grants for this user</Typography>
            <Chip
              size="small"
              color={
                liveScope === 'any-device'
                  ? 'primary'
                  : liveScope === 'user-device'
                    ? 'secondary'
                    : 'default'
              }
              variant="outlined"
              label={
                liveScope === 'any-device'
                  ? 'Current scope: Any-device'
                  : liveScope === 'user-device'
                    ? 'Current scope: user+device'
                    : 'Current scope: none'
              }
            />
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Chip
              size="small"
              variant="outlined"
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    ml: 0.75,
                  }}
                />
              }
              label="Allowed"
            />
            <Chip
              size="small"
              variant="outlined"
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    ml: 0.75,
                  }}
                />
              }
              label="Re-active"
            />
            <Typography variant="caption" color="text.secondary">
              Click a row to switch · Info for grant details
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <TableContainer sx={{ maxHeight: { xs: 480, md: 640 } }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Grant</TableCell>
                  <TableCell>Device name</TableCell>
                  <TableCell>Device Id</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action By</TableCell>
                  <TableCell>Expires at</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatedGrants.map((row: PropertyNoteAccessRequest) => {
                  const isCurrent = row.id === accessId;
                  const isAllowed = isUsableApprovedGrant(row);
                  const rowIsAnyDevice = row.device_id === null;
                  /**
                   * Restorable revoked = still in paid period → Re-active target.
                   */
                  const isRestorableRevoked =
                    row.status === 'revoked' && !isExpiresAtPast(row.expires_at);
                  /**
                   * Any-device live → only the live Any-device row.
                   * user+device live → only live focus row for that device_id.
                   */
                  const deviceFocusId = row.device_id
                    ? liveDeviceFocusIdByDeviceId.get(row.device_id)
                    : undefined;
                  const matchesLiveScope =
                    liveScope === 'any-device'
                      ? row.id === liveAnyDeviceGrantId
                      : liveScope === 'user-device'
                        ? !rowIsAnyDevice && row.id === deviceFocusId
                        : isCurrent;
                  const sameSlotAlreadyUsable = rowIsAnyDevice
                    ? hasUserOnlyApproved && row.id !== liveAnyDeviceGrantId
                    : relatedGrants.some(
                        (g) =>
                          isUsableApprovedGrant(g) &&
                          g.device_id === row.device_id &&
                          g.id !== row.id
                      );
                  const showOnlineIcon =
                    matchesLiveScope &&
                    (isAllowed ||
                      ((isCurrent || isRestorableRevoked) && !sameSlotAlreadyUsable));
                  const badgeTone: 'allowed' | 'restorable' = isAllowed
                    ? 'allowed'
                    : 'restorable';
                  const badgeLabel = isAllowed
                    ? isCurrent
                      ? 'Current open + allowed (live scope)'
                      : 'Allowed grant (live scope)'
                    : isRestorableRevoked
                      ? isCurrent
                        ? 'Current open + restorable revoked'
                        : 'Restorable revoked (Re-active target)'
                      : 'Current open (live scope)';
                  /**
                   * Approve / Reject / Revoke only on live focus rows.
                   */
                  const isActionableRow =
                    liveScope === 'any-device'
                      ? row.id === liveAnyDeviceGrantId
                      : liveScope === 'user-device'
                        ? !rowIsAnyDevice && row.id === deviceFocusId
                        : true;
                  const rowName = resolveDeviceName(row.device_id, devicesById);
                  const rowIdFull = formatDeviceLabel(row.device_id);
                  return (
                    <TableRow
                      key={row.id}
                      selected={isCurrent}
                      hover
                      sx={{
                        cursor: 'pointer',
                        ...(isCurrent
                          ? {
                              borderLeft: 4,
                              borderLeftColor: showOnlineIcon
                                ? isAllowed
                                  ? 'success.main'
                                  : 'warning.main'
                                : 'divider',
                              bgcolor: 'action.selected',
                            }
                          : {
                              borderLeft: 4,
                              borderLeftColor: 'transparent',
                            }),
                      }}
                      onClick={() => {
                        if (!isCurrent) {
                          navigate(`/property-note-access-requests/${row.id}`);
                        }
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            minHeight: 28,
                          }}
                        >
                          <Typography variant="body2" sx={{ minWidth: 28 }}>
                            #{row.id}
                          </Typography>
                          <Chip
                            label="Open"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              height: 22,
                              visibility: isCurrent ? 'visible' : 'hidden',
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            minHeight: 24,
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {rowName}
                          </Typography>
                          <Box
                            sx={{
                              width: 15,
                              height: 15,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {showOnlineIcon ? (
                              <ScopeDot tone={badgeTone} label={badgeLabel} />
                            ) : null}
                          </Box>
                        </Box>
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
                        <Typography variant="body2">{formatActionBy(row)}</Typography>
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
                          const canApproveRow =
                            isActionableRow && row.status === 'pending';
                          const canRejectRow =
                            isActionableRow && row.status === 'pending';
                          const canRevokeRow =
                            isActionableRow && row.status === 'approved';
                          const historyActionTitle =
                            liveScope === 'any-device'
                              ? 'History row — only the live Any-device grant can use this action'
                              : 'History row — live scope does not match';
                          const approveTitle = !isActionableRow
                            ? historyActionTitle
                            : canApproveRow
                              ? 'Approve (send to approvers)'
                              : row.status === 'admin_approved'
                                ? 'Waiting for Approver'
                                : 'Only pending requests can be approved';
                          const rejectTitle = !isActionableRow
                            ? historyActionTitle
                            : canRejectRow
                              ? 'Reject'
                              : row.status === 'admin_approved'
                                ? 'Waiting for Approver — Admin cannot reject'
                                : 'Only pending requests can be rejected';
                          const revokeTitle = !isActionableRow
                            ? historyActionTitle
                            : canRevokeRow
                              ? 'Revoke Access (no point refund)'
                              : 'Only approved access can be revoked';

                          return (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                              <Tooltip title="Grant details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setGrantModalOpen(true);
                                    if (!isCurrent) {
                                      navigate(
                                        `/property-note-access-requests/${row.id}`
                                      );
                                    }
                                  }}
                                  aria-label="Grant details"
                                >
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
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
                  <SummaryField label="Action By">
                    <Typography variant="body1">{formatActionBy(access)}</Typography>
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
                      ? 'Approve (send to approvers)'
                      : access.status === 'admin_approved'
                        ? 'Waiting for Approver'
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
                        ? 'Waiting for Approver — Admin cannot reject'
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
                  ? 'Change to Any Device type?'
                  : confirmState.type === 'reactivate_point_unlock'
                    ? 'Re-active?'
                    : 'Revoke Property Note access?'
        }
        message={
          confirmState.type === 'approve'
            ? 'Approve this unlock request? Approvers will be notified.'
            : confirmState.type === 'reject'
              ? 'Reject this unlock request?'
              : confirmState.type === 'switch_devices'
                ? `Revoke Any-device and grant only ${selectedDevices.length} selected device(s)? Unselected phones lose access. Points are not charged.`
                : confirmState.type === 'convert_any'
                  ? 'Change to Any Device type? Device-specific grants will be revoked. All phones unlock. Points are not charged.'
                  : confirmState.type === 'reactivate_point_unlock'
                    ? 'Re-active this revoked row only? Restores Approved if paid period is still valid (no points). Other Approved devices stay unchanged. If expired and fully suspended, allow point unlock only.'
                    : 'Revoke this approved access? Points are not refunded. Login stays active. See-others is kept for Re-active.'
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
                  ? 'Change to Any Device type'
                  : confirmState.type === 'reactivate_point_unlock'
                    ? 'Re-active'
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
