import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Map as MapIcon,
  Person as PersonIcon,
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
  ConfirmationDialog,
  PageEmptyState,
  PageErrorState,
  PageLoadingState,
  Pagination,
  StatusChip,
} from '../../components/ui';
import { useAlertSystem, useFilters, usePagination } from '../../hooks';
import { useUpdateMapPinsAccess, useUsers } from '../../services/queries/users';
import { FilterState } from '../../constants/filters';
import { RegularUser, getRegularUserDisplayName } from '../../types/user';

interface MapAccessFilters extends FilterState {
  searchTerm: string;
  mapAccessFilter: string;
  userTypeFilter: string;
}

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name or phone...',
    minWidth: { xs: 220, sm: 280 },
    maxWidth: { sm: 320 },
    flexGrow: 0,
    width: { xs: '100%', sm: 280 },
  },
  {
    key: 'mapAccessFilter',
    type: 'select',
    label: 'Map access',
    options: [
      { value: 'all', label: 'All' },
      { value: 'enabled', label: 'Enabled' },
      { value: 'disabled', label: 'Disabled' },
    ],
  },
  {
    key: 'userTypeFilter',
    type: 'select',
    label: 'User Type',
    options: [
      { value: 'all', label: 'All Types' },
      { value: 'individual', label: 'Individual' },
      { value: 'company', label: 'Company' },
    ],
  },
];

const matchesMapAccess = (user: RegularUser, filterValue: string) => {
  if (filterValue === 'all') return true;
  const isEnabled = Boolean(user.map_pins_access);
  return filterValue === 'enabled' ? isEnabled : !isEnabled;
};

const MapAccessUserListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const updateMapAccess = useUpdateMapPinsAccess();

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    user: RegularUser | null;
    nextValue: boolean;
  }>({ open: false, user: null, nextValue: false });

  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination();

  const { filters, setFilter, resetFilters } = useFilters<MapAccessFilters>({
    searchTerm: '',
    mapAccessFilter: 'all',
    userTypeFilter: 'all',
  });

  const { data: usersResponse, isLoading, error } = useUsers({
    per_page: 100,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const users: RegularUser[] = usersResponse?.data || [];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTerm = (filters.searchTerm ?? '').toLowerCase();
      const displayName = getRegularUserDisplayName(user).toLowerCase();
      const userName = (user.name ?? '').toLowerCase();
      const companyName = (user.company_profile?.company_name ?? '').toLowerCase();
      const userPhone = (user.phone ?? '').toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        displayName.includes(searchTerm) ||
        userName.includes(searchTerm) ||
        companyName.includes(searchTerm) ||
        userPhone.includes(searchTerm);

      const matchesUserType =
        filters.userTypeFilter === 'all' || user.user_type === filters.userTypeFilter;

      return matchesSearch && matchesUserType && matchesMapAccess(user, filters.mapAccessFilter);
    });
  }, [users, filters]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const statsCards: StatCard[] = useMemo(
    () => [
      {
        title: 'Total Users',
        value: users.length,
        color: 'primary',
        icon: <PersonIcon />,
      },
      {
        title: 'Map Enabled',
        value: users.filter((user) => Boolean(user.map_pins_access)).length,
        color: 'success',
        icon: <MapIcon />,
      },
      {
        title: 'Map Disabled',
        value: users.filter((user) => !user.map_pins_access).length,
        color: 'error',
        icon: <MapIcon />,
      },
    ],
    [users]
  );

  const applyMapAccess = useCallback(
    async (user: RegularUser, nextValue: boolean) => {
      try {
        await updateMapAccess.mutateAsync({
          slug: user.slug,
          mapPinsAccess: nextValue,
        });
        showSuccess(
          nextValue
            ? `Map access enabled for ${getRegularUserDisplayName(user)}.`
            : `Map access disabled for ${getRegularUserDisplayName(user)}.`
        );
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
            ? err.message
            : 'Failed to update map access.';
        showError(message);
      }
    },
    [showError, showSuccess, updateMapAccess]
  );

  const handleToggleRequest = useCallback(
    (user: RegularUser, nextValue: boolean) => {
      if (!nextValue) {
        setConfirmState({ open: true, user, nextValue });
        return;
      }
      void applyMapAccess(user, nextValue);
    },
    [applyMapAccess]
  );

  const columns: TableColumn<RegularUser>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        render: (_value, user) => {
          if (!user) return <Typography variant="body2">No data</Typography>;
          return (
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {getRegularUserDisplayName(user)}
              </Typography>
              {user.user_type === 'company' && user.company_profile?.company_name && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {user.company_profile.company_name}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        id: 'phone',
        label: 'Phone',
        render: (_value, user) => (
          <Typography variant="body2">{user?.phone || '—'}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'userType',
        label: 'Type',
        render: (_value, user) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {user?.user_type || '—'}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        render: (_value, user) => {
          if (!user) return <Typography variant="body2">No data</Typography>;
          return <StatusChip status={user.is_active ? 'active' : 'inactive'} size="small" />;
        },
      },
      {
        id: 'mapAccess',
        label: 'Map Access',
        render: (_value, user) => {
          if (!user) return <Typography variant="body2">No data</Typography>;
          const isEnabled = Boolean(user.map_pins_access);
          const isUpdating =
            updateMapAccess.isPending && updateMapAccess.variables?.slug === user.slug;
          return (
            <Tooltip title={isEnabled ? 'Disable map access' : 'Enable map access'}>
              <Switch
                checked={isEnabled}
                disabled={isUpdating}
                onChange={(_, checked) => handleToggleRequest(user, checked)}
                color="primary"
                inputProps={{
                  'aria-label': `Toggle map access for ${getRegularUserDisplayName(user)}`,
                }}
              />
            </Tooltip>
          );
        },
      },
      {
        id: 'actions',
        label: 'Action',
        align: 'center',
        render: (_value, user) => {
          if (!user) return null;
          return (
            <Tooltip title="View user">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/users/${user.slug}`)}
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
          );
        },
      },
    ],
    [handleToggleRequest, isMobile, navigate, updateMapAccess.isPending, updateMapAccess.variables?.slug]
  );

  const createMobileCardActions = (user: RegularUser): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      color: 'primary' as const,
      onClick: () => navigate(`/users/${user.slug}`),
    },
  ];

  if (isLoading) {
    return <PageLoadingState title="Loading Map Access Users" />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Map Access Users"
        message={error instanceof Error ? error.message : 'Failed to load users.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Map Access Users"
        breadcrumbs="Dashboard / User / Map Access Users"
        subtitle="Enable or disable map pins access for users"
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <StatisticsCards cards={statsCards} columns={{ xs: 12, sm: 4, md: 4, lg: 4 }} />

      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof MapAccessFilters, value)}
        fields={FILTER_FIELDS}
        showClearButton
        onClearFilters={resetFilters}
      />

      {filteredUsers.length === 0 && (
        <PageEmptyState
          title="No users found"
          message={
            filters.searchTerm || filters.mapAccessFilter !== 'all' || filters.userTypeFilter !== 'all'
              ? 'Try changing filters.'
              : 'No users available.'
          }
        />
      )}

      {isMobile && filteredUsers.length > 0 ? (
        <Box>
          {paginatedUsers.map((user) => {
            const isEnabled = Boolean(user.map_pins_access);
            const isUpdating =
              updateMapAccess.isPending && updateMapAccess.variables?.slug === user.slug;
            return (
              <MobileCard
                key={user.id}
                title={getRegularUserDisplayName(user)}
                subtitle={user.phone || '—'}
                description={`${user.user_type === 'company' ? 'Company' : 'Individual'}`}
                avatar={<PersonIcon />}
                status={{
                  label: user.is_active ? 'Active' : 'Inactive',
                  color: user.is_active ? ('success' as const) : ('error' as const),
                }}
                chips={[
                  {
                    label: isEnabled ? 'Map: Enabled' : 'Map: Disabled',
                    color: isEnabled ? ('success' as const) : ('error' as const),
                  },
                ]}
                actions={createMobileCardActions(user)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 1,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Typography variant="body2">Map Access</Typography>
                  <Switch
                    checked={isEnabled}
                    disabled={isUpdating}
                    onChange={(_, checked) => handleToggleRequest(user, checked)}
                    color="primary"
                  />
                </Box>
              </MobileCard>
            );
          })}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredUsers.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo
          />
        </Box>
      ) : (
        filteredUsers.length > 0 && (
          <StandardTable
            columns={columns}
            data={paginatedUsers}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredUsers.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(user) => user.id}
          />
        )
      )}

      <ConfirmationDialog
        open={confirmState.open}
        onClose={() => setConfirmState({ open: false, user: null, nextValue: false })}
        onConfirm={() => {
          if (confirmState.user) {
            void applyMapAccess(confirmState.user, confirmState.nextValue);
          }
          setConfirmState({ open: false, user: null, nextValue: false });
        }}
        title="Disable map access?"
        message={
          confirmState.user
            ? `Disable map pins access for ${getRegularUserDisplayName(confirmState.user)}?`
            : 'Disable map pins access for this user?'
        }
        action="custom"
        actionLabel="Disable"
        actionColor="warning"
        isLoading={updateMapAccess.isPending}
      />
    </Box>
  );
};

export default MapAccessUserListPage;
