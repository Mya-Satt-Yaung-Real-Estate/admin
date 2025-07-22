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
import { Admin } from '../../types/admin';
import { mockAdmins } from '../../data/mockAdmins';
import { getActiveRoles } from '../../data/mockRoles';

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

  // Get roles for filtering
  const roles = getActiveRoles();

  // Filter admins using standardized logic
  const filteredAdmins = useMemo(() => {
    return mockAdmins.filter(admin => {
      const matchesSearch = 
        admin.username.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = filters.statusFilter === 'all' || admin.status === filters.statusFilter;
      const matchesRole = filters.roleFilter === 'all' || admin.roleId.toString() === filters.roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [filters]);

  // Paginate data
  const paginatedAdmins = useMemo(() => {
    return filteredAdmins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAdmins, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Admins',
      value: mockAdmins.length,
      color: 'primary',
      icon: <AdminIcon />,
    },
    {
      title: 'Active Admins',
      value: mockAdmins.filter(admin => admin.status === 'active').length,
      color: 'success',
      icon: <AdminIcon />,
    },
    {
      title: 'Super Admins',
      value: mockAdmins.filter(admin => admin.roleId === 1).length,
      color: 'warning',
      icon: <SecurityIcon />,
    },
    {
      title: 'Regular Admins',
      value: mockAdmins.filter(admin => admin.roleId !== 1).length,
      color: 'info',
      icon: <AdminIcon />,
    },
  ], []);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search admins by name, username, or email...',
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
        ...roles.map(role => ({ value: role.id.toString(), label: role.name })),
      ],
    },
  ];

  // Helper functions
  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  const getInitials = (admin: Admin) => {
    return `${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}`;
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
              {`${admin.firstName} ${admin.lastName}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {admin.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'username',
      label: 'Username',
      render: (_, admin) => (
        <Typography variant="body2" fontWeight="500">
          {admin.username}
        </Typography>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      render: (_, admin) => (
        <Chip
          label={getRoleName(admin.roleId)}
          size="small"
          color={admin.roleId === 1 ? 'warning' : 'primary'}
          variant="outlined"
        />
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
                  title={`${admin.firstName} ${admin.lastName}`}
                  subtitle={admin.email}
                  description={`@${admin.username}`}
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
                      label: getRoleName(admin.roleId),
                      color: admin.roleId === 1 ? 'warning' : 'primary',
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