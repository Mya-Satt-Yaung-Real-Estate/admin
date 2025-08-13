import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard } from '../../components/common/MobileCard';
import { MobilePagination } from '../../components/common/MobilePagination';
import { PageLoadingState, PageErrorState, PageEmptyState } from '../../components/ui';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { usePermissions } from '../../services/queries/permissions';
import { getStatusChipColor } from '../../utils/statusUtils';
import { getStatusLabel } from '../../constants/status';
import { FilterState } from '../../constants/filters';
import { Permission } from '../../types/permission';

interface PermissionFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

const PermissionListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use standardized hooks
  const { filters, setFilter } = useFilters<PermissionFilters>({
    statusFilter: 'all',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Fetch permissions data
  const { data: permissionsResponse, isLoading, error } = usePermissions({
    per_page: 100, // Get all permissions for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc'
  });

  // Extract permissions data
  const permissions = permissionsResponse?.data || [];

  // Filter permissions using client-side filtering
  const filteredPermissions = useMemo(() => {
    if (!permissions || permissions.length === 0) return [];
    
    const validPermissions = permissions.filter(permission => permission != null);
    
    return validPermissions.filter(permission => {
      const matchesSearch = 
        permission.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        permission.module?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && permission.is_active) ||
        (filters.statusFilter === 'inactive' && !permission.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [permissions, filters]);

  // Paginate data
  const paginatedPermissions = useMemo(() => {
    return filteredPermissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPermissions, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Permissions',
      value: permissions.length,
      color: 'primary',
      icon: <SecurityIcon />,
    },
    {
      title: 'Active Permissions',
      value: permissions.filter(permission => permission.is_active).length,
      color: 'success',
      icon: <SecurityIcon />,
    },
    {
      title: 'User Module',
      value: permissions.filter(permission => permission.module === 'user').length,
      color: 'warning',
      icon: <SecurityIcon />,
    },
    {
      title: 'Admin Module',
      value: permissions.filter(permission => permission.module === 'admin').length,
      color: 'info',
      icon: <SecurityIcon />,
    },
  ], [permissions]);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search permissions by name, description, or module...',
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
  const columns: TableColumn<Permission>[] = [
    {
      id: 'name',
      label: 'Permission Name',
      render: (_value, permission, _index) => {
        if (!permission) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {permission.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={getStatusLabel(permission.is_active ? 'active' : 'inactive')}
                size="small"
                color={getStatusChipColor(permission.is_active)}
                variant="outlined"
              />
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, permission, _index) => {
        if (!permission) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {permission.description || 'No description'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'module',
      label: 'Module',
      render: (_value, permission, _index) => {
        if (!permission) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {permission.module || 'No module'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
  ];

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Permissions" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Permissions"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Permission Management"
        breadcrumbs="Dashboard / Admin Management / Permissions"
        subtitle="View system permissions"
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof PermissionFilters, value)}
        fields={filterFields}
      />

      {/* Empty state */}
      {filteredPermissions.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Permissions Found"
          message={filters.searchTerm || filters.statusFilter !== 'all' 
            ? "No permissions match your current filters. Try adjusting your search criteria."
            : "No permissions have been created yet."
          }
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredPermissions.length > 0 ? (
        <Box>
          {paginatedPermissions.map((permission) => (
            <MobileCard
              key={permission.id}
              title={permission.name}
              description={permission.description || 'No description'}
              avatar={<SecurityIcon />}
              avatarColor="primary.main"
              status={{
                label: getStatusLabel(permission.is_active ? 'active' : 'inactive'),
                color: getStatusChipColor(permission.is_active),
              }}
              children={
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Module: {permission.module || 'No module'}
                </Typography>
              }
            />
          ))}
          <MobilePagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredPermissions.length}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredPermissions.length > 0 && (
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
        )
      )}
    </Box>
  );
};

export default PermissionListPage; 