import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
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
import { PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog } from '../../components/ui';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { useRoles, useDeleteRole } from '../../services/queries/roles';
import { formatDate } from '../../constants/dateFormats';
import { getStatusChipColor } from '../../utils/statusUtils';
import { getStatusLabel } from '../../constants/status';
import { FilterState } from '../../constants/filters';
import { Role } from '../../types/role';

interface RoleFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

const RoleListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use standardized hooks
  const { filters, setFilter } = useFilters<RoleFilters>({
    statusFilter: 'all',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Fetch roles data
  const { data: rolesResponse, isLoading, error } = useRoles({
    per_page: 100, // Get all roles for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc'
  });

  // Delete role mutation
  const deleteRoleMutation = useDeleteRole();

  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // Extract roles data
  const roles = rolesResponse?.data || [];

  // Filter roles using client-side filtering
  const filteredRoles = useMemo(() => {
    if (!roles || roles.length === 0) return [];
    
    const validRoles = roles.filter(role => role != null);
    
    return validRoles.filter(role => {
      const matchesSearch = 
        role.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        role.permissions?.some(permission => 
          permission.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && role.is_active) ||
        (filters.statusFilter === 'inactive' && !role.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [roles, filters]);

  // Paginate data
  const paginatedRoles = useMemo(() => {
    return filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRoles, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Roles',
      value: roles.length,
      color: 'primary',
      icon: <SecurityIcon />,
    },
    {
      title: 'Active Roles',
      value: roles.filter(role => role.is_active).length,
      color: 'success',
      icon: <SecurityIcon />,
    },
    {
      title: 'Admin Roles',
      value: roles.filter(role => role.name.toLowerCase().includes('admin')).length,
      color: 'warning',
      icon: <AdminIcon />,
    },
    {
      title: 'Average Permissions',
      value: roles.length > 0 
        ? Math.round(roles.reduce((acc, role) => acc + (role.permissions?.length || 0), 0) / roles.length)
        : 0,
      color: 'info',
      icon: <SecurityIcon />,
    },
  ], [roles]);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search roles by name, description, or permissions...',
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
      render: (_value, role, _index) => {
        if (!role) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {role.name}
            </Typography>
            <Chip
              label={getStatusLabel(role.is_active ? 'active' : 'inactive')}
              size="small"
              color={getStatusChipColor(role.is_active)}
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>
        );
      },
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, role, _index) => {
        if (!role) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {role.description || 'No description'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'permissions',
      label: 'Permissions',
      render: (_value, role, _index) => {
        if (!role) return <Typography variant="body2">No data</Typography>;
        const permissions = role.permissions || [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {permissions.slice(0, 3).map((permission) => (
              <Chip
                key={permission.id}
                label={permission.name}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
            {permissions.length > 3 && (
              <Chip
                label={`+${permissions.length - 3} more`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
          </Box>
        );
      },
    },
    {
      id: 'permissionCount',
      label: 'Permission Count',
      render: (_value, role, _index) => {
        if (!role) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {role.permissions?.length || 0} permissions
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, role, _index) => {
        if (!role) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(role.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, role, _index) => {
        if (!role) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/roles/${role.slug}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/roles/${role.slug}/edit`)}
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
                disabled={deleteRoleMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  // Helper function to create mobile card actions
  const createMobileCardActions = (role: Role): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      color: 'primary',
      onClick: () => navigate(`/roles/${role.slug}`),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary',
      onClick: () => navigate(`/roles/${role.slug}/edit`),
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
    openDeleteConfirmation(
      role.name,
      'role',
      () => {
        deleteRoleMutation.mutate(role.slug);
      }
    );
  };

  const handleAddRole = () => {
    navigate('/roles/create');
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Roles" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Roles"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

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

      {/* Empty state */}
      {filteredRoles.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Roles Found"
          message={filters.searchTerm || filters.statusFilter !== 'all' 
            ? "No roles match your current filters. Try adjusting your search criteria."
            : "No roles have been created yet. Create your first role to get started."
          }
          actionButton={{
            text: 'Add Role',
            icon: <AddIcon />,
            onClick: handleAddRole
          }}
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredRoles.length > 0 ? (
        <Box>
          {paginatedRoles.map((role) => (
            <MobileCard
              key={role.id}
              title={role.name}
              avatar={<SecurityIcon />}
              avatarColor={role.name.toLowerCase().includes('admin') ? 'warning.main' : 'primary.main'}
              status={{
                label: getStatusLabel(role.is_active ? 'active' : 'inactive'),
                color: getStatusChipColor(role.is_active),
              }}
              chips={[
                {
                  label: `${role.permissions?.length || 0} permissions`,
                  color: 'primary',
                  variant: 'outlined',
                },
              ]}
              actions={createMobileCardActions(role)}
              children={
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {role.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(role.permissions || []).slice(0, 2).map((permission) => (
                      <Chip
                        key={permission.id}
                        label={permission.name}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                    {(role.permissions || []).length > 2 && (
                      <Chip
                        label={`+${(role.permissions || []).length - 2} more`}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Created: {formatDate(role.created_at, 'display')}
                  </Typography>
                </Box>
              }
            />
          ))}
          <MobilePagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredRoles.length}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredRoles.length > 0 && (
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
        )
      )}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
      />
    </Box>
  );
};

export default RoleListPage; 