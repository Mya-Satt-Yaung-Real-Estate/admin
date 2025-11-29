import React, { useMemo, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Notifications as NotificationIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, PageErrorState, PageEmptyState, ActionAlert, DeleteConfirmationDialog } from '../../components/ui';
import { usePagination, useFilters, useAlertSystem, useManualSearch, useDeleteConfirmation } from '../../hooks';
import { useAnnouncements, useDeleteAnnouncement } from '../../services/queries/announcements';
import { FilterState } from '../../constants/filters';
import { Announcement } from '../../types/announcement';
import { utcToMyanmarTime } from '../../utils/dayjs';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AnnouncementFilters extends FilterState {
  searchTerm: string;
  typeFilter: string;
  targetFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Announcement Management',
  description: 'Manage system announcements',
  createButtonText: 'Create Announcement',
  createButtonPath: '/announcements/create',
} as const;

// Filter fields for announcements
const filterFields: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title or body...',
  },
  {
    key: 'typeFilter',
    type: 'select',
    label: 'Type',
    options: [
      { value: 'all', label: 'All Types' },
      { value: 'notification', label: 'Notification' },
    ],
  },
  {
    key: 'targetFilter',
    type: 'select',
    label: 'Target',
    options: [
      { value: 'all', label: 'All Targets' },
      { value: 'all_users', label: 'All Users' },
      { value: 'specific', label: 'Specific Users' },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AnnouncementListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  // Manual search: only triggers on Enter key or search button click
  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');

  const { filters, setFilter } = useFilters<AnnouncementFilters>({
    searchTerm: '', // This will be overridden by manual search
    typeFilter: 'all',
    targetFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // API Queries - Server-side filtering and pagination
  const { data: announcementsResponse, isLoading, error } = useAnnouncements({
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term
    announcement_type: filters.typeFilter !== 'all' ? filters.typeFilter as 'notification' : undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const deleteAnnouncementMutation = useDeleteAnnouncement();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract announcements data (already filtered and paginated by server)
  const announcements = announcementsResponse?.data || [];
  const pagination = announcementsResponse?.pagination;
  
  // Server-side filtering and pagination - no client-side processing needed
  const filteredAnnouncements = announcements;

  // Filter announcements by target type (client-side filter for targetFilter)
  const finalFilteredAnnouncements = useMemo(() => {
    if (filters.targetFilter === 'all') {
      return filteredAnnouncements;
    }
    
    return filteredAnnouncements.filter(announcement => {
      if (filters.targetFilter === 'all_users') {
        return announcement.all_users === true;
      } else if (filters.targetFilter === 'specific') {
        return announcement.all_users === false;
      }
      return true;
    });
  }, [filteredAnnouncements, filters.targetFilter]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Announcements',
      value: pagination?.total || 0,
      color: 'primary',
      icon: <NotificationIcon />,
    },
    {
      title: 'All Users',
      value: announcements.filter(a => a.all_users).length,
      color: 'info',
      icon: <GroupIcon />,
    },
    {
      title: 'Specific Users',
      value: announcements.filter(a => !a.all_users).length,
      color: 'secondary',
      icon: <PersonIcon />,
    },
    {
      title: 'Notifications',
      value: announcements.filter(a => a.announcement_type === 'notification').length,
      color: 'success',
      icon: <NotificationIcon />,
    },
  ], [announcements, pagination]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  // Delete handler
  const handleDelete = useCallback((announcement: Announcement) => {
    openDeleteConfirmation(
      announcement.title,
      'announcement',
      async () => {
        try {
          await deleteAnnouncementMutation.mutateAsync(announcement.id);
          showSuccess(`${announcement.title} deleted successfully!`);
        } catch (error: any) {
          showError(error.message || 'Failed to delete announcement. Please try again.');
        }
      }
    );
  }, [openDeleteConfirmation, deleteAnnouncementMutation, showSuccess, showError]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Announcement>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      width: '300px',
      render: (_value, announcement) => {
        if (!announcement) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="subtitle2" fontWeight="600">
            {announcement.title}
          </Typography>
        );
      },
    },
    {
      id: 'type',
      label: 'Type',
      width: '120px',
      render: (_value, announcement) => {
        if (!announcement) return <Typography variant="body2">No data</Typography>;
        return (
          <Chip
            label={announcement.announcement_type}
            color="primary"
            variant="outlined"
            size="small"
          />
        );
      },
    },
    {
      id: 'target',
      label: 'Target',
      width: '150px',
      render: (_value, announcement) => {
        if (!announcement) return <Typography variant="body2">No data</Typography>;
        
        if (announcement.all_users) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="body2" fontWeight="500">
                All Users
              </Typography>
            </Box>
          );
        } else {
          const userCount = announcement.users?.length || 0;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
              <Typography variant="body2" fontWeight="500">
                {userCount} User{userCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
          );
        }
      },
    },
    {
      id: 'status',
      label: 'Status',
      width: '140px',
      render: (_value, announcement) => {
        if (!announcement) return <Typography variant="body2">No data</Typography>;
        
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'scheduled':
              return { color: 'info' as const, label: 'Scheduled', icon: <ScheduleIcon sx={{ fontSize: 14 }} /> };
            case 'sending':
              return { color: 'warning' as const, label: 'Sending', icon: <ScheduleIcon sx={{ fontSize: 14 }} /> };
            case 'sent':
              return { color: 'success' as const, label: 'Sent', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
            case 'failed':
              return { color: 'error' as const, label: 'Failed', icon: <ErrorIcon sx={{ fontSize: 14 }} /> };
            case 'cancelled':
              return { color: 'default' as const, label: 'Cancelled', icon: <CancelIcon sx={{ fontSize: 14 }} /> };
            default:
              return { color: 'default' as const, label: status || 'Pending', icon: null };
          }
        };
        
        const statusConfig = getStatusConfig(announcement.status || 'pending');
        
        return (
          <Chip
            icon={statusConfig.icon as any}
            label={statusConfig.label}
            color={statusConfig.color === 'success' ? 'default' : statusConfig.color}
            size="small"
            variant="outlined"
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'scheduled_at',
      label: 'Scheduled At',
      width: '180px',
      render: (_value, announcement) => {
        if (!announcement) return <Typography variant="body2">No data</Typography>;
        
        if (announcement.scheduled_at) {
          return (
            <Typography variant="body2" color="textSecondary">
              {utcToMyanmarTime(announcement.scheduled_at).format('MMM DD, YYYY [at] hh:mm A')} (MMT)
            </Typography>
          );
        }
        
        return (
          <Typography variant="body2" color="textSecondary">
            Immediate
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'sent_at',
      label: 'Sent At',
      width: '180px',
      render: (_value, announcement) => {
        if (!announcement) return <Typography variant="body2">No data</Typography>;
        
        if (announcement.sent_at) {
          return (
            <Typography variant="body2" color="textSecondary">
              {utcToMyanmarTime(announcement.sent_at).format('MMM DD, YYYY [at] hh:mm A')} (MMT)
            </Typography>
          );
        }
        
        return (
          <Typography variant="body2" color="textSecondary">
            —
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '120px',
      align: 'center',
      render: (_value, announcement) => {
        if (!announcement) return <Typography variant="body2">No data</Typography>;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* View Details */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/announcements/${announcement.id}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            
            {/* Delete */}
            <Tooltip title="Delete Announcement">
              <IconButton
                size="small"
                onClick={() => handleDelete(announcement)}
                color="error"
                disabled={deleteAnnouncementMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [navigate, handleDelete]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = useCallback((announcement: Announcement): MobileCardAction[] => {
    return [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/announcements/${announcement.id}`),
      },
      {
        icon: <DeleteIcon />,
        tooltip: 'Delete Announcement',
        color: 'error' as const,
        onClick: () => handleDelete(announcement),
      },
    ];
  }, [navigate, handleDelete]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleAddAnnouncement = () => {
    navigate('/announcements/create');
  };

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof AnnouncementFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('typeFilter', 'all');
    setFilter('targetFilter', 'all');
    
    // Reset to first page
    handleChangePage({} as any, 0);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Error state - show inline error instead of full page error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Announcements"
          subtitle="Manage system announcements"
          actionButton={{
            text: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Announcements"
            message={error.message}
            onRetry={() => window.location.reload()}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / Announcement Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddAnnouncement
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={{
          ...filters,
          searchTerm: searchValue, // Use current search value for immediate UI feedback
        }}
        onFilterChange={handleFilterChange}
        fields={filterFields}
        searchHelperText={undefined}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={triggerSearch}
        showSearchButton={true}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            // Loading skeleton cards for mobile
            Array.from({ length: rowsPerPage }).map((_, index) => (
              <MobileCard
                key={`skeleton-${index}`}
                title=""
                loading={true}
                showRowNumber={true}
              />
            ))
          ) : finalFilteredAnnouncements.length > 0 ? (
            finalFilteredAnnouncements.map((announcement, index) => (
              <MobileCard
                key={announcement.id}
                title={announcement.title}
                subtitle={announcement.body}
                rowNumber={(page * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={announcement.body}
                avatar={<NotificationIcon />}
                avatarColor="primary.main"
                status={{
                  label: announcement.announcement_type,
                  color: 'default',
                }}
                chips={[
                  {
                    label: announcement.status || 'pending',
                    color: announcement.status === 'sent' ? 'default' : 
                            announcement.status === 'failed' ? 'error' :
                            announcement.status === 'scheduled' ? 'info' :
                            announcement.status === 'cancelled' ? 'default' : 'warning',
                  },
                  {
                    label: announcement.all_users ? 'All Users' : `${announcement.users?.length || 0} Users`,
                    color: announcement.all_users ? 'primary' : 'secondary',
                  },
                  ...(announcement.scheduled_at ? [{
                    label: `Scheduled: ${utcToMyanmarTime(announcement.scheduled_at).format('MMM DD, YYYY hh:mm A')} (MMT)`,
                    color: 'info' as const,
                  }] : []),
                  ...(announcement.sent_at ? [{
                    label: `Sent: ${utcToMyanmarTime(announcement.sent_at).format('MMM DD, YYYY hh:mm A')} (MMT)`,
                    color: 'default' as const,
                  }] : []),
                ]}
                actions={createMobileCardActions(announcement)}
                onClick={() => navigate(`/announcements/${announcement.id}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Announcements Found"
              message="No announcements match your current filters. Try adjusting your search criteria."
            />
          )}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={pagination?.total || 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        finalFilteredAnnouncements.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Announcements Found"
            message={searchTerm || filters.typeFilter !== 'all' || filters.targetFilter !== 'all'
              ? "No announcements match your current filters. Try adjusting your search criteria."
              : "No announcements have been created yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={finalFilteredAnnouncements}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(announcement) => announcement.id}
          loading={isLoading}
          showRowNumbers={true}
          rowNumberLabel="No."
        />
        )
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteAnnouncementMutation.isPending}
        error={deleteAnnouncementMutation.error?.message}
      />
    </Box>
  );
};

export default AnnouncementListPage;
