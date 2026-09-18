import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Cancel as RejectIcon,
  CheckCircle as ApproveIcon,
  HourglassEmpty as PendingIcon,
  Person as PersonIcon,
  VerifiedUser as ApprovedIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import {
  ActionAlert,
  ConfirmationDialog,
  PageEmptyState,
  PageErrorState,
  PageLoadingState,
  StatusChip,
} from '../../components/ui';
import { useAlertSystem, useDebouncedValue, useFilters, usePagination } from '../../hooks';
import {
  useApprovePropertyNoteAccessRequest,
  usePropertyNoteAccessRequests,
  useRejectPropertyNoteAccessRequest,
} from '../../services/queries/propertyNoteAccessRequests';
import { FilterState } from '../../constants/filters';
import type {
  PropertyNoteAccessRequest,
  PropertyNoteAccessStatus,
} from '../../types/propertyNoteAccess';

interface AccessRequestFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

/** Wait after typing before searching — avoids an API call per keystroke. */
const SEARCH_DEBOUNCE_MS = 400;

/**
 * True when expires_at is set and already in the past.
 */
const isExpiresAtPast = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false;
  const parsed = new Date(expiresAt.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
};

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name, phone, or email...',
    minWidth: { xs: 220, sm: 280 },
    maxWidth: { sm: 320 },
    flexGrow: 0,
    width: { xs: '100%', sm: 280 },
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'admin_approved', label: 'Admin Approved' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
  },
];

const PropertyNoteAccessRequestListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const approveMutation = useApprovePropertyNoteAccessRequest();
  const rejectMutation = useRejectPropertyNoteAccessRequest();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: 'approve' | 'reject';
    request: PropertyNoteAccessRequest | null;
  }>({ open: false, type: 'approve', request: null });

  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination();

  const { filters, setFilter, resetFilters } = useFilters<AccessRequestFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });

  /**
   * Input updates live; API uses this value only after idle SEARCH_DEBOUNCE_MS.
   */
  const debouncedSearch = useDebouncedValue(filters.searchTerm.trim(), SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    handleChangePage(null, 0);
  }, [debouncedSearch, filters.statusFilter, handleChangePage]);

  const listParams = useMemo(
    () => ({
      page: page + 1,
      per_page: rowsPerPage,
      search: debouncedSearch || undefined,
      status:
        filters.statusFilter !== 'all'
          ? (filters.statusFilter as PropertyNoteAccessStatus)
          : undefined,
    }),
    [page, rowsPerPage, debouncedSearch, filters.statusFilter]
  );

  const { data, isLoading, isFetching, error, refetch } = usePropertyNoteAccessRequests(listParams);
  const requests = data?.data ?? [];
  const statistics = data?.statistics;
  const totalCount = data?.pagination?.total ?? requests.length;
  /**
   * Full-page loader only on first visit. Search/filter shows LinearProgress only.
   */
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isFetching && !isInitialLoading;

  const statsCards: StatCard[] = useMemo(
    () => [
      {
        title: 'Total',
        value: statistics?.total ?? 0,
        color: 'primary',
        icon: <PersonIcon />,
      },
      {
        title: 'Pending',
        value: statistics?.pending ?? 0,
        color: 'warning',
        icon: <PendingIcon />,
      },
      {
        title: 'Admin Approved',
        value: statistics?.admin_approved ?? 0,
        color: 'info',
        icon: <ApproveIcon />,
      },
      {
        title: 'Approved',
        value: statistics?.approved ?? 0,
        color: 'success',
        icon: <ApprovedIcon />,
      },
      {
        title: 'Rejected',
        value: statistics?.rejected ?? 0,
        color: 'error',
        icon: <RejectIcon />,
      },
    ],
    [statistics]
  );

  const handleApproveClick = useCallback((request: PropertyNoteAccessRequest) => {
    setConfirmState({ open: true, type: 'approve', request });
  }, []);

  const handleRejectClick = useCallback((request: PropertyNoteAccessRequest) => {
    setConfirmState({ open: true, type: 'reject', request });
  }, []);

  const handleConfirmClose = useCallback(() => {
    setConfirmState({ open: false, type: 'approve', request: null });
  }, []);

  const handleConfirm = useCallback(
    async (reason?: string) => {
      if (!confirmState.request) return;

      try {
        if (confirmState.type === 'approve') {
          await approveMutation.mutateAsync(confirmState.request.id);
          showSuccess('Request approved. Mobile approvers notified.');
        } else {
          await rejectMutation.mutateAsync({
            id: confirmState.request.id,
            rejectReason: reason?.trim() || undefined,
          });
          showSuccess('Request rejected.');
        }
        handleConfirmClose();
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
            ? err.message
            : `Failed to ${confirmState.type} request.`;
        showError(message);
      }
    },
    [
      approveMutation,
      confirmState.request,
      confirmState.type,
      handleConfirmClose,
      rejectMutation,
      showError,
      showSuccess,
    ]
  );

  const columns: TableColumn<PropertyNoteAccessRequest>[] = useMemo(
    () => [
      {
        id: 'user',
        label: 'User',
        render: (_value, row) => {
          if (!row?.user) return <Typography variant="body2">—</Typography>;
          return (
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {row.user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {row.user.phone || row.user.email || '—'}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'points',
        label: 'Points',
        render: (_value, row) => (
          <Typography variant="body2">{row?.points_amount ?? 0}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'status',
        label: 'Status',
        render: (_value, row) => {
          if (!row) return null;
          return <StatusChip status={row.status} size="small" />;
        },
      },
      {
        id: 'created_at',
        label: 'Requested',
        render: (_value, row) => (
          <Typography variant="body2">{row?.created_at || '—'}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'admin_approved_at',
        label: 'Admin At',
        render: (_value, row) => (
          <Typography variant="body2">{row?.admin_approved_at || '—'}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'approved_at',
        label: 'Approver At',
        render: (_value, row) => (
          <Typography variant="body2">{row?.approved_at || '—'}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'expires_at',
        label: 'Expires At',
        render: (_value, row) => {
          const expiresAt = row?.expires_at;
          if (!expiresAt) {
            return <Typography variant="body2">—</Typography>;
          }
          const expired = isExpiresAtPast(expiresAt);
          return (
            <Typography
              variant="body2"
              sx={expired ? { color: 'error.main', fontWeight: 600 } : undefined}
            >
              {expiresAt}
            </Typography>
          );
        },
        hidden: isMobile,
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_value, row) => {
          if (!row) return null;
          const canAct = row.status === 'pending';
          const busy = approveMutation.isPending || rejectMutation.isPending;
          const approveTitle = canAct
            ? 'Approve (send to mobile approvers)'
            : row.status === 'admin_approved'
              ? 'Waiting for mobile Approver'
              : 'Only pending requests can be approved';
          const rejectTitle = canAct
            ? 'Reject'
            : row.status === 'admin_approved'
              ? 'Waiting for mobile Approver — Admin cannot reject'
              : 'Only pending requests can be rejected';

          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              <Tooltip title={approveTitle}>
                <span>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleApproveClick(row)}
                    disabled={!canAct || busy}
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
                    onClick={() => handleRejectClick(row)}
                    disabled={!canAct || busy}
                  >
                    <RejectIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [
      approveMutation.isPending,
      handleApproveClick,
      handleRejectClick,
      isMobile,
      rejectMutation.isPending,
    ]
  );

  const createMobileActions = (request: PropertyNoteAccessRequest): MobileCardAction[] => {
    const canAct = request.status === 'pending';
    const waitingApprover = request.status === 'admin_approved';

    return [
      {
        icon: <ApproveIcon />,
        tooltip: canAct
          ? 'Approve'
          : waitingApprover
            ? 'Waiting for mobile Approver'
            : 'Only pending requests can be approved',
        color: 'success' as const,
        onClick: () => {
          if (canAct) {
            handleApproveClick(request);
          }
        },
        disabled: !canAct,
      },
      {
        icon: <RejectIcon />,
        tooltip: canAct
          ? 'Reject'
          : waitingApprover
            ? 'Waiting for mobile Approver — Admin cannot reject'
            : 'Only pending requests can be rejected',
        color: 'error' as const,
        onClick: () => {
          if (canAct) {
            handleRejectClick(request);
          }
        },
        disabled: !canAct,
      },
    ];
  };

  if (isInitialLoading) {
    return <PageLoadingState title="Loading Access Requests" />;
  }

  if (error && !data) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Access Requests"
        message={error instanceof Error ? error.message : 'Failed to load access requests.'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Access Requests"
        breadcrumbs="Dashboard / Property Note / Access Requests"
        subtitle="Approve or reject Property Note unlock requests (admin step)"
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <StatisticsCards cards={statsCards} columns={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} />

      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof AccessRequestFilters, value)}
        fields={FILTER_FIELDS}
        showClearButton
        onClearFilters={resetFilters}
      />

      {/**
       * Fixed-height slot so LinearProgress does not push the table (no layout shake).
       */}
      <Box sx={{ height: 4, mb: 1 }}>
        {isRefreshing ? <LinearProgress sx={{ height: 4, borderRadius: 1 }} /> : null}
      </Box>

      {requests.length === 0 && (
        <PageEmptyState
          title="No access requests"
          message={
            filters.searchTerm || filters.statusFilter !== 'all'
              ? 'Try changing filters.'
              : 'No Property Note unlock requests yet.'
          }
        />
      )}

      {isMobile && requests.length > 0 ? (
        <Box>
          {requests.map((request) => (
            <MobileCard
              key={request.id}
              title={request.user?.name || `Request #${request.id}`}
              subtitle={request.user?.phone || request.user?.email || '—'}
              description={
                isExpiresAtPast(request.expires_at)
                  ? `Points: ${request.points_amount} · Expires: ${request.expires_at} (expired)`
                  : `Points: ${request.points_amount} · Expires: ${request.expires_at || '—'}`
              }
              avatar={<PersonIcon />}
              status={{
                label: request.status.replace('_', ' '),
                color:
                  request.status === 'pending'
                    ? ('warning' as const)
                    : request.status === 'approved'
                      ? ('success' as const)
                      : request.status === 'rejected'
                        ? ('error' as const)
                        : ('info' as const),
              }}
              actions={createMobileActions(request)}
            />
          ))}
        </Box>
      ) : (
        requests.length > 0 && (
          <StandardTable
            columns={columns}
            data={requests}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(row) => row.id}
          />
        )
      )}

      <ConfirmationDialog
        open={confirmState.open}
        onClose={handleConfirmClose}
        onConfirm={handleConfirm}
        title={
          confirmState.type === 'approve'
            ? 'Approve access request?'
            : 'Reject access request?'
        }
        message={
          confirmState.request?.user
            ? confirmState.type === 'approve'
              ? `Approve unlock for ${confirmState.request.user.name}? Mobile approvers will be notified.`
              : `Reject unlock for ${confirmState.request.user.name}?`
            : confirmState.type === 'approve'
              ? 'Approve this unlock request?'
              : 'Reject this unlock request?'
        }
        action={confirmState.type === 'approve' ? 'approve' : 'reject'}
        actionLabel={confirmState.type === 'approve' ? 'Approve' : 'Reject'}
        actionColor={confirmState.type === 'approve' ? 'success' : 'error'}
        requireReason={false}
        reasonLabel="Reject reason (optional)"
        reasonPlaceholder="Reason shown to the user..."
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
    </Box>
  );
};

export default PropertyNoteAccessRequestListPage;
