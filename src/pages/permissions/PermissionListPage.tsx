import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
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
import { formatDate } from '../../constants/dateFormats';
import { FilterState } from '../../constants/filters';

interface Permission {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  category?: 'manage' | 'view' | 'edit' | 'other';
}

interface PermissionFilters extends FilterState {
  searchTerm: string;
}

const mockPermissions: Permission[] = [
  { id: 1, name: 'manage users', description: 'Can manage users', createdAt: '2023-01-01', category: 'manage' },
  { id: 2, name: 'manage roles', description: 'Can manage roles', createdAt: '2023-03-12', category: 'manage' },
  { id: 3, name: 'edit content', description: 'Can edit content', createdAt: '2023-05-20', category: 'edit' },
  { id: 4, name: 'view analytics', description: 'Can view analytics', createdAt: '2023-06-15', category: 'view' },
  { id: 5, name: 'manage settings', description: 'Can manage settings', createdAt: '2023-07-22', category: 'manage' },
  { id: 6, name: 'export data', description: 'Can export data', createdAt: '2023-08-10', category: 'other' },
  { id: 7, name: 'manage permissions', description: 'Can manage permissions', createdAt: '2023-09-05', category: 'manage' },
  { id: 8, name: 'view reports', description: 'Can view reports', createdAt: '2023-10-18', category: 'view' },
  { id: 9, name: 'manage locations', description: 'Can manage locations', createdAt: '2023-11-30', category: 'manage' },
  { id: 10, name: 'approve content', description: 'Can approve content', createdAt: '2023-12-12', category: 'edit' },
  { id: 11, name: 'view users', description: 'Can view user information', createdAt: '2023-12-15', category: 'view' },
  { id: 12, name: 'delete content', description: 'Can delete content', createdAt: '2023-12-20', category: 'edit' },
  { id: 13, name: 'manage admins', description: 'Can manage administrators', createdAt: '2023-12-25', category: 'manage' },
  { id: 14, name: 'view settings', description: 'Can view system settings', createdAt: '2023-12-30', category: 'view' },
  { id: 15, name: 'create content', description: 'Can create new content', createdAt: '2024-01-01', category: 'edit' },
];

const PermissionListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use standardized hooks
  const { filters, setFilter } = useFilters<PermissionFilters>();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Filter permissions using standardized logic
  const filteredPermissions = useMemo(() => {
    return mockPermissions.filter(permission =>
      permission.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    );
  }, [filters.searchTerm]);

  // Paginate data
  const paginatedPermissions = useMemo(() => {
    return filteredPermissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPermissions, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Permissions',
      value: mockPermissions.length,
      color: 'primary',
      icon: <SecurityIcon />,
    },
    {
      title: 'Manage Permissions',
      value: mockPermissions.filter(p => p.category === 'manage').length,
      color: 'warning',
      icon: <SecurityIcon />,
    },
    {
      title: 'View Permissions',
      value: mockPermissions.filter(p => p.category === 'view').length,
      color: 'info',
      icon: <SecurityIcon />,
    },
    {
      title: 'Edit Permissions',
      value: mockPermissions.filter(p => p.category === 'edit').length,
      color: 'success',
      icon: <SecurityIcon />,
    },
  ], []);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search permissions by name or description...',
    },
  ];

  // Helper function to get category color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'manage': return 'warning';
      case 'view': return 'info';
      case 'edit': return 'primary';
      default: return 'default';
    }
  };

  // Helper function to get category label
  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'manage': return 'Manage';
      case 'view': return 'View';
      case 'edit': return 'Edit';
      default: return 'Other';
    }
  };

  // Table columns configuration
  const columns: TableColumn<Permission>[] = [
    {
      id: 'name',
      label: 'Permission Name',
      render: (_, permission) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="600">
            {permission.name}
          </Typography>
          {permission.category && (
            <Chip
              label={getCategoryLabel(permission.category)}
              size="small"
              color={getCategoryColor(permission.category)}
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_, permission) => (
        <Typography variant="body2" color="textSecondary">
          {permission.description}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_, permission) => (
        <Typography variant="body2" color="textSecondary">
          {formatDate(permission.createdAt, 'display')}
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, permission) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/permissions/${permission.id}`)}
              color="primary"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/permissions/${permission.id}/edit`)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeletePermission(permission)}
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
  const createMobileCardActions = (permission: Permission): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      color: 'primary',
      onClick: () => navigate(`/permissions/${permission.id}`),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary',
      onClick: () => navigate(`/permissions/${permission.id}/edit`),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error',
      onClick: () => handleDeletePermission(permission),
    },
  ];

  // Event handlers
  const handleDeletePermission = (permission: Permission) => {
    console.log('Delete permission:', permission);
  };

  const handleAddPermission = () => {
    navigate('/permissions/create');
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Permission Management"
        breadcrumbs="Dashboard / Admin Management / Permissions"
        subtitle="Manage system permissions"
        actionButton={{
          text: 'Add Permission',
          icon: <AddIcon />,
          onClick: handleAddPermission
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof PermissionFilters, value)}
        fields={filterFields}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {paginatedPermissions.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No data available
              </Typography>
            </Paper>
          ) : (
            <Box>
              {paginatedPermissions.map((permission) => (
                <MobileCard
                  key={permission.id}
                  title={permission.name}
                  description={permission.description}
                  avatar={<SecurityIcon />}
                  avatarColor="primary.main"
                  chips={
                    permission.category ? [
                      {
                        label: getCategoryLabel(permission.category),
                        color: getCategoryColor(permission.category),
                        variant: 'outlined',
                      },
                    ] : []
                  }
                  actions={createMobileCardActions(permission)}
                  children={
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Created: {formatDate(permission.createdAt, 'display')}
                    </Typography>
                  }
                />
              ))}
            </Box>
          )}
          <MobilePagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredPermissions.length}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        <StandardTable
          columns={columns}
          data={paginatedPermissions}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredPermissions.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(permission) => permission.id}
        />
      )}
    </Box>
  );
};

export default PermissionListPage; 