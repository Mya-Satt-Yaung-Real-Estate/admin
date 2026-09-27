import React, { useCallback, useEffect, useMemo } from 'react';
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
  Add as AddIcon,
  Cancel as RejectIcon,
  CheckCircle as ApproveIcon,
  HourglassEmpty as PendingIcon,
  Person as PersonIcon,
  VerifiedUser as ApprovedIcon,
  Block as RevokeIcon,
  Devices as DevicesIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import {
  ActionAlert,
  PageEmptyState,
  PageErrorState,
  PageLoadingState,
  StatusChip,
} from '../../components/ui';
import { useAlertSystem, useDebouncedValue, useFilters, usePagination } from '../../hooks';
import { usePropertyNoteAccessRequests } from '../../services/queries/propertyNoteAccessRequests';
import { FilterState } from '../../constants/filters';
import type {
  PropertyNoteAccessStatus,
  PropertyNoteAccessUserSummary,
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

/**
 * Short summary of grant counts for list/mobile.
 */
const formatGrantsSummary = (row: PropertyNoteAccessUserSummary): string => {
  const parts: string[] = [`${row.grants_count} grant${row.grants_count === 1 ? '' : 's'}`];
  if (row.counts.approved > 0) {
    parts.push(`${row.counts.approved} active`);
  }
  if (row.counts.pending > 0) {
    parts.push(`${row.counts.pending} pending`);
  }
  if (row.counts.admin_approved > 0) {
    parts.push(`${row.counts.admin_approved} awaiting approver`);
  }
  return parts.join(' · ');
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
      { value: 'revoked', label: 'Revoked' },
    ],
  },
];

const PropertyNoteAccessRequestListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { alert, clearAlert } = useAlertSystem();

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
  const users = data?.data ?? [];
  const statistics = data?.statistics;
  const totalCount = data?.pagination?.total ?? users.length;
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
      {
        title: 'Revoked',
        value: statistics?.revoked ?? 0,
        color: 'secondary',
        icon: <RevokeIcon />,
      },
    ],
    [statistics]
  );

  const openDetail = useCallback(
    (row: PropertyNoteAccessUserSummary) => {
      if (row.detail_access_id > 0) {
        navigate(`/property-note-access-requests/${row.detail_access_id}`);
      }
    },
    [navigate]
  );

  const columns: TableColumn<PropertyNoteAccessUserSummary>[] = useMemo(
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
        id: 'scope',
        label: 'Scope',
        render: (_value, row) => (
          <Typography variant="body2" color={row?.has_any_device ? 'text.secondary' : 'text.primary'}>
            {row?.scope_label || '—'}
          </Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'grants',
        label: 'Grants',
        render: (_value, row) => {
          if (!row) return null;
          return (
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: 600 }}
            >
              {formatGrantsSummary(row)}
            </Typography>
          );
        },
        hidden: isMobile,
      },
      {
        id: 'status',
        label: 'Status',
        render: (_value, row) => {
          if (!row) return null;
          return <StatusChip status={row.primary_status} size="small" />;
        },
      },
      {
        id: 'last_requested_at',
        label: 'Last requested',
        render: (_value, row) => (
          <Typography variant="body2">{row?.last_requested_at || '—'}</Typography>
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
        id: 'approved_by',
        label: 'Approved By',
        render: (_value, row) => (
          <Typography variant="body2">{row?.approved_by?.label || '—'}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_value, row) => {
          if (!row) return null;
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="View detail — approve / reject / revoke there">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => openDetail(row)}
                  disabled={row.detail_access_id < 1}
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [isMobile, openDetail]
  );

  const createMobileActions = (row: PropertyNoteAccessUserSummary): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View detail',
      color: 'primary' as const,
      onClick: () => openDetail(row),
      disabled: row.detail_access_id < 1,
    },
  ];

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
        subtitle="One row per user — open detail to approve, reject, or revoke grants"
        actionButton={{
          text: 'Add',
          icon: <AddIcon />,
          onClick: () => navigate('/property-note-access-requests/grant'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <StatisticsCards cards={statsCards} columns={{ xs: 12, sm: 6, md: 4, lg: 2 }} />

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

      {users.length === 0 && (
        <PageEmptyState
          title="No access users"
          message={
            filters.searchTerm || filters.statusFilter !== 'all'
              ? 'Try changing filters.'
              : 'No Property Note unlock requests yet.'
          }
        />
      )}

      {isMobile && users.length > 0 ? (
        <Box>
          {users.map((row) => (
            <MobileCard
              key={row.user_id}
              title={row.user?.name || `User #${row.user_id}`}
              subtitle={row.user?.phone || row.user?.email || '—'}
              description={
                isExpiresAtPast(row.expires_at)
                  ? `${row.scope_label} · ${formatGrantsSummary(row)} · ${row.approved_by?.label || '—'} · Expires: ${row.expires_at} (expired)`
                  : `${row.scope_label} · ${formatGrantsSummary(row)} · ${row.approved_by?.label || '—'} · Expires: ${row.expires_at || '—'}`
              }
              avatar={row.has_any_device || row.approved_device_count === 0 ? <PersonIcon /> : <DevicesIcon />}
              status={{
                label: row.primary_status.replace('_', ' '),
                color:
                  row.primary_status === 'pending'
                    ? ('warning' as const)
                    : row.primary_status === 'approved'
                      ? ('success' as const)
                      : row.primary_status === 'rejected' || row.primary_status === 'revoked'
                        ? ('error' as const)
                        : ('info' as const),
              }}
              actions={createMobileActions(row)}
            />
          ))}
        </Box>
      ) : (
        users.length > 0 && (
          <StandardTable
            columns={columns}
            data={users}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(row) => row.user_id}
          />
        )
      )}
    </Box>
  );
};

export default PropertyNoteAccessRequestListPage;
