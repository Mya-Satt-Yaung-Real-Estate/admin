import React, { useMemo, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as ViewIcon,
  Gavel as LawyerIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useLawyers, useDeleteLawyer, useRestoreLawyer } from '../../services/queries/lawyers';
import { FilterState } from '../../constants/filters';
import { Lawyer } from '../../types/lawyer';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LawyerFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  regionFilter: string;
  specializationFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Lawyer Management',
  description: 'Manage lawyers and legal professionals',
  createButtonText: 'Add Lawyer',
  createButtonPath: '/lawyers/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name, title, or specialization...',
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
    key: 'regionFilter',
    type: 'select',
    label: 'Region',
    options: [
      { value: 'all', label: 'All Regions' },
      // This would be populated from API in real implementation
      { value: 'yangon', label: 'Yangon' },
      { value: 'mandalay', label: 'Mandalay' },
    ],
  },
  {
    key: 'specializationFilter',
    type: 'select',
    label: 'Specialization',
    options: [
      { value: 'all', label: 'All Specializations' },
      { value: 'property', label: 'Property Law' },
      { value: 'criminal', label: 'Criminal Law' },
      { value: 'corporate', label: 'Corporate Law' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const LawyerListPage: React.FC = () => {
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
  } = useFilters<LawyerFilters>({
    searchTerm: '',
    statusFilter: 'all',
    regionFilter: 'all',
    specializationFilter: 'all',
  });

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // API Queries
  const { data: lawyersResponse, isLoading, error } = useLawyers({
    page: page + 1,
    per_page: rowsPerPage,
    search: filters.searchTerm || undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Delete mutation
  const deleteLawyerMutation = useDeleteLawyer();
  const restoreLawyerMutation = useRestoreLawyer();

  // Extract lawyers data - handle different response structures
  const lawyers: Lawyer[] = (() => {
    if (!lawyersResponse?.data) return [];
    
    // If data is an array, return it directly
    if (Array.isArray(lawyersResponse.data)) {
      return lawyersResponse.data;
    }
    
    // If data is an object with a data property, return that
    if (lawyersResponse.data.data && Array.isArray(lawyersResponse.data.data)) {
      return lawyersResponse.data.data;
    }
    
    return [];
  })();
  
  const pagination = lawyersResponse?.data?.pagination || lawyersResponse?.pagination;

  // Debug: Log the response structure to help identify the issue
  if (lawyersResponse && lawyers.length === 0) {
    console.log('🔍 Debug - API Response Structure:', {
      fullResponse: lawyersResponse,
      hasData: !!lawyersResponse.data,
      dataType: typeof lawyersResponse.data,
      isArray: Array.isArray(lawyersResponse.data),
      dataKeys: lawyersResponse.data ? Object.keys(lawyersResponse.data) : 'no data',
      extractedLawyers: lawyers,
      lawyersLength: lawyers.length
    });
  }

  // Filter lawyers using client-side filtering for additional filters
  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && lawyer.status) ||
        (filters.statusFilter === 'inactive' && !lawyer.status);
      
      const matchesRegion = filters.regionFilter === 'all' || 
        lawyer.region.name_en.toLowerCase().includes(filters.regionFilter.toLowerCase());
      
      const matchesSpecialization = filters.specializationFilter === 'all' || 
        lawyer.specialization.toLowerCase().includes(filters.specializationFilter.toLowerCase());
      
      return matchesStatus && matchesRegion && matchesSpecialization;
    });
  }, [lawyers, filters]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Lawyers',
      value: lawyers.length,
      color: 'primary',
      icon: <LawyerIcon />,
    },
    {
      title: 'Active Lawyers',
      value: lawyers.filter(lawyer => lawyer.status).length,
      color: 'success',
      icon: <PersonIcon />,
    },
    {
      title: 'Inactive Lawyers',
      value: lawyers.filter(lawyer => !lawyer.status).length,
      color: 'warning',
      icon: <WorkIcon />,
    },
  ], [lawyers]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  // Delete handler
  const handleDelete = useCallback((lawyer: Lawyer) => {
    openDeleteConfirmation(
      lawyer.name,
      'lawyer',
      async () => {
        try {
          await deleteLawyerMutation.mutateAsync(lawyer.slug);
          showSuccess(`${lawyer.name} deleted successfully!`);
        } catch (error: any) {
          showError(error.message || 'Failed to delete lawyer. Please try again.');
        }
      }
    );
  }, [openDeleteConfirmation, deleteLawyerMutation, showSuccess, showError]);

  // Restore handler
  const handleRestore = useCallback(async (lawyer: Lawyer) => {
    try {
      await restoreLawyerMutation.mutateAsync(lawyer.slug);
      showSuccess(`${lawyer.name} restored successfully!`);
    } catch (error: any) {
      showError(error.message || 'Failed to restore lawyer. Please try again.');
    }
  }, [restoreLawyerMutation, showSuccess, showError]);

  // Filter change handler
  const handleFilterChange = (key: string, value: string) => {
    setFilter(key as keyof LawyerFilters, value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilter('searchTerm', '');
    setFilter('statusFilter', 'all');
    setFilter('regionFilter', 'all');
    setFilter('specializationFilter', 'all');
    handleChangePage({} as any, 0);
  };

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Lawyer>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Lawyer | Title',
      width: '350px',
      render: (_value, lawyer) => {
        if (!lawyer) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={lawyer.images}
              sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
            >
              {lawyer.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="subtitle2" fontWeight="600">
                {lawyer.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {lawyer.title}
              </Typography>
            </Box>
          </Box>
        );
      },
    },

    {
      id: 'specialization',
      label: 'Specialization',
      width: '200px',
      render: (_value, lawyer) => {
        if (!lawyer) return <Typography variant="body2">No data</Typography>;
        return (
          <Chip
            label={lawyer.specialization}
            color="primary"
            variant="outlined"
            size="small"
          />
        );
      },
      hidden: isMobile,
    },

    {
      id: 'location',
      label: 'Region | Township',
      width: '250px',
      render: (_value, lawyer) => {
        if (!lawyer) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" fontWeight="500">
                {lawyer.region.name_en}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {lawyer.township.name_en}
              </Typography>
            </Box>
          </Box>
        );
      },
      hidden: isMobile,
    },

    {
      id: 'contact',
      label: 'Phone | Email',
      width: '250px',
      render: (_value, lawyer) => {
        if (!lawyer) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {lawyer.phone && (
              <Typography variant="body2" fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                {lawyer.phone}
              </Typography>
            )}
            {lawyer.email && (
              <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                {lawyer.email}
              </Typography>
            )}
            {!lawyer.phone && !lawyer.email && (
              <Typography variant="caption" color="textSecondary">
                No contact info
              </Typography>
            )}
          </Box>
        );
      },
      hidden: isMobile,
    },

    {
      id: 'status',
      label: 'Status',
      width: '120px',
      render: (_value, lawyer) => {
        if (!lawyer) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={lawyer.status ? 'active' : 'inactive'} 
            statusType="status"
          />
        );
      },
    },

    {
      id: 'actions',
      label: 'Actions',
      width: '150px',
      align: 'center',
      render: (_value, lawyer) => {
        if (!lawyer) return <Typography variant="body2">No data</Typography>;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* View Details */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/lawyers/${lawyer.slug}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            
            {/* Edit */}
            <Tooltip title="Edit Lawyer">
              <IconButton
                size="small"
                onClick={() => navigate(`/lawyers/${lawyer.slug}/edit`)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            {/* Delete/Restore */}
            {lawyer.deleted_at ? (
              <Tooltip title="Restore Lawyer">
                <IconButton
                  size="small"
                  onClick={() => handleRestore(lawyer)}
                  color="success"
                  disabled={restoreLawyerMutation.isPending}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Delete Lawyer">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(lawyer)}
                  color="error"
                  disabled={deleteLawyerMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [navigate, handleDelete, handleRestore, deleteLawyerMutation.isPending, restoreLawyerMutation.isPending, isMobile]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = useCallback((lawyer: Lawyer): MobileCardAction[] => {
    return [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/lawyers/${lawyer.slug}`),
      },
      {
        icon: <EditIcon />,
        tooltip: 'Edit Lawyer',
        color: 'primary' as const,
        onClick: () => navigate(`/lawyers/${lawyer.slug}/edit`),
      },
      {
        icon: lawyer.deleted_at ? <RestoreIcon /> : <DeleteIcon />,
        tooltip: lawyer.deleted_at ? 'Restore Lawyer' : 'Delete Lawyer',
        color: lawyer.deleted_at ? 'success' as const : 'error' as const,
        onClick: () => lawyer.deleted_at ? handleRestore(lawyer) : handleDelete(lawyer),
      },
    ];
  }, [navigate, handleDelete, handleRestore]);

  // ========================================================================
  // RENDER
  // ========================================================================

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Lawyers"
          subtitle="Manage lawyers"
          actionButton={{
            text: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Lawyers"
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
        breadcrumbs="Dashboard / Lawyer Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: () => navigate(PAGE_CONFIG.createButtonPath)
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <StatisticsCards cards={statsCards} />

      <StandardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        fields={FILTER_FIELDS}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            Array.from({ length: rowsPerPage }).map((_, index) => (
              <MobileCard
                key={`skeleton-${index}`}
                title=""
                loading={true}
                showRowNumber={true}
              />
            ))
          ) : filteredLawyers.length > 0 ? (
            filteredLawyers.map((lawyer, index) => (
              <MobileCard
                key={lawyer.id}
                title={lawyer.name}
                subtitle={lawyer.title}
                rowNumber={index + 1}
                showRowNumber={true}
                description={lawyer.specialization}
                avatar={<Avatar src={lawyer.images} sx={{ bgcolor: 'primary.main' }}>{lawyer.name.charAt(0).toUpperCase()}</Avatar>}
                avatarColor="primary.main"
                status={{
                  label: lawyer.status ? 'Active' : 'Inactive',
                  color: lawyer.status ? 'success' : 'warning',
                }}
                chips={[
                  {
                    label: `${lawyer.experience_years} years exp`,
                    color: 'info',
                  },
                  {
                    label: lawyer.township.name_en,
                    color: 'secondary',
                  },
                  {
                    label: lawyer.created_at ? formatDate(lawyer.created_at, 'display') : 'N/A',
                    color: 'default',
                  },
                ]}
                actions={createMobileCardActions(lawyer)}
                onClick={() => navigate(`/lawyers/${lawyer.slug}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Lawyers Found"
              message="No lawyers match your current filters. Try adjusting your search criteria."
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
        filteredLawyers.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Lawyers Found"
            message={filters.searchTerm || filters.statusFilter !== 'all' || filters.regionFilter !== 'all' || filters.specializationFilter !== 'all'
              ? "No lawyers match your current filters. Try adjusting your search criteria."
              : "No lawyers have been added yet."
            }
          />
        ) : (
          <StandardTable
            columns={columns}
            data={filteredLawyers}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={pagination?.total || 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(lawyer) => lawyer.id}
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
        isLoading={deleteLawyerMutation.isPending}
        error={deleteLawyerMutation.error?.message}
      />
    </Box>
  );
};

export default LawyerListPage;
