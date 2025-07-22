import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { MobilePagination } from '../../components/common/MobilePagination';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { getStatusColor, getStatusLabel } from '../../constants/status';
import { formatRelativeTime } from '../../constants/dateFormats';
import { FilterState } from '../../constants/filters';
import { Admin, AdminRole } from '../../types/admin';
import { mockAdmins, getAdminStats } from '../../data/mockAdmins';

interface AdminFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
}

const AdminListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use standardized hooks
  const { filters, setFilter } = useFilters<AdminFilters>({
    statusFilter: 'all',
    roleFilter: 'all',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Filter admins using standardized logic
  const filteredAdmins = useMemo(() => {
    return mockAdmins.filter(admin => {
      const matchesSearch = 
        admin.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        admin.department?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        admin.permissions.some(permission => permission.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      const matchesStatus = filters.statusFilter === 'all' || admin.status === filters.statusFilter;
      const matchesRole = filters.roleFilter === 'all' || admin.role === filters.roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [filters]);

  // Paginate data
  const paginatedAdmins = useMemo(() => {
    return filteredAdmins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAdmins, page, rowsPerPage]);

  // Get admin statistics
  const adminStats = getAdminStats();

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Admins',
      value: adminStats.totalAdmins,
      color: 'primary',
      icon: <AdminIcon />,
    },
    {
      title: 'Active Admins',
      value: adminStats.activeAdmins,
      color: 'success',
      icon: <AdminIcon />,
    },
    {
      title: 'Super Admins',
      value: adminStats.superAdmins,
      color: 'warning',
      icon: <SecurityIcon />,
    },
    {
      title: 'Regular Admins',
      value: adminStats.admins + adminStats.moderators,
      color: 'info',
      icon: <AdminIcon />,
    },
  ], [adminStats]);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search admins by name, email, or department...',
    },
    {
      key: 'statusFilter',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'roleFilter',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'super_admin', label: 'Super Administrator' },
        { value: 'admin', label: 'Administrator' },
        { value: 'moderator', label: 'Moderator' },
      ],
    },
  ];

  // Helper functions
  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Unknown Role';
    }
  };

  const getInitials = (admin: Admin) => {
    return admin.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  // Table columns configuration
  const columns: TableColumn<Admin>[] = [
    {
      id: 'admin',
      label: 'Admin',
      render: (_, admin) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: admin.status === 'active' ? '#4caf50' : '#f44336'
                }}
              />
            }
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <Typography variant="body2" fontSize="0.75rem">
                {getInitials(admin)}
              </Typography>
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {admin.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {admin.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      render: (_, admin) => (
        <Chip
          label={getRoleLabel(admin.role)}
          size="small"
          color={admin.role === 'super_admin' ? 'warning' : 'primary'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'department',
      label: 'Department',
      render: (_, admin) => (
        <Typography variant="body2" color="textSecondary">
          {admin.department || 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, admin) => (
        <Chip
          label={getStatusLabel(admin.status)}
          color={getStatusColor(admin.status)}
          size="small"
        />
      ),
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      render: (_, admin) => (
        <Typography variant="body2" color="textSecondary">
          {admin.lastLogin ? formatRelativeTime(admin.lastLogin) : 'Never'}
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_, admin) => (
        <Typography variant="body2" color="textSecondary">
          {admin.createdAt}
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, admin) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/admins/${admin.id}`)}
              color="primary"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/admins/${admin.id}/edit`)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteAdmin(admin)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Helper function to create mobile card actions
  const createMobileCardActions = (admin: Admin): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      color: 'primary',
      onClick: () => navigate(`/admins/${admin.id}`),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary',
      onClick: () => navigate(`/admins/${admin.id}/edit`),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error',
      onClick: () => handleDeleteAdmin(admin),
    },
  ];

  // Event handlers
  const handleDeleteAdmin = (admin: Admin) => {
    console.log('Delete admin:', admin);
  };

  const handleAddAdmin = () => {
    navigate('/admins/create');
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Admin Management"
        breadcrumbs="Dashboard / Admin Management"
        subtitle="Manage system administrators and their roles"
        actionButton={{
          text: 'Add Admin',
          icon: <AddIcon />,
          onClick: handleAddAdmin
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof AdminFilters, value)}
        fields={filterFields}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {paginatedAdmins.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No data available
              </Typography>
            </Paper>
          ) : (
            <Box>
              {paginatedAdmins.map((admin) => (
                <MobileCard
                  key={admin.id}
                  title={admin.name}
                  subtitle={admin.email}
                  description={admin.department || 'No department'}
                  avatarText={getInitials(admin)}
                  avatarColor="primary.main"
                  status={{
                    label: getStatusLabel(admin.status),
                    color: getStatusColor(admin.status) === 'success' ? 'success' : 
                           getStatusColor(admin.status) === 'error' ? 'error' : 
                           getStatusColor(admin.status) === 'warning' ? 'warning' : 'default',
                  }}
                  chips={[
                    {
                      label: getRoleLabel(admin.role),
                      color: admin.role === 'super_admin' ? 'warning' : 'primary',
                      variant: 'outlined',
                    },
                  ]}
                  actions={createMobileCardActions(admin)}
                  children={
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Last login: {admin.lastLogin ? formatRelativeTime(admin.lastLogin) : 'Never'}
                    </Typography>
                  }
                />
              ))}
            </Box>
          )}
          <MobilePagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredAdmins.length}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        <StandardTable
          columns={columns}
          data={paginatedAdmins}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredAdmins.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(admin) => admin.id}
        />
      )}
    </Box>
  );
};

export default AdminListPage; 