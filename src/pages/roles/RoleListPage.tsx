import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
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
import { formatDate } from '../../constants/dateFormats';
import { FilterState } from '../../constants/filters';

interface Role {
  id: number;
  name: string;
  permissions: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

interface RoleFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

const mockRoles: Role[] = [
  { 
    id: 1, 
    name: 'Super Admin', 
    permissions: ['manage users', 'manage roles', 'manage permissions', 'manage admins', 'view analytics'], 
    createdAt: '2023-01-01',
    status: 'active'
  },
  { 
    id: 2, 
    name: 'Admin', 
    permissions: ['manage users', 'view analytics'], 
    createdAt: '2023-03-12',
    status: 'active'
  },
  { 
    id: 3, 
    name: 'Editor', 
    permissions: ['edit content', 'view reports'], 
    createdAt: '2023-05-20',
    status: 'active'
  },
  { 
    id: 4, 
    name: 'Viewer', 
    permissions: ['view content', 'view reports'], 
    createdAt: '2023-06-15',
    status: 'active'
  },
  { 
    id: 5, 
    name: 'Moderator', 
    permissions: ['moderate content', 'view reports'], 
    createdAt: '2023-07-22',
    status: 'inactive'
  },
  { 
    id: 6, 
    name: 'Analyst', 
    permissions: ['view analytics', 'export data'], 
    createdAt: '2023-08-10',
    status: 'active'
  },
  { 
    id: 7, 
    name: 'Manager', 
    permissions: ['manage content', 'approve content', 'view reports'], 
    createdAt: '2023-09-05',
    status: 'active'
  },
  { 
    id: 8, 
    name: 'Support', 
    permissions: ['view users', 'view reports'], 
    createdAt: '2023-10-18',
    status: 'active'
  },
];

const RoleListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use standardized hooks
  const { filters, setFilter } = useFilters<RoleFilters>({
    statusFilter: 'all',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Filter roles using standardized logic
  const filteredRoles = useMemo(() => {
    return mockRoles.filter(role => {
      const matchesSearch = 
        role.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        role.permissions.some(permission => 
          permission.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      const matchesStatus = filters.statusFilter === 'all' || role.status === filters.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [filters]);

  // Paginate data
  const paginatedRoles = useMemo(() => {
    return filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRoles, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Roles',
      value: mockRoles.length,
      color: 'primary',
      icon: <SecurityIcon />,
    },
    {
      title: 'Active Roles',
      value: mockRoles.filter(role => role.status === 'active').length,
      color: 'success',
      icon: <SecurityIcon />,
    },
    {
      title: 'Admin Roles',
      value: mockRoles.filter(role => role.name.toLowerCase().includes('admin')).length,
      color: 'warning',
      icon: <AdminIcon />,
    },
    {
      title: 'Average Permissions',
      value: Math.round(mockRoles.reduce((acc, role) => acc + role.permissions.length, 0) / mockRoles.length),
      color: 'info',
      icon: <SecurityIcon />,
    },
  ], []);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search roles by name or permissions...',
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
  ];

  // Table columns configuration
  const columns: TableColumn<Role>[] = [
    {
      id: 'name',
      label: 'Role Name',
      render: (_, role) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="600">
            {role.name}
          </Typography>
          <Chip
            label={role.status}
            size="small"
            color={role.status === 'active' ? 'success' : 'default'}
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      ),
    },
    {
      id: 'permissions',
      label: 'Permissions',
      render: (_, role) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {role.permissions.slice(0, 3).map((permission, index) => (
            <Chip
              key={index}
              label={permission}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
          {role.permissions.length > 3 && (
            <Chip
              label={`+${role.permissions.length - 3} more`}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}
        </Box>
      ),
    },
    {
      id: 'permissionCount',
      label: 'Permission Count',
      render: (_, role) => (
        <Typography variant="body2" color="textSecondary">
          {role.permissions.length} permissions
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_, role) => (
        <Typography variant="body2" color="textSecondary">
          {formatDate(role.createdAt, 'display')}
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, role) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/roles/${role.id}`)}
              color="primary"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/roles/${role.id}/edit`)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteRole(role)}
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
  const createMobileCardActions = (role: Role): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      color: 'primary',
      onClick: () => navigate(`/roles/${role.id}`),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary',
      onClick: () => navigate(`/roles/${role.id}/edit`),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error',
      onClick: () => handleDeleteRole(role),
    },
  ];

  // Event handlers
  const handleDeleteRole = (role: Role) => {
    console.log('Delete role:', role);
  };

  const handleAddRole = () => {
    navigate('/roles/create');
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Role Management"
        breadcrumbs="Dashboard / Admin Management / Roles"
        subtitle="Manage roles and their permissions"
        actionButton={{
          text: 'Add Role',
          icon: <AddIcon />,
          onClick: handleAddRole
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof RoleFilters, value)}
        fields={filterFields}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {paginatedRoles.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No data available
              </Typography>
            </Paper>
          ) : (
            <Box>
              {paginatedRoles.map((role) => (
                <MobileCard
                  key={role.id}
                  title={role.name}
                  avatar={<SecurityIcon />}
                  avatarColor={role.name.toLowerCase().includes('admin') ? 'warning.main' : 'primary.main'}
                  status={{
                    label: role.status,
                    color: role.status === 'active' ? 'success' : 'default',
                  }}
                  chips={[
                    {
                      label: `${role.permissions.length} permissions`,
                      color: 'primary',
                      variant: 'outlined',
                    },
                  ]}
                  actions={createMobileCardActions(role)}
                  children={
                    <Box>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {role.permissions.slice(0, 2).map((permission, index) => (
                          <Chip
                            key={index}
                            label={permission}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                        {role.permissions.length > 2 && (
                          <Chip
                            label={`+${role.permissions.length - 2} more`}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Created: {formatDate(role.createdAt, 'display')}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Box>
          )}
          <MobilePagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredRoles.length}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        <StandardTable
          columns={columns}
          data={paginatedRoles}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRoles.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(role) => role.id}
        />
      )}
    </Box>
  );
};

export default RoleListPage; 