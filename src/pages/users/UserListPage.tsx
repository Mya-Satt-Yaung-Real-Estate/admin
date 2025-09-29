import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useAlertSystem } from '../../hooks';
import { useUsers } from '../../services/queries/users';
import { FilterState } from '../../constants/filters';
import { RegularUser } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UserFilters extends FilterState {
  searchTerm: string;
  userTypeFilter: string;
  memberLevelFilter: string;
  statusFilter: string;
  verificationStatusFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'User Management',
  description: 'Manage individual and company users',
  createButtonText: 'Add User',
  createButtonPath: '/users/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name or email...',
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
  {
    key: 'memberLevelFilter',
    type: 'select',
    label: 'Member Level',
    options: [
      { value: 'all', label: 'All Levels' },
      { value: 'bronze', label: 'Bronze' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'platinum', label: 'Platinum' },
    ],
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'verificationStatusFilter',
    type: 'select',
    label: 'Verification Status',
    options: [
      { value: 'all', label: 'All' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Pagination hook
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination();

  // Filters hook
  const {
    filters,
    setFilter,
  } = useFilters<UserFilters>({
    searchTerm: '',
    userTypeFilter: 'all',
    memberLevelFilter: 'all',
    statusFilter: 'all',
    verificationStatusFilter: 'all',
  });

  // Alert system hook
  const { alert, clearAlert } = useAlertSystem();

  // API Queries
  const { data: usersResponse, isLoading, error } = useUsers({
    per_page: 100, // Get all users for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });



  // Extract users data
  const users: RegularUser[] = usersResponse?.data || [];

  // Filter users using client-side filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = !filters.searchTerm ||
        user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesUserType = filters.userTypeFilter === 'all' ||
        user.user_type === filters.userTypeFilter;

      const matchesMemberLevel = filters.memberLevelFilter === 'all' ||
        user.member_level === filters.memberLevelFilter;

      const matchesStatus = filters.statusFilter === 'all' ||
        (filters.statusFilter === 'active' && user.is_active) ||
        (filters.statusFilter === 'inactive' && !user.is_active);

      const matchesVerificationStatus = filters.verificationStatusFilter === 'all' ||
        (user.user_type === 'company' && user.verification_status === filters.verificationStatusFilter);

      return matchesSearch && matchesUserType && matchesMemberLevel && matchesStatus && matchesVerificationStatus;
    });
  }, [users, filters]);

  // Paginate data
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Users',
      value: users.length,
      color: 'primary',
      icon: <PersonIcon />,
    },
    {
      title: 'Individuals',
      value: users.filter(user => user.user_type === 'individual').length,
      color: 'info',
      icon: <PersonIcon />,
    },
    {
      title: 'Companies',
      value: users.filter(user => user.user_type === 'company').length,
      color: 'success',
      icon: <BusinessIcon />,
    },
    {
      title: 'Active Users',
      value: users.filter(user => user.is_active).length,
      color: 'warning',
      icon: <PersonIcon />,
    },
    {
      title: 'Total Properties',
      value: users.reduce((sum, user) => sum + (user.property_count || 0), 0),
      color: 'secondary',
      icon: <HomeIcon />,
    },
    {
      title: 'Total Points',
      value: users.reduce((sum, user) => sum + (user.point_balance || 0), 0).toLocaleString(),
      color: 'error',
      icon: <DiamondIcon />,
    },
  ], [users]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<RegularUser>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: user.user_type === 'company' ? 'success.main' : 'primary.main' }}>
              {user.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="600">
                {user.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user.user_type === 'company' ? 'Company' : 'Individual'}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'email',
      label: 'Email',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {user.email}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'memberLevel',
      label: 'Member Level',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip
            status={user.member_level}
            statusType="member_level"
            size="small"
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'propertyCount',
      label: 'Properties',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {user.property_count || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'pointBalance',
      label: 'Points',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DiamondIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {user.point_balance || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={user.is_active ? 'active' : 'inactive'} 
            size="small"
          />
        );
      },
    },
    {
      id: 'verificationStatus',
      label: 'Verification Status',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        if (user.user_type !== 'company') {
          return <Typography variant="body2" color="textSecondary">N/A</Typography>;
        }
        const verificationStatus = typeof user.verification_status === 'string' ? user.verification_status : '';
        if (!verificationStatus || verificationStatus.trim() === '') {
          return <Typography variant="body2" color="textSecondary">Not Submitted</Typography>;
        }
        return (
          <StatusChip 
            status={verificationStatus} 
            statusType="verification_status"
            size="small"
          />
        );
      },
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {user.last_login_at ? formatDate(user.last_login_at, 'display') : 'Never'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {user.created_at ? formatDate(user.created_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, user) => {
        if (!user) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/users/${user.slug}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/users/${user.slug}/edit`)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

          </Box>
        );
      },
    },
  ], [isMobile, navigate]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (user: RegularUser): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      color: 'primary' as const,
      onClick: () => navigate(`/users/${user.slug}`),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary' as const,
      onClick: () => navigate(`/users/${user.slug}/edit`),
    },
  ];

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleAddUser = () => {
    navigate('/users/create');
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Users" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Users"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / User Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddUser
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof UserFilters, value)}
        fields={FILTER_FIELDS}
      />

      {/* Empty state */}
      {filteredUsers.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Users Found"
          message={filters.searchTerm || filters.userTypeFilter !== 'all' || filters.memberLevelFilter !== 'all' || filters.statusFilter !== 'all' || filters.verificationStatusFilter !== 'all'
            ? "No users match your current filters. Try adjusting your search criteria."
            : "No users have been created yet."
          }
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredUsers.length > 0 ? (
        <Box>
          {paginatedUsers.map((user) => (
            <MobileCard
              key={user.id}
              title={user.name}
              subtitle={user.email}
              description={`${user.user_type === 'company' ? 'Company' : 'Individual'} • ${user.member_level} member • ${user.property_count || 0} properties • ${user.point_balance || 0} points`}
              avatar={user.user_type === 'company' ? <BusinessIcon /> : <PersonIcon />}
              avatarColor={user.user_type === 'company' ? 'success.main' : 'primary.main'}
              status={{
                label: user.is_active ? 'Active' : 'Inactive',
                color: user.is_active ? 'success' : 'error',
              }}
              chips={[
                ...(() => {
                  if (user.user_type === 'company') {
                    const verificationStatus = typeof user.verification_status === 'string' ? user.verification_status : '';
                    if (verificationStatus && verificationStatus.trim() !== '') {
                      return [{
                        label: verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1),
                        color: verificationStatus === 'approved' ? 'primary' as const : 'warning' as const,
                      }];
                    }
                  }
                  return [];
                })(),
                {
                  label: user.user_type === 'company' ? 'Company' : 'Individual',
                  color: user.user_type === 'company' ? 'primary' as const : 'secondary' as const,
                },
                {
                  label: user.member_level,
                  color: 'info' as const,
                },
                {
                  label: `${user.property_count || 0} Properties`,
                  color: 'secondary' as const,
                },
                {
                  label: `${user.point_balance || 0} Points`,
                  color: 'warning' as const,
                },
              ]}
              actions={createMobileCardActions(user)}
              onClick={() => navigate(`/users/${user.id}`)}
              clickable={true}
            />
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredUsers.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
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


    </Box>
  );
};

export default UserListPage; 