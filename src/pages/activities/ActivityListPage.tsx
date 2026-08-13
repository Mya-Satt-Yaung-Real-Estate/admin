import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  EventNote as ActivityIcon,
  Home as HomeIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import {
  ActionAlert,
  ConfirmationDialog,
  DeleteConfirmationDialog,
  PageEmptyState,
  PageErrorState,
  PageLoadingState,
  StatusChip,
} from '../../components/ui';
import { useAlertSystem, useDeleteConfirmation, useFilters, useManualSearch, usePagination } from '../../hooks';
import {
  useActivities,
  useActivityStatistics,
  useDeleteActivity,
  useRestoreActivity,
} from '../../services/queries/activities';
import { useUsers } from '../../services/queries/users';
import { FilterState } from '../../constants/filters';
import { formatDate } from '../../constants/dateFormats';
import { getUserSelectLabel } from '../../types/user';
import type { Activity } from '../../types/activity';

interface ActivityFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  homepageFilter: string;
  userFilter: string;
}

const PAGE_CONFIG = {
  title: 'Activity Management',
  description: 'Manage activity posts',
  createButtonText: 'Add Activity',
  createButtonPath: '/activities/create',
} as const;


const getOwnerName = (activity: Activity): string => {
  if (activity.user?.user_type === 'admin') return 'Platform';
  if (activity.user?.company_name) return activity.user.company_name;
  if (activity.user?.name) return activity.user.name;
  return 'Unknown';
};

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');

  const [userSearchTerm, setUserSearchTerm] = useState('');

  const { filters, setFilter } = useFilters<ActivityFilters>({
    searchTerm: '',
    statusFilter: 'all',
    homepageFilter: 'all',
    userFilter: '',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const [activeTab, setActiveTab] = useState(0);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [activityToRestore, setActivityToRestore] = useState<Activity | null>(null);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      per_page: rowsPerPage,
      search: searchTerm || undefined,
      status: filters.statusFilter !== 'all' ? (filters.statusFilter as 'draft' | 'published') : undefined,
      user_id: filters.userFilter ? Number(filters.userFilter) : undefined,
      show_on_homepage:
        filters.homepageFilter === 'yes' ? true : filters.homepageFilter === 'no' ? false : undefined,
      only_trashed: activeTab === 1 ? true : undefined,
      sort_by: 'created_at' as const,
      sort_direction: 'desc' as const,
    }),
    [page, rowsPerPage, searchTerm, filters.statusFilter, filters.homepageFilter, filters.userFilter, activeTab]
  );

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    page: 1,
    per_page: 20,
    search: userSearchTerm || undefined,
    sort_by: 'name',
    sort_direction: 'asc',
  });

  const { data: activitiesResponse, isLoading, error, refetch } = useActivities(queryParams);
  const { data: statisticsResponse } = useActivityStatistics();
  const deleteActivityMutation = useDeleteActivity();
  const restoreActivityMutation = useRestoreActivity();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      const nextSearch = new URLSearchParams(location.search);
      nextSearch.delete('success');
      navigate(`${location.pathname}${nextSearch.toString() ? `?${nextSearch.toString()}` : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  const activities = Array.isArray(activitiesResponse?.data) ? activitiesResponse.data : [];
  const pagination = activitiesResponse?.pagination;
  const stats = statisticsResponse?.data;

  const userOptions = useMemo(() => {
    return (usersResponse?.data || []).map((user) => ({
      value: String(user.id),
      label: getUserSelectLabel(user),
    }));
  }, [usersResponse]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: 'searchTerm',
        type: 'search',
        label: 'Search',
        placeholder: 'Search by title or description...',
      },
      {
        key: 'userFilter',
        type: 'autocomplete',
        label: 'User',
        placeholder: 'Search user...',
        options: userOptions,
        loading: usersLoading,
        noOptionsText: userSearchTerm ? 'No users found' : 'Type to search users',
        onInputChange: setUserSearchTerm,
        width: { xs: '100%', sm: 300 },
      },
      {
        key: 'statusFilter',
        type: 'select',
        label: 'Status',
        options: [
          { value: 'all', label: 'All Statuses' },
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Draft' },
        ],
      },
      {
        key: 'homepageFilter',
        type: 'select',
        label: 'Homepage',
        options: [
          { value: 'all', label: 'All' },
          { value: 'yes', label: 'On Homepage' },
          { value: 'no', label: 'Not on Homepage' },
        ],
      },
    ],
    [userOptions, usersLoading, userSearchTerm]
  );

  const statsCards: StatCard[] = useMemo(
    () => [
      { title: 'Total', value: stats?.total ?? 0, color: 'primary', icon: <ActivityIcon /> },
      { title: 'Published', value: stats?.published ?? 0, color: 'success', icon: <ActivityIcon /> },
      { title: 'Draft', value: stats?.draft ?? 0, color: 'warning', icon: <ActivityIcon /> },
      { title: 'On Homepage', value: stats?.show_on_homepage ?? 0, color: 'info', icon: <HomeIcon /> },
    ],
    [stats]
  );

  const handleView = (activity: Activity) => navigate(`/activities/${activity.slug}`);
  const handleEdit = (activity: Activity) => navigate(`/activities/${activity.slug}/edit`);
  const handleCreate = () => navigate(PAGE_CONFIG.createButtonPath);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      handleInputChange(value);
      return;
    }
    setFilter(key as keyof ActivityFilters, value);
    handleChangePage(null, 0);
  };

  const handleClearFilters = () => {
    clearSearch();
    setUserSearchTerm('');
    setFilter('statusFilter', 'all');
    setFilter('homepageFilter', 'all');
    setFilter('userFilter', '');
    handleChangePage(null, 0);
  };

  const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
    setActiveTab(value);
    handleChangePage(null, 0);
  };

  const handleDelete = (activity: Activity) => {
    openDeleteConfirmation(activity.title, 'activity', async () => {
      try {
        await deleteActivityMutation.mutateAsync(activity.slug);
        showSuccess(`${activity.title} deleted successfully!`, true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to delete activity.';
        showError(message, true);
      }
    });
  };

  const handleRestore = (activity: Activity) => {
    setActivityToRestore(activity);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!activityToRestore) return;
    try {
      await restoreActivityMutation.mutateAsync(activityToRestore.slug);
      showSuccess(`${activityToRestore.title} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      setActivityToRestore(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to restore activity.';
      showError(message, true);
    }
  };

  const columns: TableColumn<Activity>[] = useMemo(
    () => [
      {
        id: 'title',
        label: 'Title',
        render: (_value, activity) => (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {activity.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activity.description ? `${activity.description.slice(0, 80)}${activity.description.length > 80 ? '…' : ''}` : '—'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'owner',
        label: 'Owner',
        render: (_value, activity) => (
          <Box>
            <Typography variant="body2">{getOwnerName(activity)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {activity.user?.user_type === 'admin' ? 'platform' : (activity.user?.user_type || '')}
            </Typography>
          </Box>
        ),
        hidden: isMobile,
      },
      {
        id: 'status',
        label: 'Status',
        render: (_value, activity) => <StatusChip status={activity.status} />,
      },
      {
        id: 'homepage',
        label: 'Homepage',
        render: (_value, activity) =>
          activity.show_on_homepage ? (
            <Chip icon={<HomeIcon sx={{ fontSize: 14 }} />} label="Home" size="small" />
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          ),
        hidden: isMobile,
      },
      {
        id: 'publishedAt',
        label: 'Published',
        render: (_value, activity) => (
          <Typography variant="body2" color="text.secondary">
            {activity.published_at ? formatDate(activity.published_at, 'display') : '—'}
          </Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'createdAt',
        label: 'Created',
        render: (_value, activity) => (
          <Typography variant="body2" color="text.secondary">
            {activity.created_at ? formatDate(activity.created_at, 'display') : '—'}
          </Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_value, activity) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View">
              <IconButton size="small" color="primary" onClick={() => handleView(activity)}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
            {!activity.is_deleted ? (
              <>
                <Tooltip title="Edit">
                  <IconButton size="small" color="secondary" onClick={() => handleEdit(activity)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(activity)}
                    disabled={deleteActivityMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton size="small" color="success" onClick={() => handleRestore(activity)}>
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [isMobile, deleteActivityMutation.isPending]
  );

  const getMobileCardActions = (activity: Activity): MobileCardAction[] => {
    const actions: MobileCardAction[] = [
      { tooltip: 'View', icon: <ViewIcon />, onClick: () => handleView(activity), color: 'primary' },
    ];

    if (!activity.is_deleted) {
      actions.push(
        { tooltip: 'Edit', icon: <EditIcon />, onClick: () => handleEdit(activity), color: 'secondary' },
        { tooltip: 'Delete', icon: <DeleteIcon />, onClick: () => handleDelete(activity), color: 'error' }
      );
    } else {
      actions.push({
        tooltip: 'Restore',
        icon: <RestoreIcon />,
        onClick: () => handleRestore(activity),
        color: 'success',
      });
    }

    return actions;
  };

  if (isLoading && activities.length === 0) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={() => refetch()} />;

  return (
    <Box>
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs="Dashboard / Activities"
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleCreate,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />
      <StatisticsCards cards={statsCards} />

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label={`Active (${stats?.total ?? 0})`} />
        <Tab label={`Deleted (${stats?.deleted ?? 0})`} />
      </Tabs>

      <StandardFilters
        filters={{ ...filters, searchTerm: searchValue }}
        fields={filterFields}
        onFilterChange={handleFilterChange}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={() => {
          triggerSearch();
          handleChangePage(null, 0);
        }}
        showSearchButton
        onClearFilters={handleClearFilters}
        showClearButton
      />

      {activities.length === 0 ? (
        <PageEmptyState
          title="No activities found"
          message="Try adjusting your filters or create a new activity."
          actionButton={
            activeTab === 0
              ? {
                  text: PAGE_CONFIG.createButtonText,
                  onClick: handleCreate,
                }
              : undefined
          }
        />
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activities.map((activity) => (
            <MobileCard
              key={activity.id}
              title={activity.title}
              subtitle={getOwnerName(activity)}
              description={activity.status}
              actions={getMobileCardActions(activity)}
              onClick={() => handleView(activity)}
              clickable
              chips={[
                { label: activity.status, color: activity.status === 'published' ? 'success' : 'warning' },
                ...(activity.show_on_homepage ? [{ label: 'Homepage', color: 'info' as const }] : []),
              ]}
            />
          ))}
        </Box>
      ) : (
        <StandardTable
          columns={columns}
          data={activities}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total ?? activities.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(row) => row.id}
          onRowClick={(row) => handleView(row)}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete Activity"
        message={`Are you sure you want to delete "${deleteState.itemName}"?`}
        isLoading={deleteActivityMutation.isPending}
      />

      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setActivityToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={activityToRestore?.title}
        itemType="activity"
        action="restore"
        isLoading={restoreActivityMutation.isPending}
        error={restoreActivityMutation.error?.message}
      />
    </Box>
  );
};

export default ActivityListPage;
