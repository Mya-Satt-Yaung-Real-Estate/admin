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
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ConfirmationDialog, VerificationActions, ActionAlert, RenewButton, RenewConfirmationDialog, CommentsModal } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useProperties, useDeleteProperty, useRestoreProperty, useRenewProperty, usePropertyTypes, usePropertyListingTypes } from '../../services/queries/properties';
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

  const { filters, setFilter } = useFilters<PropertyFilters>({
    searchTerm: '',
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

  // API Queries
  const { data: propertiesResponse, isLoading, error } = useProperties({
    per_page: 100, // Get all properties for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

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

  // Extract properties data
  const properties = propertiesResponse?.data || [];
  
  // Extract master data
  const propertyTypes = propertyTypesResponse?.data || [];
  const listingTypes = listingTypesResponse?.data || [];
  
  // Create dynamic filter fields
  const filterFields = createFilterFields(propertyTypes, listingTypes);

  // Filter properties using client-side filtering
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    
    const validProperties = properties.filter(property => property != null);
    
    return validProperties.filter(property => {
      // Check if property is deleted using is_deleted field
      const isDeleted = property.is_deleted;
      
      // Apply tab filter (0 = Active, 1 = Deleted)
      if (activeTab === 0 && isDeleted) return false;
      if (activeTab === 1 && !isDeleted) return false;
      
      const matchesSearch = 
        property.title_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.title_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (property.location?.address || '').toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || 
        property.status === filters.statusFilter;
      
      const matchesVerification = filters.verificationFilter === 'all' || 
        property.verification_status === filters.verificationFilter;
      
      const matchesPropertyType = filters.propertyTypeFilter === 'all' || 
        property.property_type?.slug === filters.propertyTypeFilter;
      
      const matchesListingType = filters.listingTypeFilter === 'all' || 
        property.listing_type?.slug === filters.listingTypeFilter;
      
      // Apply expired filter
      let matchesExpired = true;
      if (filters.expiredFilter !== 'all') {
        const isExpired = property.is_expired;
        if (filters.expiredFilter === 'expired') {
          matchesExpired = isExpired;
        } else if (filters.expiredFilter === 'active') {
          matchesExpired = !isExpired;
        }
      }
      
      return matchesSearch && matchesStatus && matchesVerification && matchesPropertyType && matchesListingType && matchesExpired;
    });
  }, [properties, filters, activeTab]);

  // Paginate data
  const paginatedProperties = useMemo(() => {
    return filteredProperties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredProperties, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Properties',
      value: properties.length,
      color: 'primary',
      icon: <HomeIcon />,
    },
    {
      title: 'Active Properties',
      value: properties.filter(property => !property.is_deleted).length,
      color: 'success',
      icon: <HomeIcon />,
    },
    {
      title: 'Deleted Properties',
      value: properties.filter(property => property.is_deleted).length,
      color: 'error',
      icon: <HomeIcon />,
    },
    {
      title: 'Published',
      value: properties.filter(property => property.status === 'published' && !property.is_deleted).length,
      color: 'info',
      icon: <HomeIcon />,
    },
    {
      title: 'Total Likes',
      value: properties.reduce((sum, property) => sum + (property.stats?.like_count || 0), 0),
      color: 'warning',
      icon: <LikeIcon />,
    },
    {
      title: 'Total Comments',
      value: properties.reduce((sum, property) => sum + (property.stats?.comment_count || 0), 0),
      color: 'secondary',
      icon: <CommentIcon />,
    },
    {
      title: 'Total Favorites',
      value: properties.reduce((sum, property) => sum + (property.stats?.favorite_count || 0), 0),
      color: 'error',
      icon: <FavoriteIcon />,
    },
  ], [properties]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Property>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
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
            <FavoriteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
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
            <LikeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
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
            <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
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

  // ========================================================================
  // RENDER
  // ========================================================================

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Properties" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Properties"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
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
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof PropertyFilters, value)}
        fields={filterFields}
      />

      {/* Active/Deleted Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="property status tabs"
        >
          <Tab 
            label={`Active Properties (${properties.filter(p => !p.is_deleted).length})`} 
            id="property-tab-0"
            aria-controls="property-tabpanel-0"
          />
          <Tab 
            label={`Deleted Properties (${properties.filter(p => p.is_deleted).length})`} 
            id="property-tab-1"
            aria-controls="property-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Empty state */}
      {filteredProperties.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Properties Found"
          message={filters.searchTerm || filters.statusFilter !== 'all' || filters.verificationFilter !== 'all' || filters.propertyTypeFilter !== 'all' || filters.listingTypeFilter !== 'all'
            ? "No properties match your current filters. Try adjusting your search criteria."
            : "No properties have been created yet."
          }
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredProperties.length > 0 ? (
        <Box>
          {paginatedProperties.map((property) => (
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
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredProperties.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredProperties.length > 0 && (
          <StandardTable
            columns={columns}
            data={paginatedProperties}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredProperties.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(property) => property.id}
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
