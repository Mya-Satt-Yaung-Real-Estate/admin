import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,

  AttachMoney as PriceIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
  Visibility as ViewCountIcon,
  Favorite as FavoriteIcon,
  ThumbUp as LikeIcon,
  Comment as CommentIcon,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ConfirmationDialog, VerificationActions, ActionAlert, RenewButton, RenewConfirmationDialog, CommentsModal } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem, useManualSearch } from '../../hooks';
import { useProperties, usePropertyStatistics, useDeleteProperty, useRestoreProperty, useRenewProperty, usePropertyTypes, usePropertyListingTypes } from '../../services/queries/properties';
import { FilterState } from '../../constants/filters';
import { Property } from '../../types/property';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PropertyFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  verificationFilter: string;
  propertyTypeFilter: string;
  listingTypeFilter: string;
  expiredFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Property Management',
  description: 'Manage real estate properties',
  createButtonText: 'Add Property',
  createButtonPath: '/properties/create',
} as const;

// Filter fields will be generated dynamically from API data
const createFilterFields = (propertyTypes: any[], listingTypes: any[]): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title, description, or address...',
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
    key: 'verificationFilter',
    type: 'select',
    label: 'Verification',
    options: [
      { value: 'all', label: 'All Verifications' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
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
    key: 'expiredFilter',
    type: 'select',
    label: 'Expiry Status',
    options: [
      { value: 'all', label: 'All Properties' },
      { value: 'expired', label: 'Expired Only' },
      { value: 'active', label: 'Active Only' },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PropertyListPage: React.FC = () => {
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

  const { filters, setFilter } = useFilters<PropertyFilters>({
    searchTerm: '', // This will be overridden by manual search
    statusFilter: 'all',
    verificationFilter: 'all',
    propertyTypeFilter: 'all',
    listingTypeFilter: 'all',
    expiredFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted properties
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [propertyToRestore, setPropertyToRestore] = useState<Property | null>(null);

  // Renew confirmation state
  const [renewConfirmOpen, setRenewConfirmOpen] = useState(false);
  const [propertyToRenew, setPropertyToRenew] = useState<Property | null>(null);

  // Comments modal state
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedPropertyForComments, setSelectedPropertyForComments] = useState<Property | null>(null);

  // API Queries - Server-side filtering and pagination
  const { data: propertiesResponse, isLoading, error } = useProperties({
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term
    status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
    verification_status: filters.verificationFilter !== 'all' ? filters.verificationFilter : undefined,
    property_type: filters.propertyTypeFilter !== 'all' ? filters.propertyTypeFilter : undefined,
    listing_type: filters.listingTypeFilter !== 'all' ? filters.listingTypeFilter : undefined,
    expired: filters.expiredFilter === 'expired' ? 'true' : undefined,
    deleted: activeTab === 1 ? 'true' : undefined, // Show deleted properties when tab 1 is active, undefined for all properties
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Property statistics for dashboard cards
  const { data: statistics } = usePropertyStatistics();

  // Master data queries
  const { data: propertyTypesResponse } = usePropertyTypes({
    per_page: 100, // Get all property types
  });

  const { data: listingTypesResponse } = usePropertyListingTypes({
    per_page: 100, // Get all listing types
  });

  // Delete and restore mutations
  const deletePropertyMutation = useDeleteProperty();
  const restorePropertyMutation = useRestoreProperty();
  const renewPropertyMutation = useRenewProperty();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // ========================================================================
  // COMMENTS MODAL FUNCTIONS
  // ========================================================================

  const handleOpenCommentsModal = (property: Property) => {
    setSelectedPropertyForComments(property);
    setCommentsModalOpen(true);
  };

  const handleCloseCommentsModal = () => {
    setCommentsModalOpen(false);
    setSelectedPropertyForComments(null);
  };


  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract properties data (already filtered and paginated by server)
  const properties = propertiesResponse?.data || [];
  const pagination = propertiesResponse?.pagination;
  
  // Extract master data
  const propertyTypes = propertyTypesResponse?.data || [];
  const listingTypes = listingTypesResponse?.data || [];
  
  // Create dynamic filter fields
  const filterFields = createFilterFields(propertyTypes, listingTypes);

  // Server-side filtering and pagination - no client-side processing needed
  const filteredProperties = properties;
  const paginatedProperties = properties; // Already paginated by server

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
      title: 'Pending Verification',
      value: statistics?.data?.pending_count || 0,
      color: 'warning',
      icon: <EditIcon />,
    },
    {
      title: 'Published',
      value: statistics?.data?.published_count || 0,
      color: 'success',
      icon: <ViewIcon />,
    },
    {
      title: 'Rejected',
      value: statistics?.data?.rejected_count || 0,
      color: 'error',
      icon: <CancelIcon />,
    },
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Property>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      width: '500px',
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
      id: 'details',
      label: 'Details',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {property.bedrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">{property.bedrooms}</Typography>
              </Box>
            )}
            {property.bathrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BathIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">{property.bathrooms}</Typography>
              </Box>
            )}
            {property.area_sqft && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AreaIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">{property.area_sqft} sqft</Typography>
              </Box>
            )}
          </Box>
        );
      },
      hidden: isMobile,
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
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={() => handleOpenCommentsModal(property)}
          >
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
      id: 'createdAt',
      label: 'Created',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        return (
                      <Typography variant="body2" color="textSecondary">
              {property.dates?.created_at ? formatDate(property.dates.created_at, 'display') : 'N/A'}
            </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'expiresAt',
      label: 'Expires At',
      render: (_value, property) => {
        if (!property) return <Typography variant="body2">No data</Typography>;
        
        // Only show expiration date for approved properties
        if (property.verification_status !== 'approved') {
          return <Typography variant="body2" color="textSecondary">-</Typography>;
        }
        
        return (
          <Typography variant="body2" color="textSecondary">
            {property.dates?.expires_at ? formatDate(property.dates.expires_at, 'display') : 'N/A'}
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
        
        const isDeleted = property.is_deleted;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/properties/${property.id}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            
            {/* Show different actions based on deleted status */}
            {!isDeleted ? (
              <>
                {/* Verification Actions */}
                <VerificationActions
                  propertyId={property.id}
                  propertyTitle={property.title_en}
                  verificationStatus={property.verification_status}
                  onShowSuccess={showSuccess}
                  onShowError={showError}
                />
                
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/properties/${property.id}/edit`)}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteProperty(property)}
                    color="error"
                    disabled={deletePropertyMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                
                {/* Renew button - only show for expired properties */}
                {property.is_expired && (
                  <RenewButton
                    onClick={() => handleRenewProperty(property)}
                    disabled={renewPropertyMutation.isPending}
                  />
                )}
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestoreProperty(property)}
                  color="success"
                  disabled={restorePropertyMutation.isPending}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [isMobile, navigate, deletePropertyMutation.isPending, restorePropertyMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (property: Property): MobileCardAction[] => {
    const isDeleted = property.is_deleted;
    
    const baseActions: MobileCardAction[] = [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/properties/${property.id}`),
      },
      {
        icon: <CommentIcon />,
        tooltip: 'View Comments',
        color: 'secondary' as const,
        onClick: () => handleOpenCommentsModal(property),
      },
    ];
    
    if (!isDeleted) {
      baseActions.push(
        {
          icon: <EditIcon />,
          tooltip: 'Edit',
          color: 'secondary' as const,
          onClick: () => navigate(`/properties/${property.id}/edit`),
        },
        {
          icon: <DeleteIcon />,
          tooltip: 'Delete',
          color: 'error' as const,
          onClick: () => handleDeleteProperty(property),
        }
      );
      
      // Add renew action for expired properties
      if (property.is_expired) {
        baseActions.push({
          icon: <RefreshIcon />,
          tooltip: 'Renew Property',
          color: 'warning' as const,
          onClick: () => handleRenewProperty(property),
        });
      }
    } else {
      baseActions.push({
        icon: <RestoreIcon />,
        tooltip: 'Restore',
        color: 'success' as const,
        onClick: () => handleRestoreProperty(property),
      });
    }
    
    return baseActions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteProperty = (property: Property) => {
    openDeleteConfirmation(
      property.title_en,
      'property',
      async () => {
        try {
          await deletePropertyMutation.mutateAsync(property.id);
          showSuccess(`${property.title_en} deleted successfully!`, true);
        } catch (error: any) {
          showError(error.message || 'Failed to delete property. Please try again.', true);
        }
      }
    );
  };

  const handleRestoreProperty = (property: Property) => {
    setPropertyToRestore(property);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!propertyToRestore) return;
    
    try {
      await restorePropertyMutation.mutateAsync(propertyToRestore.id);
      showSuccess(`${propertyToRestore.title_en} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      setPropertyToRestore(null);
    } catch (error: any) {
      showError(error.message || 'Failed to restore property. Please try again.', true);
    }
  };

  const handleRenewProperty = (property: Property) => {
    setPropertyToRenew(property);
    setRenewConfirmOpen(true);
  };

  const handleConfirmRenew = async (notes?: string) => {
    if (!propertyToRenew) return;
    
    try {
      const response = await renewPropertyMutation.mutateAsync({ 
        id: propertyToRenew.id, 
        notes 
      });
      
      // The response structure has property and renewal_info at the top level
      const newExpiry = response.data?.renewal_info?.new_expiry;
      const expiryDate = newExpiry ? new Date(newExpiry).toLocaleDateString() : 'N/A';
      
      showSuccess(
        `${propertyToRenew.title_en} renewed successfully! New expiry: ${expiryDate}`, 
        true
      );
      setRenewConfirmOpen(false);
      setPropertyToRenew(null);
    } catch (error: any) {
      showError(error.message || 'Failed to renew property. Please try again.', true);
    }
  };

  const handleAddProperty = () => {
    navigate('/properties/create');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset to first page when switching tabs
    handleChangePage(event, 0);
  };

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof PropertyFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('statusFilter', 'all');
    setFilter('verificationFilter', 'all');
    setFilter('propertyTypeFilter', 'all');
    setFilter('listingTypeFilter', 'all');
    setFilter('expiredFilter', 'all');
    
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
          title="Properties"
          subtitle="Manage property listings"
          actionButton={{
            text: "Refresh",
            icon: <RefreshIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Properties"
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
        breadcrumbs="Dashboard / Property Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddProperty
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

      {/* Active/Deleted Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="property status tabs"
        >
          <Tab 
            label={`Active Properties`} 
            id="property-tab-0"
            aria-controls="property-tabpanel-0"
          />
          <Tab 
            label={`Deleted Properties`} 
            id="property-tab-1"
            aria-controls="property-tabpanel-1"
          />
        </Tabs>
      </Box>


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
              />
            ))
          ) : filteredProperties.length > 0 ? (
            paginatedProperties.map((property) => (
              <MobileCard
                key={property.id}
                title={property.title_en}
                subtitle={property.title_mm}
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
                  label: `${property.stats?.view_count || 0} views`,
                  color: 'info',
                },
                {
                  label: `${property.stats?.favorite_count || 0} favorites`,
                  color: 'error',
                },
                {
                  label: `${property.stats?.like_count || 0} likes`,
                  color: 'warning',
                },
                {
                  label: `${property.stats?.comment_count || 0} comments`,
                  color: 'secondary',
                },
                // Add expiration date chip for approved properties
                ...(property.verification_status === 'approved' && property.dates?.expires_at ? [{
                  label: `Expires: ${formatDate(property.dates.expires_at, 'display')}`,
                  color: 'warning' as const,
                }] : []),
              ]}
              actions={createMobileCardActions(property)}
              onClick={() => navigate(`/properties/${property.id}`)}
              clickable={true}
            />
          ))
          ) : (
            <PageEmptyState
              title="No Properties Found"
              message="No properties match your current filters. Try adjusting your search criteria."
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
        filteredProperties.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Properties Found"
            message={searchTerm || filters.statusFilter !== 'all' || filters.verificationFilter !== 'all' || filters.propertyTypeFilter !== 'all' || filters.listingTypeFilter !== 'all'
              ? "No properties match your current filters. Try adjusting your search criteria."
              : "No properties have been created yet."
            }
          />
        ) : (
          <StandardTable
            columns={columns}
            data={paginatedProperties}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={pagination?.total || 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(property) => property.id}
            loading={isLoading}
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
        isLoading={deletePropertyMutation.isPending}
        error={deletePropertyMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setPropertyToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={propertyToRestore?.title_en}
        itemType="property"
        action="restore"
        isLoading={restorePropertyMutation.isPending}
        error={restorePropertyMutation.error?.message}
      />

      {/* Renew Confirmation Dialog */}
      <RenewConfirmationDialog
        open={renewConfirmOpen}
        onClose={() => {
          setRenewConfirmOpen(false);
          setPropertyToRenew(null);
        }}
        onConfirm={handleConfirmRenew}
        property={propertyToRenew}
        isLoading={renewPropertyMutation.isPending}
        error={renewPropertyMutation.error?.message}
      />

      {/* Comments Modal */}
      <CommentsModal
        open={commentsModalOpen}
        onClose={handleCloseCommentsModal}
        title={`Comments for ${selectedPropertyForComments?.title_en || 'Property'}`}
        propertyId={selectedPropertyForComments?.id || 0}
        canDelete={true}
      />
    </Box>
  );
};

export default PropertyListPage;
