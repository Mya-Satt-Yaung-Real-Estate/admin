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
  Avatar,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
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
import { FilterState } from '../../constants/filters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AdminUser } from '../../types/admin';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AdminUserFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getUserInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '?';
  }
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatLastLogin = (dateString?: string): string => {
  if (!dateString) return 'Never';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ============================================================================
// FILTER CONFIGURATION
// ============================================================================

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
    options: [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

// ============================================================================
// TABLE COLUMNS CONFIGURATION
// ============================================================================

const createTableColumns = (
  navigate: (path: string) => void,
  handleDelete: (adminId: string) => void,
  currentUserId?: number,
  isDeleteLoading?: boolean
): TableColumn<AdminUser>[] => [
  {
    id: 'name',
    label: 'Name',
    render: (_value, admin, _index) => {
      if (!admin) return <Typography variant="body2">No data</Typography>;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            {getUserInitials(admin.name || 'Unknown')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {admin.name || 'Unknown Name'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {admin.email || 'No email'}
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    id: 'status',
    label: 'Status',
    render: (_value, admin, _index) => {
      if (!admin) return <Typography variant="body2">No data</Typography>;
      
      const isActive = admin.is_active === true;
      return (
        <Chip
          label={isActive ? 'Active' : 'Inactive'}
          color={isActive ? 'success' : 'default'}
          size="small"
        />
      );
    },
  },
  {
    id: 'last_login',
    label: 'Last Login',
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
    label: 'Actions',
    render: (_value, admin, _index) => {
      if (!admin) return <Typography variant="body2">No data</Typography>;
      
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/admins/${admin.id || 0}`)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/admins/${admin.id || 0}/edit`)}
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

// ============================================================================
// MOBILE CARD ACTIONS
// ============================================================================

const createMobileCardActions = (
  admin: AdminUser,
  navigate: (path: string) => void,
  handleDelete: (adminId: string) => void,
  currentUserId?: number
): MobileCardAction[] => [
  {
    icon: <ViewIcon />,
    tooltip: 'View Details',
    onClick: () => navigate(`/admins/${admin.id || 0}`),
  },
  {
    icon: <EditIcon />,
    tooltip: 'Edit',
    onClick: () => navigate(`/admins/${admin.id || 0}/edit`),
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
  
  // Filter and pagination hooks
  const { filters, setFilter } = useFilters<AdminUserFilters>({
    statusFilter: 'all',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // ========================================================================
  // DATA FETCHING
  // ========================================================================
  
  const { data: allAdminsData, isLoading, error } = useAdminUsers({
    per_page: 100, // API limit: cannot exceed 100
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================
  
  // Filter admin users
  const filteredAdmins = useMemo(() => {
    const admins = allAdminsData?.data || [];
    const validAdmins = admins.filter(admin => admin != null);
    
    return validAdmins.filter(admin => {
      // Search filter
      const matchesSearch = !filters.searchTerm || 
        (admin.name || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (admin.email || '').toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      // Status filter
      const isActive = admin.is_active === true;
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && isActive) ||
        (filters.statusFilter === 'inactive' && !isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [allAdminsData, filters.searchTerm, filters.statusFilter]);

  // Paginate filtered results
  const paginatedAdmins = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAdmins.slice(startIndex, endIndex);
  }, [filteredAdmins, page, rowsPerPage]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  const handleFilterChange = (key: string, value: string) => {
    setFilter(key as keyof AdminUserFilters, value);
    handleChangePage(null, 0); // Reset to first page when filters change
  };

  const handleDelete = async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      try {
        await deleteMutation.mutateAsync(adminId);
      } catch (error) {
        console.error('Failed to delete admin user:', error);
      }
    }
  };

  // ========================================================================
  // ERROR & LOADING STATES
  // ========================================================================
  
  if (error) {
    const isAuthError = (error as any)?.isAuthError || 
                       error.message?.includes('Authentication') ||
                       error.message?.includes('login');
    
    if (isAuthError) {
      return (
        <Box sx={{ marginLeft: 0, width: '100%' }}>
          <PageHeader title="Admin Users" />
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error.message}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      );
    }

    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader title="Admin Users" />
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading admin users: {error.message}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ marginLeft: 0, width: '100%' }}>
        <PageHeader title="Admin Users" />
        <LoadingSpinner />
      </Box>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      {/* Header */}
      <PageHeader 
        title="Admin Users" 
        actionButton={{
          text: 'Add Admin',
          icon: <AddIcon />,
          onClick: () => navigate('/admins/create')
        }}
      />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        fields={FILTER_FIELDS}
      />

      {/* Content */}
      {isMobile ? (
        // Mobile View
        <Box sx={{ mt: 2 }}>
          {paginatedAdmins.map((admin) => {
            if (!admin) return null;
            
            return (
              <MobileCard
                key={admin.id || 'unknown'}
                title={admin.name || 'Unknown Name'}
                subtitle={admin.email || 'No email'}
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getUserInitials(admin.name || 'Unknown')}
                  </Avatar>
                }
                status={{
                  label: (admin.is_active === true) ? 'Active' : 'Inactive',
                  color: (admin.is_active === true) ? 'success' : 'default',
                }}
                actions={createMobileCardActions(admin, navigate, handleDelete, currentUser?.id)}
              />
            );
          })}
          
          <MobilePagination
            totalCount={filteredAdmins.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        // Desktop View
        <StandardTable
          columns={createTableColumns(navigate, handleDelete, currentUser?.id, deleteMutation.isPending)}
          data={paginatedAdmins}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredAdmins.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(admin) => admin.id || 0}
        />
      )}
    </Box>
  );
};

export default AdminListPage; 