import React, { useMemo, useCallback } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers, useDeleteAdminUser } from '../../services/queries/adminUsers';
import { useAuthStore } from '../../stores/useAuthStore';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { MobilePagination } from '../../components/common/MobilePagination';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { FilterState, STATUS_OPTIONS, FILTER_CONFIG } from '../../constants/filters';
import { PAGINATION_CONFIG } from '../../constants/pagination';
import { 
  PageLoadingState, 
  PageErrorState, 
  PageEmptyState 
} from '../../components/ui';
import { 
  getUserInitials, 
  formatLastLogin, 
  getUserDisplayName, 
  getUserDisplayEmail,
  getStatusDisplay 
} from '../../utils';
import { AdminUser } from '../../types/admin';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AdminUserFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

interface ListPageState {
  isLoading: boolean;
  error: any;
  data: AdminUser[] | undefined;
  filteredData: AdminUser[];
  paginatedData: AdminUser[];
  totalCount: number;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Admin Users',
  description: 'Manage system administrators and their permissions',
  createButtonText: 'Add Admin',
  createButtonPath: '/admins/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name or email...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [...FILTER_CONFIG.statusOptions],
  },
];

const TABLE_CONFIG = {
  columns: {
    name: { label: 'Name', width: '30%' },
    status: { label: 'Status', width: '15%' },
    lastLogin: { label: 'Last Login', width: '20%' },
    actions: { label: 'Actions', width: '15%', align: 'center' as const },
  },
} as const;

// ============================================================================
// DATA PROCESSING HOOKS
// ============================================================================

const useListPageData = (filters: AdminUserFilters, page: number, rowsPerPage: number): ListPageState => {
  // Data fetching
  const { data: allAdminsData, isLoading, error } = useAdminUsers({
    per_page: PAGINATION_CONFIG.maxRowsPerPage,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Data processing
  const filteredData = useMemo(() => {
    const admins = allAdminsData?.data || [];
    const validAdmins = admins.filter(admin => admin != null);
    
    return validAdmins.filter(admin => {
      // Search filter
      const matchesSearch = !filters.searchTerm || 
        (admin.name || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (admin.email || '').toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Status filter
      const isActive = admin.is_active === true;
      const matchesStatus = filters.statusFilter === STATUS_OPTIONS.all || 
        (filters.statusFilter === STATUS_OPTIONS.active && isActive) ||
        (filters.statusFilter === STATUS_OPTIONS.inactive && !isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [allAdminsData, filters.searchTerm, filters.statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, rowsPerPage]);

  return {
    isLoading,
    error,
    data: allAdminsData?.data,
    filteredData,
    paginatedData,
    totalCount: filteredData.length,
  };
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const createTableColumns = (
  navigate: (path: string) => void,
  handleDelete: (adminId: string) => Promise<void>,
  currentUserId?: number,
  isDeleteLoading?: boolean
): TableColumn<AdminUser>[] => [
  {
    id: 'name',
    label: TABLE_CONFIG.columns.name.label,
    width: TABLE_CONFIG.columns.name.width,
    render: (_value, admin, _index) => {
      if (!admin) return <Typography variant="body2">No data</Typography>;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            {getUserInitials(admin.name || 'Unknown')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {getUserDisplayName(admin.name)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getUserDisplayEmail(admin.email)}
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    id: 'status',
    label: TABLE_CONFIG.columns.status.label,
    width: TABLE_CONFIG.columns.status.width,
    render: (_value, admin, _index) => {
      if (!admin) return <Typography variant="body2">No data</Typography>;
      
      const status = getStatusDisplay(admin.is_active === true);
      return (
        <Chip
          label={status.label}
          color={status.color}
          size="small"
        />
      );
    },
  },
  {
    id: 'last_login',
    label: TABLE_CONFIG.columns.lastLogin.label,
    width: TABLE_CONFIG.columns.lastLogin.width,
    render: (_value, admin, _index) => {
      if (!admin) return <Typography variant="body2">No data</Typography>;
      
      return (
        <Typography variant="body2">
          {formatLastLogin(admin.last_login_at)}
        </Typography>
      );
    },
  },
  {
    id: 'actions',
    label: TABLE_CONFIG.columns.actions.label,
    width: TABLE_CONFIG.columns.actions.width,
    align: TABLE_CONFIG.columns.actions.align,
    render: (_value, admin, _index) => {
      if (!admin) return <Typography variant="body2">No data</Typography>;
      
      return (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/admins/${admin.slug || ''}`)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/admins/${admin.slug || ''}/edit`)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {currentUserId !== admin.id && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete((admin.id || 0).toString())}
                disabled={isDeleteLoading}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
  },
];

const createMobileCardActions = (
  admin: AdminUser,
  navigate: (path: string) => void,
  handleDelete: (adminId: string) => Promise<void>,
  currentUserId?: number
): MobileCardAction[] => [
  {
    icon: <ViewIcon />,
    tooltip: 'View Details',
            onClick: () => navigate(`/admins/${admin.slug || ''}`),
  },
  {
    icon: <EditIcon />,
    tooltip: 'Edit',
            onClick: () => navigate(`/admins/${admin.slug || ''}/edit`),
  },
  ...(currentUserId !== admin.id ? [{
    icon: <DeleteIcon />,
    tooltip: 'Delete',
    color: 'error' as const,
    onClick: () => handleDelete((admin.id || 0).toString()),
  }] : []),
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminListPage: React.FC = () => {
  // ========================================================================
  // HOOKS & STATE
  // ========================================================================
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: currentUser } = useAuthStore();
  const deleteMutation = useDeleteAdminUser();
  
  // Data and state
  const { filters, setFilter, resetFilters } = useFilters<AdminUserFilters>({ statusFilter: STATUS_OPTIONS.all });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  
  const { 
    isLoading, 
    error, 
    filteredData, 
    paginatedData, 
    totalCount 
  } = useListPageData(filters, page, rowsPerPage);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilter(key as keyof AdminUserFilters, value);
    handleChangePage(null, 0); // Reset to first page when filters change
  }, [setFilter, handleChangePage]);

  const handleDelete = useCallback(async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      try {
        await deleteMutation.mutateAsync(adminId);
      } catch (error) {
        console.error('Failed to delete admin user:', error);
      }
    }
  }, [deleteMutation]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
    handleChangePage(null, 0);
  }, [resetFilters, handleChangePage]);

  // ========================================================================
  // RENDER LOGIC
  // ========================================================================
  
  // Error state
  if (error) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader title={PAGE_CONFIG.title} />
        <PageErrorState 
          error={error}
          title="Failed to Load Admin Users"
          onRetry={handleRetry}
          onLogin={handleLogin}
        />
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader title={PAGE_CONFIG.title} />
        <PageLoadingState 
          title="Loading Admin Users"
          message="Please wait while we fetch the admin user data..."
        />
      </Box>
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      {/* Header */}
      <PageHeader 
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: () => navigate(PAGE_CONFIG.createButtonPath)
        }}
      />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        fields={FILTER_FIELDS}
      />

      {/* Content */}
      {filteredData.length === 0 ? (
        <PageEmptyState 
          title="No Admin Users Found"
          message="There are no admin users matching your current filters."
          actionButton={{
            text: "Clear Filters",
            onClick: handleClearFilters,
            icon: <ClearIcon />,
            variant: "outlined"
          }}
          secondaryActionButton={{
            text: "Add Admin User",
            onClick: () => navigate(PAGE_CONFIG.createButtonPath),
            icon: <AddIcon />,
            variant: "contained"
          }}
        />
      ) : isMobile ? (
        // Mobile View
        <Box sx={{ mt: 2 }}>
          {paginatedData.map((admin) => {
            if (!admin) return null;
            
            const status = getStatusDisplay(admin.is_active === true);
            
            return (
              <MobileCard
                key={admin.id || 'unknown'}
                title={getUserDisplayName(admin.name)}
                subtitle={getUserDisplayEmail(admin.email)}
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getUserInitials(admin.name || 'Unknown')}
                  </Avatar>
                }
                status={{
                  label: status.label,
                  color: status.color,
                }}
                actions={createMobileCardActions(admin, navigate, handleDelete, currentUser?.id)}
              />
            );
          })}
          
          <MobilePagination
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        // Desktop View
        <StandardTable
          columns={createTableColumns(navigate, handleDelete, currentUser?.id, deleteMutation.isPending)}
          data={paginatedData}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(admin) => admin.id || 0}
          emptyMessage="No admin users found"
        />
      )}
    </Box>
  );
};

export default AdminListPage; 