import React, { useMemo, useEffect } from 'react';
import {
  Box,
  IconButton,
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
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useCompanyTypes, useDeleteCompanyType } from '../../services/queries/companies';
import { FilterState } from '../../constants/filters';
import { CompanyType } from '../../types/company';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CompanyTypeFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Company Type Management',
  description: 'Manage company types and categories',
  createButtonText: 'Add Company Type',
  createButtonPath: '/company-types/create',
} as const;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name or description...',
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
];

// ============================================================================
// COMPONENT
// ============================================================================

const CompanyTypeListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Hooks
  const { filters, setFilter } = useFilters<CompanyTypeFilters>();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation, handleConfirmDelete } = useDeleteConfirmation();

  // Queries
  const { data: companyTypesData, isLoading, error, refetch } = useCompanyTypes();
  const deleteCompanyTypeMutation = useDeleteCompanyType();

  // Handle URL parameters for success messages
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage), true);
      // Clean up the URL by removing the success parameter
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('success');
      const newUrl = location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : '');
      navigate(newUrl, { replace: true });
    }
  }, [location.search, showSuccess, navigate]);

  // Computed values
  const companyTypes = companyTypesData?.data || [];

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return companyTypes.filter((item: CompanyType) => {
      const matchesSearch = filters.searchTerm === '' || 
        item.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && item.is_active) ||
        (filters.statusFilter === 'inactive' && !item.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [companyTypes, filters]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Company Types',
      value: companyTypes.length.toString(),
      color: 'primary',
      icon: <BusinessIcon />,
    },
    {
      title: 'Active Types',
      value: companyTypes.filter(t => t.is_active).length.toString(),
      color: 'success',
      icon: <BusinessIcon />,
    },
    {
      title: 'Inactive Types',
      value: companyTypes.filter(t => !t.is_active).length.toString(),
      color: 'warning',
      icon: <BusinessIcon />,
    },
  ], [companyTypes]);

  // Event handlers
  const handleCreate = () => navigate(PAGE_CONFIG.createButtonPath);
  const handleView = (companyType: CompanyType) => navigate(`/company-types/${companyType.slug}`);
  const handleEdit = (companyType: CompanyType) => navigate(`/company-types/${companyType.slug}/edit`);
  
  const handleDelete = (companyType: CompanyType) => {
    openDeleteConfirmation(companyType.name_en, 'company type', async () => {
      try {
        const response = await deleteCompanyTypeMutation.mutateAsync(companyType.slug);
        showSuccess(response.message || 'Company type deleted successfully!', true);
      } catch (error: any) {
        showError(error?.message || 'Failed to delete company type', true);
      }
    });
  };

  // Create mobile card actions for a specific company type
  const createMobileCardActions = (companyType: CompanyType): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View Details',
      onClick: () => handleView(companyType),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      onClick: () => handleEdit(companyType),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      onClick: () => handleDelete(companyType),
      color: 'error',
    },
  ];

  // Table columns
  const columns: TableColumn<CompanyType>[] = [
    {
      id: 'name_en',
      label: 'Name (English)',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.name_mm}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (value) => (
        <Typography variant="body2" color="textSecondary">
          {value || 'No description'}
        </Typography>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      align: 'center',
      render: (_, row) => <StatusChip status={row.is_active ? 'active' : 'inactive'} />,
    },
    {
      id: 'created_at',
      label: 'Created',
      align: 'center',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Loading state
  if (isLoading) {
    return <PageLoadingState />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        title="Failed to Load Company Types"
        message={error?.message || 'An error occurred while loading company types'}
        onRetry={refetch}
        error={error}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleCreate,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof CompanyTypeFilters, value)}
        fields={FILTER_FIELDS}
      />

      {/* Content */}
      {filteredData.length === 0 ? (
        <PageEmptyState
          title="No Company Types Found"
          message="No company types match your current filters. Try adjusting your search criteria."
          actionButton={{
            text: 'Add Company Type',
            onClick: handleCreate,
          }}
        />
      ) : (
        <>
          {isMobile ? (
            <Box>
              {paginatedData.map((companyType) => (
                <MobileCard
                  key={companyType.id}
                  title={companyType.name_en}
                  subtitle={companyType.name_mm}
                  description={companyType.description || 'No description'}
                  avatar={<BusinessIcon />}
                  avatarColor="primary.main"
                  status={{
                    label: companyType.is_active ? 'Active' : 'Inactive',
                    color: companyType.is_active ? 'success' : 'error',
                  }}
                  actions={createMobileCardActions(companyType)}
                  onClick={() => handleView(companyType)}
                  clickable={true}
                />
              ))}
              <Pagination
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredData.length}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showResultsInfo={true}
              />
            </Box>
          ) : (
            <StandardTable
              columns={columns}
              data={paginatedData}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={filteredData.length}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onRowClick={handleView}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        title="Delete Company Type"
        message={`Are you sure you want to delete ${deleteState.itemName}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteConfirmation}
        isLoading={deleteCompanyTypeMutation.isPending}
      />
    </Box>
  );
};

export default CompanyTypeListPage;
