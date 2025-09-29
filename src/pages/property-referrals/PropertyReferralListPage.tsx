import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  AttachMoney as PriceIcon,
  Person as PersonIcon,
  Visibility as ViewCountIcon,
  Favorite as FavoriteIcon,
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useAlertSystem, useManualSearch } from '../../hooks';
import { usePropertyReferrals, usePropertyReferralStatistics, useExportPropertyReferrals } from '../../services/queries/propertyReferrals';
import { usePropertyTypes, usePropertyListingTypes } from '../../services/queries/properties';
import { useEmployees } from '../../services/queries/employees';
import { FilterState } from '../../constants/filters';
import { PropertyReferral } from '../../types/propertyReferral';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PropertyReferralFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  verificationFilter: string;
  propertyTypeFilter: string;
  listingTypeFilter: string;
  expiredFilter: string;
  isTrendingFilter: string;
  employeeNameFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Property Referrals',
  description: 'Manage property employee assignments and referrals',
} as const;

// Filter fields will be generated dynamically from API data
const createFilterFields = (propertyTypes: any[], listingTypes: any[], employees: any[]): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title, description, address, or employee name...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'sold', label: 'Sold' },
      { value: 'rented', label: 'Rented' },
    ],
  },
  {
    key: 'propertyTypeFilter',
    type: 'select',
    label: 'Property Type',
    options: [
      { value: 'all', label: 'All Types' },
      ...propertyTypes.map(type => ({
        value: type.slug,
        label: `${type.name_en} (${type.name_mm})`
      }))
    ],
  },
  {
    key: 'listingTypeFilter',
    type: 'select',
    label: 'Listing Type',
    options: [
      { value: 'all', label: 'All Listings' },
      ...listingTypes.map(type => ({
        value: type.slug,
        label: `${type.name_en} (${type.name_mm})`
      }))
    ],
  },
  {
    key: 'employeeFilter',
    type: 'select',
    label: 'Referral Employee',
    options: [
      { value: 'all', label: 'All Employees' },
      ...employees.map(employee => ({
        value: employee.id.toString(),
        label: `${employee.name} (${employee.employee_id})`
      }))
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PropertyReferralListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  // Manual search: only triggers on Enter key or search button click
  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');

  const { filters, setFilter } = useFilters<PropertyReferralFilters>({
    searchTerm: '', // This will be overridden by manual search
    statusFilter: 'all',
    propertyTypeFilter: 'all',
    listingTypeFilter: 'all',
    employeeFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted properties
  const [activeTab] = useState(0); // 0 = Active, 1 = Deleted

  // API Queries - Server-side filtering and pagination
  const { data: propertyReferralsResponse, isLoading, error } = usePropertyReferrals({
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term (now includes employee search)
    status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
    property_type: filters.propertyTypeFilter !== 'all' ? filters.propertyTypeFilter : undefined,
    listing_type: filters.listingTypeFilter !== 'all' ? filters.listingTypeFilter : undefined,
    employee_id: filters.employeeFilter !== 'all' ? filters.employeeFilter : undefined,
    deleted: activeTab === 1 ? 'true' : undefined, // Show deleted properties when tab 1 is active
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Property referral statistics for dashboard cards
  const { data: statistics } = usePropertyReferralStatistics();

  // Export mutation
  const exportMutation = useExportPropertyReferrals();

  // Master data queries
  const { data: propertyTypesResponse } = usePropertyTypes({
    per_page: 100, // Get all property types
  });

  const { data: listingTypesResponse } = usePropertyListingTypes({
    per_page: 100, // Get all listing types
  });

  const { data: employeesResponse } = useEmployees({
    per_page: 100, // Get all employees
  });

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract property referrals data (already filtered and paginated by server)
  const propertyReferrals = propertyReferralsResponse?.data || [];
  const pagination = propertyReferralsResponse?.pagination;
  
  // Extract master data
  const propertyTypes = propertyTypesResponse?.data || [];
  const listingTypes = listingTypesResponse?.data || [];
  const employees = employeesResponse?.data || [];
  
  // Create dynamic filter fields
  const filterFields = createFilterFields(propertyTypes, listingTypes, employees);

  // Server-side filtering and pagination - no client-side processing needed
  const filteredPropertyReferrals = propertyReferrals;
  const paginatedPropertyReferrals = propertyReferrals; // Already paginated by server

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Properties',
      value: statistics?.data?.total_count || 0,
      color: 'primary',
      icon: <HomeIcon />,
    },
    {
      title: 'Total Employees',
      value: statistics?.data?.employees_with_assignments || 0,
      color: 'secondary',
      icon: <PersonIcon />,
    },
    {
      title: 'Referral Properties',
      value: statistics?.data?.properties_with_assignments || 0,
      color: 'success',
      icon: <HomeIcon />,
    },
    {
      title: 'Referral Employees',
      value: statistics?.data?.referral_assignments || 0,
      color: 'info',
      icon: <PersonAddIcon />,
    },
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<PropertyReferral>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Property Name',
      width: '400px',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {property.title_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {property.title_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'employees',
      label: 'Referral Employees',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
            {property.employees.length > 0 ? (
              property.employees.map((employee) => (
                <Chip
                  key={employee.id}
                  label={employee.name}
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{
                    fontSize: '0.75rem',
                    height: '24px',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                  icon={
                    <PersonIcon 
                      sx={{ 
                        fontSize: '14px',
                        color: 'success.main'
                      }} 
                    />
                  }
                />
              ))
            ) : (
              <Chip
                label="No assignments"
                size="small"
                variant="outlined"
                color="default"
                sx={{
                  fontSize: '0.75rem',
                  height: '24px',
                  opacity: 0.6,
                }}
              />
            )}
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'propertyType',
      label: 'Property Type',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {property.property_type?.name_en || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {property.property_type?.name_mm || ''}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'listingType',
      label: 'Listing Type',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {property.listing_type?.name_en || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {property.listing_type?.name_mm || ''}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {property.location?.region?.name_en || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {property.location?.township?.name_en || 'N/A'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'price',
      label: 'Price',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PriceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {property.formatted_price || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'verificationStatus',
      label: 'Verification',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return <StatusChip status={property.verification_status} statusType="verification_status" />;
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return <StatusChip status={property.status} />;
      },
    },
    {
      id: 'viewCount',
      label: 'Views',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewCountIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {property.stats?.view_count || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'favoriteCount',
      label: 'Favorites',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="body2" fontWeight="500">
              {property.stats?.favorite_count || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'likeCount',
      label: 'Likes',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LikeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight="500">
              {property.stats?.like_count || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'commentCount',
      label: 'Comments',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CommentIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
            <Typography variant="body2" fontWeight="500">
              {property.stats?.comment_count || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'publishedAt',
      label: 'Published',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {property.dates?.published_at ? formatDate(property.dates.published_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Primary Actions - View Details and Edit (always visible for non-deleted) */}
            <Tooltip title="View Referral Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/property-referrals/${property.id}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [isMobile, navigate]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (property: PropertyReferral): MobileCardAction[] => {
    const isDeleted = property.is_deleted;
    
    const baseActions: MobileCardAction[] = [
      {
        icon: <ViewIcon />,
        tooltip: 'View Referral Details',
        color: 'primary' as const,
        onClick: () => navigate(`/property-referrals/${property.id}`),
      },
    ];
    
    if (!isDeleted) {
      baseActions.push({
        icon: <PersonAddIcon />,
        tooltip: 'Manage Assignments',
        color: 'secondary' as const,
        onClick: () => navigate(`/property-referrals/${property.id}/assignments`),
      });
    }
    
    return baseActions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  // Export handler
  const handleExport = async () => {
    try {
      const exportParams = {
        search: searchTerm || undefined,
        status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
        property_type: filters.propertyTypeFilter !== 'all' ? filters.propertyTypeFilter : undefined,
        listing_type: filters.listingTypeFilter !== 'all' ? filters.listingTypeFilter : undefined,
        employee_id: filters.employeeFilter !== 'all' ? filters.employeeFilter : undefined,
        deleted: activeTab === 1 ? 'true' : undefined,
        sort_by: 'created_at',
        sort_direction: 'desc' as const,
      };

      const response = await exportMutation.mutateAsync(exportParams);
      const blob = response.data as Blob;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `property-referrals-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export data. Please try again.');
    }
  };

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof PropertyReferralFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('statusFilter', 'all');
    setFilter('propertyTypeFilter', 'all');
    setFilter('listingTypeFilter', 'all');
    setFilter('employeeFilter', 'all');
    
    // Reset to first page
    handleChangePage({} as any, 0);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Error state - show inline error instead of full page error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Property Referrals"
          subtitle="Manage property employee assignments"
          actionButton={{
            text: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Property Referrals"
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
        breadcrumbs="Dashboard / Property Management / Property Referrals"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: exportMutation.isPending ? 'Exporting...' : 'Export to Excel',
          icon: <ExportIcon />,
          onClick: handleExport,
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={{
          ...filters,
          searchTerm: searchValue, // Use current search value for immediate UI feedback
        }}
        onFilterChange={handleFilterChange}
        fields={filterFields}
        searchHelperText={undefined}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={triggerSearch}
        showSearchButton={true}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            // Loading skeleton cards for mobile
            Array.from({ length: rowsPerPage }).map((_, index) => (
              <MobileCard
                key={`skeleton-${index}`}
                title=""
                loading={true}
                showRowNumber={true}
              />
            ))
          ) : filteredPropertyReferrals.length > 0 ? (
            paginatedPropertyReferrals.map((property, index) => (
              <MobileCard
                key={property.id}
                title={property.title_en}
                subtitle={property.title_mm}
                rowNumber={(page * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={property.description}
                avatar={<HomeIcon />}
                avatarColor="primary.main"
                status={{
                  label: property.status === 'published' ? 'Published' : 
                         property.status === 'draft' ? 'Draft' : 
                         property.status === 'sold' ? 'Sold' : 
                         property.status === 'rented' ? 'Rented' : 'Unknown',
                  color: 'default',
                }}
                chips={[
                  {
                    label: `${property.property_type?.name_en || 'N/A'} (${property.property_type?.name_mm || ''})`,
                    color: 'primary',
                  },
                  {
                    label: `${property.listing_type?.name_en || 'N/A'} (${property.listing_type?.name_mm || ''})`,
                    color: 'secondary',
                  },
                  {
                    label: property.formatted_price || 'N/A',
                    color: 'primary',
                  },
                  {
                    label: `👁️ ${property.stats?.view_count || 0} views`,
                    color: 'default',
                  },
                  {
                    label: `❤️ ${property.stats?.favorite_count || 0} favorites`,
                    color: 'error',
                  },
                  {
                    label: `👍 ${property.stats?.like_count || 0} likes`,
                    color: 'primary',
                  },
                  {
                    label: `💬 ${property.stats?.comment_count || 0} comments`,
                    color: 'secondary',
                  },
                  {
                    label: `${property.employees.length} employee${property.employees.length !== 1 ? 's' : ''} assigned`,
                    color: 'info',
                  },
                  ...property.employees.map(employee => ({
                    label: employee.name,
                    color: 'info' as const,
                  })),
                ]}
                actions={createMobileCardActions(property)}
                onClick={() => navigate(`/property-referrals/${property.id}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Property Referrals Found"
              message="No property referrals match your current filters. Try adjusting your search criteria."
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
        /* Desktop Table Layout */
        filteredPropertyReferrals.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Property Referrals Found"
            message={searchTerm || filters.statusFilter !== 'all' || filters.verificationFilter !== 'all' || filters.propertyTypeFilter !== 'all' || filters.listingTypeFilter !== 'all'
              ? "No property referrals match your current filters. Try adjusting your search criteria."
              : "No property referrals have been created yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={paginatedPropertyReferrals}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(property) => property.id}
          loading={isLoading}
          showRowNumbers={true}
          rowNumberLabel="No."
        />
        )
      )}
    </Box>
  );
};

export default PropertyReferralListPage;
