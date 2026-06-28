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
import { AD, getAdCompanyColumnInfo, isAdEndDateBeforeToday } from '../../types/ad';
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

function formatAdScheduleDate(value?: string | null): string {
  return value ? formatDate(value, 'display') : '—';
}

function formatAdDisplayLocation(ad: AD): string {
  if (ad.display_location === 'home_grid_ads') {
    return ad.grid_index != null ? `Home Grid ADS · Grid ${ad.grid_index}` : 'Home Grid ADS';
  }
  if (ad.display_location === 'homepage_block') {
    return ad.grid_index != null ? `Homepage Block · ${ad.grid_index === 1 ? 'Left' : ad.grid_index === 2 ? 'Right' : `Slot ${ad.grid_index}`}` : 'Homepage Block';
  }
  if (ad.display_location === 'detail-page-asidebar') return 'Detail Page Sidebar 1';
  if (ad.display_location === 'detail-page-asidebar-2') return 'Detail Page Sidebar 2';
  if (ad.display_location === 'home-page-asidebar') return 'Home page Main Slider';
  return String(ad.display_location).replace(/-/g, ' ');
}

/** Labels for display location filter (API values unchanged). */
const DISPLAY_LOCATION_FILTER_LABELS: Record<string, string> = {
  homepage_block: 'Homepage Block',
  'home-page-asidebar': 'Home page Main Slider',
  'detail-page-asidebar': 'Detail Page Sidebar 1',
  'detail-page-asidebar-2': 'Detail Page Sidebar 2',
  home_grid_ads: 'Home Grid ADS',
};

function displayLocationFilterTitle(filterValue: string): string {
  return DISPLAY_LOCATION_FILTER_LABELS[filterValue] ?? filterValue.replace(/-/g, ' ');
}

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
      { value: 'homepage_block', label: 'Homepage Block' },
      { value: 'home-page-asidebar', label: 'Home page Main Slider' },
      { value: 'detail-page-asidebar', label: 'Detail Page Sidebar 1' },
      { value: 'detail-page-asidebar-2', label: 'Detail Page Sidebar 2' },
      { value: 'home_grid_ads', label: 'Home Grid ADS' },
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
      title: 'Homepage Block',
      value: ads.filter(ad => ad.display_location === 'homepage_block').length,
      color: 'warning',
      icon: <BusinessIcon />,
    },
    {
      title: 'Home page Main Slider',
      value: ads.filter(ad => ad.display_location === 'home-page-asidebar').length,
      color: 'info',
      icon: <BusinessIcon />,
    },
    {
      title: 'Detail Page Sidebar 1',
      value: ads.filter(ad => ad.display_location === 'detail-page-asidebar').length,
      color: 'secondary',
      icon: <BusinessIcon />,
    },
    {
      title: 'Detail Page Sidebar 2',
      value: ads.filter(ad => ad.display_location === 'detail-page-asidebar-2').length,
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
              {ad.title_en || 'Untitled'}
            </Typography>
            {ad.title_mm && (
              <Typography variant="caption" color="textSecondary">
                {ad.title_mm}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'company',
      label: 'Company',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;

        const companyInfo = getAdCompanyColumnInfo(ad);
        if (!companyInfo) {
          return (
            <Typography variant="body2" color="textSecondary">
              —
            </Typography>
          );
        }

        return (
          <Box sx={{ maxWidth: 220, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="600">
              {companyInfo.userName}  
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              {companyInfo.companyName}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              {companyInfo.phone}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        const lineClampSx = {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          wordBreak: 'break-word' as const,
        };
        return (
          <Box sx={{ maxWidth: 320, minWidth: 0 }}>
            <Typography variant="body2" sx={lineClampSx}>
              {ad.description_en || 'No description'}
            </Typography>
            {ad.description_mm && (
              <Typography variant="caption" color="textSecondary" sx={{ ...lineClampSx, mt: 0.25 }}>
                {ad.description_mm}
              </Typography>
            )}
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
            {formatAdDisplayLocation(ad)}
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
      id: 'startAt',
      label: 'Start',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatAdScheduleDate(ad.start_at)}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'endAt',
      label: 'End',
      render: (_value, ad) => {
        if (!ad) return <Typography variant="body2">No data</Typography>;
        const overdue = isAdEndDateBeforeToday(ad.end_at);
        return (
          <Typography variant="body2" color={overdue ? 'error' : 'textSecondary'}>
            {formatAdScheduleDate(ad.end_at)}
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
    navigate(`/ads/${ad.id}`);
  };

  const handleEdit = (ad: AD) => {
    navigate(`/ads/${ad.id}/edit`);
  };

  const handleDelete = (ad: AD) => {

    console.log('Hello World Delete=>', ad);

    openDeleteConfirmation(
      'AD',
      ad.title_en || 'Untitled',
      async () => {
        try {
          await deleteADMutation.mutateAsync(ad.id);
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
          ? `${displayLocationFilterTitle(filters.displayLocationFilter)} ADs Management`
          : PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs={`Dashboard / ADs / ${filters.displayLocationFilter !== 'all'
          ? `${displayLocationFilterTitle(filters.displayLocationFilter)} ADs`
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
              title={ad.title_en || 'Untitled'}
              subtitle={ad.title_mm || ''}
              description={ad.description_en ? `${ad.description_en.substring(0, 100)}...` : 'No description'}
              actions={getMobileCardActions(ad)}
              chips={[
                { label: formatAdDisplayLocation(ad), color: 'primary' },
                { label: ad.status ? 'Active' : 'Inactive', color: ad.status ? 'primary' : 'default' },
              ]}
            >
              <Box sx={{ mt: 1 }}>
                {(() => {
                  const companyInfo = getAdCompanyColumnInfo(ad);
                  if (!companyInfo) return null;

                  return (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        User: {companyInfo.userName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Company: {companyInfo.companyName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Phone: {companyInfo.phone}
                      </Typography>
                    </Box>
                  );
                })()}
                <Typography variant="caption" color="textSecondary" display="block">
                  Start: {formatAdScheduleDate(ad.start_at)}
                </Typography>
                <Typography
                  variant="caption"
                  color={isAdEndDateBeforeToday(ad.end_at) ? 'error' : 'textSecondary'}
                  display="block"
                >
                  End: {formatAdScheduleDate(ad.end_at)}
                </Typography>
              </Box>
            </MobileCard>
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