import React, { useMemo } from 'react';
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
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import {
  StatusChip,
  PageLoadingState,
  PageErrorState,
  PageEmptyState,
  DeleteConfirmationDialog,
  ActionAlert
} from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useADs, useDeleteAD } from '../../services/queries/ad';
import { FilterState } from '../../constants/filters';
import { AD } from '../../types/ad';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ADFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  displayLocationFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'AD Management',
  description: 'Manage all advertisements in the system',
  createButtonText: 'Add AD',
  createButtonPath: '/ads/create',
} as const;

const createFilterFields = (): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title or description...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
  {
    key: 'displayLocationFilter',
    type: 'select',
    label: 'Display Location',
    options: [
      { value: 'all', label: 'All Locations' },
      { value: 'homepage-slider', label: 'Homepage Slider' },
      { value: 'home-page-asidebar', label: 'Home Page Sidebar' },
      { value: 'detail-page-asidebar', label: 'Detail Page Sidebar' },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ADListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL parameters
  const initialFilters = {
    searchTerm: searchParams.get('search') || '',
    statusFilter: searchParams.get('status') || 'all',
    displayLocationFilter: searchParams.get('location') || 'all',
  };

  const { filters, setFilter } = useFilters<ADFilters>(initialFilters);

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // API Queries
  const { data: adsResponse, isLoading, error, refetch } = useADs({
    per_page: 100, // Get all ads for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Mutations
  const deleteADMutation = useDeleteAD();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete: handleDeleteConfirm,
  } = useDeleteConfirmation();

  // Handle success message from URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      // Clear the success parameter from URL
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('success');
      navigate(`${location.pathname}${newSearch.toString() ? '?' + newSearch.toString() : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract ads data
  const ads = adsResponse?.data || [];

  // Create filter fields
  const filterFields = createFilterFields();

  // Filter ads using client-side filtering
  const filteredADs = useMemo(() => {
    if (!ads || ads.length === 0) return [];

    const validADs = ads.filter(ad => ad != null);

    return validADs.filter(ad => {
      const searchTerm = filters.searchTerm || '';
      const matchesSearch =
        (ad.title_en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.title_mm || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.description_en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.description_mm || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.statusFilter === 'all' ||
        String(ad.status) === filters.statusFilter;

      const matchesDisplayLocation = filters.displayLocationFilter === 'all' ||
        ad.display_location === filters.displayLocationFilter;

      return matchesSearch && matchesStatus && matchesDisplayLocation;
    });
  }, [ads, filters]);

  // Paginate data
  const paginatedADs = useMemo(() => {
    return filteredADs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredADs, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total ADs',
      value: ads.length,
      color: 'primary',
      icon: <BusinessIcon />,
    },
    {
      title: 'Active ADs',
      value: ads.filter(ad => ad.status).length,
      color: 'primary',
      icon: <BusinessIcon />,
    },
    {
      title: 'Paid ADs',
      value: ads.filter(ad => ad.is_paid).length,
      color: 'primary', // green color
      icon: <BusinessIcon />,
    },
    {
      title: 'Homepage Slider',
      value: ads.filter(ad => ad.display_location === 'homepage-slider').length,
      color: 'warning',
      icon: <BusinessIcon />,
    },
    {
      title: 'Homepage Sidebar',
      value: ads.filter(ad => ad.display_location === 'home-page-asidebar').length,
      color: 'info',
      icon: <BusinessIcon />,
    },
    {
      title: 'Detail Page Sidebar',
      value: ads.filter(ad => ad.display_location === 'detail-page-asidebar').length,
      color: 'secondary',
      icon: <BusinessIcon />,
    },
  ], [ads]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<AD>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {ad.title_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {ad.title_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" noWrap>
              {ad.description_en}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap>
              {ad.description_mm}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'displayLocation',
      label: 'Display Location',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" textTransform="capitalize">
            {ad.display_location === 'detail-page-asidebar' ? 'DetailPage Sidebar' :
             ad.display_location === 'home-page-asidebar' ? 'HomePage Sidebar' :
             ad.display_location.replace('-', ' ')}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={ad.status ? 'active' : 'inactive'} 
            statusType="status" 
          />
        );
      },
    },
    {
      id: 'payment',
      label: 'Payment',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Box
              component="span"
              sx={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: ad.is_paid ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', // light green or light red background
                color: ad.is_paid ? '#4CAF50' : '#F44336', // green or red text
                border: `1px solid ${ad.is_paid ? '#4CAF50' : '#F44336'}`, // green or red border
              }}
            >
              {ad.is_paid ? 'Paid' : 'Unpaid'}
            </Box>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'publishing',
      label: 'Published',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={ad.is_published ? 'published' : 'draft'} 
            statusType="verification_status" 
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(ad.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;

        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => handleView(ad)}
                color="primary"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEdit(ad)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDelete(ad)}
                color="error"
                disabled={deleteADMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [isMobile]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const getMobileCardActions = (ad: AD): MobileCardAction[] => {
    const actions: MobileCardAction[] = [
      {
        tooltip: 'View Details',
        icon: <VisibilityIcon />,
        onClick: () => handleView(ad),
        color: 'primary',
      },
      {
        tooltip: 'Edit',
        icon: <EditIcon />,
        onClick: () => handleEdit(ad),
        color: 'secondary',
      },
      {
        tooltip: 'Delete',
        icon: <DeleteIcon />,
        onClick: () => handleDelete(ad),
        color: 'error',
      }
    ];

    return actions;
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleView = (ad: AD) => {
    navigate(`/ads/${ad.slug}`);
  };

  const handleEdit = (ad: AD) => {
    navigate(`/ads/${ad.slug}/edit`);
  };

  const handleDelete = (ad: AD) => {

    console.log('Hello World Delete=>', ad);

    openDeleteConfirmation(
      'AD',
      ad.title_en,
      async () => {
        try {
          await deleteADMutation.mutateAsync(ad.slug);
          showSuccess('AD deleted successfully');
        } catch (error: any) {
          // Extract API response message
          let errorMessage = 'Failed to delete AD';

          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.errors) {
            // Extract specific field errors
            const fieldErrors = error.response.data.errors;
            const firstErrorField = Object.keys(fieldErrors)[0];
            if (firstErrorField) {
              errorMessage = fieldErrors[firstErrorField][0];
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          showError(errorMessage);
        }
      }
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return <PageLoadingState />;
  }

  if (error) {
    return <PageErrorState error={error} onRetry={refetch} />;
  }

  return (
    <Box>
      {/* Alert System */}
      <ActionAlert
        success={alert.success}
        error={alert.error}
        onClose={clearAlert}
      />

      {/* Page Header */}
      <PageHeader
        title={filters.displayLocationFilter !== 'all'
          ? `${filters.displayLocationFilter.replace('homepage', 'Home Page ').replace('home-page', 'Home Page ').replace('detail-page', 'Detail Page ').replace('asidebar', 'Sidebar')} ADs Management`
          : PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs={`Dashboard / ADs / ${filters.displayLocationFilter !== 'all'
          ? filters.displayLocationFilter.replace('homepage', 'Home Page ').replace('home-page', 'Home Page ').replace('detail-page', 'Detail Page ').replace('asidebar', 'Sidebar') + ' ADs'
          : 'All ADs'}`}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: () => navigate(PAGE_CONFIG.createButtonPath),
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        fields={filterFields}
        filters={filters}
        onFilterChange={(key, value) => {
          setFilter(key as keyof ADFilters, value);

          // Update URL parameters to reflect filter changes
          const newSearchParams = new URLSearchParams(searchParams);

          if (key === 'searchTerm' && value) {
            newSearchParams.set('search', String(value));
          } else if (key === 'searchTerm' && !value) {
            newSearchParams.delete('search');
          }

          if (key === 'statusFilter' && value && value !== 'all') {
            newSearchParams.set('status', String(value));
          } else if (key === 'statusFilter' && (!value || value === 'all')) {
            newSearchParams.delete('status');
          }

          if (key === 'displayLocationFilter' && value && value !== 'all') {
            newSearchParams.set('location', String(value));
          } else if (key === 'displayLocationFilter' && (!value || value === 'all')) {
            newSearchParams.delete('location');
          }

          // Only update the URL if there were changes
          if (newSearchParams.toString() !== searchParams.toString()) {
            setSearchParams(newSearchParams);
          }
        }}
      />

      {/* Content */}
      {filteredADs.length === 0 ? (
        <PageEmptyState
          title="No ADs Found"
          message="No advertisements match your current filters."
          actionButton={{
            text: 'Add AD',
            icon: <AddIcon />,
            onClick: () => navigate(PAGE_CONFIG.createButtonPath),
          }}
        />
      ) : isMobile ? (
        // Mobile Cards
        <Box>
          {paginatedADs.map((ad: AD) => (
            <MobileCard
              key={ad.id}
              title={ad.title_en}
              subtitle={ad.title_mm}
              description={`${ad.description_en.substring(0, 100)}...`}
              actions={getMobileCardActions(ad)}
              chips={[
                { label: ad.display_location === 'detail-page-asidebar' ? 'DetailPage Sidebar' :
                         ad.display_location === 'home-page-asidebar' ? 'HomePage Sidebar' :
                         ad.display_location.replace('-', ' '), color: 'primary' },
                { label: ad.status ? 'Active' : 'Inactive', color: ad.status ? 'primary' : 'default' },
                { label: ad.is_paid ? 'Paid' : 'Unpaid', color: ad.is_paid ? 'primary' : 'error' },
              ]}
            />
          ))}
        </Box>
      ) : (
        // Desktop Table
        <StandardTable
          columns={columns}
          data={paginatedADs}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredADs.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteState.open}
        itemType={deleteState.itemType}
        itemName={deleteState.itemName}
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteConfirmation}
      />
    </Box>
  );
};

export default ADListPage;