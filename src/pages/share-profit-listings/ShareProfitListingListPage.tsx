import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as PriceIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem, useManualSearch } from '../../hooks';
import { useShareProfitListings, useShareProfitListingStatistics, useDeleteShareProfitListing, useRestoreShareProfitListing, useToggleShareProfitListingStatus } from '../../services/queries/shareProfitListings';
import { usePropertyTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import { FilterState } from '../../constants/filters';
import { ShareProfitListing } from '../../types/shareProfitListing';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ShareProfitListingFilters extends FilterState {
  searchTerm: string;
  typeFilter: string;
  regionFilter: string;
  townshipFilter: string;
  propertyTypeFilter: string;
  minBudgetFilter: string;
  maxBudgetFilter: string;
  bedroomsFilter: string;
  bathroomsFilter: string;
  minAreaFilter: string;
  maxAreaFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Share Profit Listing Management',
  description: 'Manage property share profit listings',
  createButtonText: 'Add Share Profit Listing',
  createButtonPath: '/share-profit-listings/create',
} as const;

// This function will be updated to accept master data

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ShareProfitListingListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  // Master data queries
  const { data: propertyTypes, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: townships, isLoading: townshipsLoading } = useTownships();

  // Manual search: only triggers on Enter key or search button click
  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');

  const { filters, setFilter } = useFilters<ShareProfitListingFilters>({
    searchTerm: '', // This will be overridden by manual search
    typeFilter: 'all',
    regionFilter: 'all',
    townshipFilter: 'all',
    propertyTypeFilter: 'all',
    minBudgetFilter: '',
    maxBudgetFilter: '',
    bedroomsFilter: 'all',
    bathroomsFilter: 'all',
    minAreaFilter: '',
    maxAreaFilter: '',
  });

  // Separate pagination states for active and deleted tabs
  const [activePage, setActivePage] = useState(0);
  const [deletedPage, setDeletedPage] = useState(0);
  const { rowsPerPage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted share profit listingings
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [shareProfitListingToRestore, setShareProfitListingToRestore] = useState<ShareProfitListing | null>(null);

  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedShareProfitListingForMenu, setSelectedShareProfitListingForMenu] = useState<ShareProfitListing | null>(null);

  // Reset filters when master data changes and current filter value is not valid
  useEffect(() => {
    // Handle both direct arrays and paginated responses
    const propertyTypesArray = Array.isArray(propertyTypes)
      ? propertyTypes
      : Array.isArray((propertyTypes as any)?.data)
        ? (propertyTypes as any).data
        : [];
    if (propertyTypes && filters.propertyTypeFilter !== 'all') {
      const isValidPropertyType = propertyTypesArray.some((pt: any) => pt.id.toString() === filters.propertyTypeFilter);
      if (!isValidPropertyType) {
        setFilter('propertyTypeFilter', 'all');
      }
    }
  }, [propertyTypes, filters.propertyTypeFilter, setFilter]);

  useEffect(() => {
    // Handle both direct arrays and paginated responses
    const regionsArray = Array.isArray(regions)
      ? regions
      : Array.isArray((regions as any)?.data)
        ? (regions as any).data
        : [];
    if (regions && filters.regionFilter !== 'all') {
      const isValidRegion = regionsArray.some((region: any) => region.id.toString() === filters.regionFilter);
      if (!isValidRegion) {
        setFilter('regionFilter', 'all');
      }
    }
  }, [regions, filters.regionFilter, setFilter]);

  useEffect(() => {
    // Handle both direct arrays and paginated responses
    const townshipsArray = Array.isArray(townships)
      ? townships
      : Array.isArray((townships as any)?.data)
        ? (townships as any).data
        : [];
    if (townships && filters.townshipFilter !== 'all') {
      const isValidTownship = townshipsArray.some((township: any) => township.id.toString() === filters.townshipFilter);
      if (!isValidTownship) {
        setFilter('townshipFilter', 'all');
      }
    }
  }, [townships, filters.townshipFilter, setFilter]);

  // API Queries - Server-side filtering and pagination (fetch all records to classify by deleted_at field)
  const {
    data: shareProfitListingsResponse,
    isLoading,
    isFetching,
    error,
  } = useShareProfitListings({
    page: 1, // Fetch page 1 with a larger per_page to get enough records for proper pagination
    per_page: 100, // Fetch a large number of records to ensure we have enough after classification
    search: searchTerm || undefined, // Use manual search term
    wanted_type: filters.typeFilter !== 'all' ? filters.typeFilter : undefined,
    property_type_id: filters.propertyTypeFilter !== 'all' && !isNaN(Number(filters.propertyTypeFilter)) ? Number(filters.propertyTypeFilter) : undefined,
    prefer_region_id: filters.regionFilter !== 'all' && !isNaN(Number(filters.regionFilter)) ? Number(filters.regionFilter) : undefined,
    prefer_township_id: filters.townshipFilter !== 'all' && !isNaN(Number(filters.townshipFilter)) ? Number(filters.townshipFilter) : undefined,
    min_budget: filters.minBudgetFilter ? Number(filters.minBudgetFilter) : undefined,
    max_budget: filters.maxBudgetFilter ? Number(filters.maxBudgetFilter) : undefined,
    bedrooms: filters.bedroomsFilter !== 'all' ? Number(filters.bedroomsFilter) : undefined,
    bathrooms: filters.bathroomsFilter !== 'all' ? Number(filters.bathroomsFilter) : undefined,
    min_area: filters.minAreaFilter ? Number(filters.minAreaFilter) : undefined,
    max_area: filters.maxAreaFilter ? Number(filters.maxAreaFilter) : undefined,
    deleted: undefined, // Fetch all records to classify by deleted_at field
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  // Wanting lists statistics for dashboard cards
  const { data: statistics } = useShareProfitListingStatistics();

  // Delete and restore mutations
  const deleteShareProfitListingMutation = useDeleteShareProfitListing();
  const restoreShareProfitListingMutation = useRestoreShareProfitListing();
  const toggleShareProfitListingStatusMutation = useToggleShareProfitListingStatus();

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
  // ACTION MENU FUNCTIONS
  // ========================================================================

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, shareProfitListing: ShareProfitListing) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedShareProfitListingForMenu(shareProfitListing);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedShareProfitListingForMenu(null);
  };

  const handleMenuAction = (action: 'delete' | 'toggle-status') => {
    if (!selectedShareProfitListingForMenu) return;

    switch (action) {
      case 'delete':
        handleDeleteShareProfitListing(selectedShareProfitListingForMenu);
        break;
      case 'toggle-status':
        handleToggleStatus(selectedShareProfitListingForMenu);
        break;
    }

    handleActionMenuClose();
  };

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract share profit listings data (already filtered by server, pagination will be handled client-side after classification)
  const shareProfitListings: any[] = Array.isArray(shareProfitListingsResponse)
    ? shareProfitListingsResponse
    : (shareProfitListingsResponse as any)?.data || [];

  /**
   * Only show table skeleton on first load, not after row actions.
   */
  const isInitialLoading = isLoading && shareProfitListings.length === 0;
  const isRefreshing = isFetching && !isInitialLoading;

  // Classify records based on deleted_at field for proper soft-delete handling
  const allClassifiedShareProfitListings = shareProfitListings.filter((shareProfitListing: any) => {
    // Properly check if deleted_at field exists and is not null/undefined/empty
    let isDeleted = false;
    if (shareProfitListing.deleted_at === null ||
        shareProfitListing.deleted_at === undefined ||
        shareProfitListing.deleted_at === '') {
      isDeleted = false;
    } else {
      // If it's a string, check if it's not empty
      // If it's an object, consider it as deleted if it exists
      isDeleted = (typeof shareProfitListing.deleted_at === 'string' && shareProfitListing.deleted_at.trim() !== '') ||
                  (typeof shareProfitListing.deleted_at === 'object' && shareProfitListing.deleted_at !== null);
    }

    // For active tab (0), show non-deleted records (deleted_at is null/undefined/empty)
    // For deleted tab (1), show deleted records (deleted_at has a value)
    return activeTab === 0 ? !isDeleted : isDeleted;
  });

  // Apply client-side pagination to the classified data
  const startIndex = (activeTab === 0 ? activePage : deletedPage) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const classifiedShareProfitListings = allClassifiedShareProfitListings.slice(startIndex, endIndex);

  // Calculate total counts for pagination display
  const activeCount = allClassifiedShareProfitListings.filter(item => {
    let isDeleted = false;
    if (item.deleted_at === null || item.deleted_at === undefined || item.deleted_at === '') {
      isDeleted = false;
    } else {
      isDeleted = (typeof item.deleted_at === 'string' && item.deleted_at.trim() !== '') ||
                  (typeof item.deleted_at === 'object' && item.deleted_at !== null);
    }
    return !isDeleted;
  }).length;

  const deletedCount = allClassifiedShareProfitListings.filter(item => {
    let isDeleted = false;
    if (item.deleted_at === null || item.deleted_at === undefined || item.deleted_at === '') {
      isDeleted = false;
    } else {
      isDeleted = (typeof item.deleted_at === 'string' && item.deleted_at.trim() !== '') ||
                  (typeof item.deleted_at === 'object' && item.deleted_at !== null);
    }
    return isDeleted;
  }).length;

  // Create a mock pagination object that reflects the client-side pagination
  const pagination = {
    current_page: activeTab === 0 ? activePage + 1 : deletedPage + 1, // 1-based page number for display
    per_page: rowsPerPage,
    total: activeTab === 0 ? activeCount : deletedCount,
    last_page: Math.ceil((activeTab === 0 ? activeCount : deletedCount) / rowsPerPage),
    from: startIndex + 1,
    to: Math.min(endIndex, (activeTab === 0 ? activeCount : deletedCount)),
    has_more_pages: endIndex < (activeTab === 0 ? activeCount : deletedCount)
  };

  // Create dynamic filter fields with master data
  const createFilterFields = (): FilterField[] => {
    // Prepare options from master data - handle both direct arrays and paginated responses
    const propertyTypesArray = Array.isArray(propertyTypes)
      ? propertyTypes
      : Array.isArray((propertyTypes as any)?.data)
        ? (propertyTypes as any).data
        : [];

    const regionsArray = Array.isArray(regions)
      ? regions
      : Array.isArray((regions as any)?.data)
        ? (regions as any).data
        : [];

    const townshipsArray = Array.isArray(townships)
      ? townships
      : Array.isArray((townships as any)?.data)
        ? (townships as any).data
        : [];

    // Provide loading options if data is not yet loaded
    const propertyTypeOptions = [
      { value: 'all', label: propertyTypesLoading ? 'Loading...' : 'All Types' },
      ...propertyTypesArray.map((pt: any) => ({
        value: pt.id.toString(),
        label: pt.name_en,
      })),
    ];

    const regionOptions = [
      { value: 'all', label: regionsLoading ? 'Loading...' : 'All Regions' },
      ...regionsArray.map((region: any) => ({
        value: region.id.toString(),
        label: region.name_en,
      })),
    ];

    const townshipOptions = [
      { value: 'all', label: townshipsLoading ? 'Loading...' : 'All Townships' },
      ...townshipsArray.map((township: any) => ({
        value: township.id.toString(),
        label: township.name_en,
      })),
    ];

    // Filter fields with master data
    return [
      {
        key: 'searchTerm',
        type: 'search',
        label: 'Search',
        placeholder: 'Search by title, description, or contact info...',
      },
      {
        key: 'typeFilter',
        type: 'select',
        label: 'Type',
        options: [
          { value: 'all', label: 'All Types' },
          { value: 'buyer', label: 'Buyer' },
          { value: 'renter', label: 'Renter' },
          { value: 'seller', label: 'Seller' },
          { value: 'share_profit', label: 'Share Profit' },
        ],
      },
      {
        key: 'propertyTypeFilter',
        type: 'select',
        label: 'Property Type',
        options: propertyTypeOptions,
      },
      {
        key: 'regionFilter',
        type: 'select',
        label: 'Region',
        options: regionOptions,
      },
      {
        key: 'townshipFilter',
        type: 'select',
        label: 'Township',
        options: townshipOptions,
      },
      {
        key: 'minBudgetFilter',
        type: 'search',
        label: 'Min Budget',
        placeholder: 'Min Budget',
      },
      {
        key: 'maxBudgetFilter',
        type: 'search',
        label: 'Max Budget',
        placeholder: 'Max Budget',
      },
      {
        key: 'bedroomsFilter',
        type: 'select',
        label: 'Bedrooms',
        options: [
          { value: 'all', label: 'Any' },
          { value: '1', label: '1+' },
          { value: '2', label: '2+' },
          { value: '3', label: '3+' },
          { value: '4', label: '4+' },
        ],
      },
      {
        key: 'bathroomsFilter',
        type: 'select',
        label: 'Bathrooms',
        options: [
          { value: 'all', label: 'Any' },
          { value: '1', label: '1+' },
          { value: '2', label: '2+' },
          { value: '3', label: '3+' },
          { value: '4', label: '4+' },
        ],
      },
      {
        key: 'minAreaFilter',
        type: 'search',
        label: 'Min Area (sqft)',
        placeholder: 'Min Area',
      },
      {
        key: 'maxAreaFilter',
        type: 'search',
        label: 'Max Area (sqft)',
        placeholder: 'Max Area',
      },
    ];
  };

  const filterFields = createFilterFields();

  // Server-side filtering and pagination - no client-side processing needed
  const filteredShareProfitListings = classifiedShareProfitListings;
  const paginatedShareProfitListings = classifiedShareProfitListings; // Already paginated by server (after classification)

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Share Profit Listings',
      value: statistics?.data?.total || 0,
      color: 'primary',
      icon: <HomeIcon />,
    },
    // {
    //   title: 'Published',
    //   value: statistics?.data?.published || 0,
    //   color: 'success',
    //   icon: <CheckCircleIcon />,
    // },
    {
      title: 'Buyers',
      value: statistics?.data?.by_type?.buyer || 0,
      color: 'info',
      icon: <PersonIcon />,
    },
    {
      title: 'Renters',
      value: statistics?.data?.by_type?.renter || 0,
      color: 'warning',
      icon: <BusinessIcon />,
    },
    {
      title: 'Sellers',
      value: statistics?.data?.by_type?.seller || 0,
      color: 'success',
      icon: <BusinessIcon />,
    },
    {
      title: 'Share Profit',
      value: statistics?.data?.by_type?.share_profit || 0,
      color: 'secondary',
      icon: <PersonIcon />,
    },
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<ShareProfitListing>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      width: '300px',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {typeof shareProfitListing.title === 'string' ? shareProfitListing.title : 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {typeof shareProfitListing.description === 'string' && shareProfitListing.description.length > 0
                ? shareProfitListing.description.substring(0, 50) + '...'
                : typeof shareProfitListing.additional_requirement === 'string' && shareProfitListing.additional_requirement.length > 0
                ? shareProfitListing.additional_requirement.substring(0, 50) + '...'
                : 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'type',
      label: 'Type',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        const wantedType = typeof shareProfitListing.wanted_type === 'string'
          ? shareProfitListing.wanted_type
          : 'unknown';

        // Since StatusChip doesn't support buyer/renter, create a custom chip-like element
        let chipLabel = 'Unknown';
        let chipColor = 'default';

        if (wantedType === 'buyer') {
          chipLabel = 'Buyer';
          chipColor = 'primary';
        } else if (wantedType === 'renter') {
          chipLabel = 'Renter';
          chipColor = 'secondary';
        } else if (wantedType === 'seller') {
          chipLabel = 'Seller';
          chipColor = 'success';
        } else if (wantedType === 'share_profit') {
          chipLabel = 'Share Profit';
          chipColor = 'info';
        }

        return (
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor as 'primary' | 'secondary' | 'default' | 'success' | 'info'}
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-label': {
                px: 1,
              }
            }}
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'propertyType',
      label: 'Property Type',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        const propertyType = typeof shareProfitListing.property_type === 'object' ? shareProfitListing.property_type : null;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {typeof propertyType?.name_en === 'string' ? propertyType.name_en : 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {typeof propertyType?.name_mm === 'string' ? propertyType.name_mm : ''}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;

        // Handle both possible location formats from the API
        let regionName = 'N/A';
        let townshipName = 'N/A';

        if (shareProfitListing.preferred_location?.region) {
          // Use the preferred_location format from API
          regionName = shareProfitListing.preferred_location.region.name_en || 'N/A';
          townshipName = shareProfitListing.preferred_location.township.name_en || 'N/A';
        } else if (shareProfitListing.location) {
          // Use the location format (fallback)
          regionName = shareProfitListing.location.region_en || 'N/A';
          townshipName = shareProfitListing.location.township_en || 'N/A';
        }

        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {regionName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {townshipName}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'budget',
      label: 'Budget',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        const budget = typeof shareProfitListing.budget === 'object' ? shareProfitListing.budget : null;
        const minBudget = typeof budget?.min_budget === 'string' ? budget.min_budget : 'N/A';
        const maxBudget = typeof budget?.max_budget === 'string' ? budget.max_budget : 'N/A';
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <PriceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {minBudget} - {maxBudget}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'details',
      label: 'Details',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        const specs = typeof shareProfitListing.specifications === 'object' ? shareProfitListing.specifications : null;
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {typeof specs?.bedrooms === 'number' && specs.bedrooms > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">{specs.bedrooms} bed</Typography>
              </Box>
            )}
            {typeof specs?.bathrooms === 'number' && specs.bathrooms > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BathIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">{specs.bathrooms} bath</Typography>
              </Box>
            )}
            {typeof specs?.area_range === 'string' && specs.area_range && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AreaIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">{specs.area_range}</Typography>
              </Box>
            )}
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'contact',
      label: 'Contact',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        const contact = typeof shareProfitListing.contact === 'object' ? shareProfitListing.contact : null;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {typeof contact?.name === 'string' ? contact.name : 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {typeof contact?.phone === 'string' ? contact.phone : 'N/A'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    // {
    //   id: 'status',
    //   label: 'Status',
    //   render: (_value, shareProfitListing) => {
    //     if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
    //     return <StatusChip status={typeof shareProfitListing.status?.status === 'string' ? shareProfitListing.status.status : 'unknown'} />;
    //   },
    // },
    {
      id: 'isActive',
      label: 'Active Status',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        const isActive = typeof shareProfitListing.is_active === 'boolean' ? shareProfitListing.is_active : undefined;
        return (
          <Box>
            {isActive === true ? (
              <Chip
                label="Active"
                size="small"
                color="success"
                variant="outlined"
                icon={<CheckCircleIcon fontSize="small" />}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                  }
                }}
              />
            ) : isActive === false ? (
              <Chip
                label="Inactive"
                size="small"
                color="error"
                variant="outlined"
                icon={<CancelIcon fontSize="small" />}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                  }
                }}
              />
            ) : (
              <Chip
                label="Unknown"
                size="small"
                color="default"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                  }
                }}
              />
            )}
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {typeof shareProfitListing.created_at === 'string' && shareProfitListing.created_at ? formatDate(shareProfitListing.created_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'expiresAt',
      label: 'Expires At',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;

        return (
          <Typography variant="body2" color="textSecondary">
            {typeof shareProfitListing.status?.expires_at === 'string' && shareProfitListing.status.expires_at ? formatDate(shareProfitListing.status.expires_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, shareProfitListing) => {
        if (!shareProfitListing || typeof shareProfitListing !== 'object') return <Typography variant="body2">No data</Typography>;

        // Properly check if deleted_at field exists and is not null/undefined/empty
        let isDeleted = false;
        if (shareProfitListing.deleted_at === null ||
            shareProfitListing.deleted_at === undefined ||
            shareProfitListing.deleted_at === '') {
          isDeleted = false;
        } else {
          // If it's a string, check if it's not empty
          // If it's an object, consider it as deleted if it exists
          isDeleted = (typeof shareProfitListing.deleted_at === 'string' && shareProfitListing.deleted_at.trim() !== '') ||
                      (typeof shareProfitListing.deleted_at === 'object' && shareProfitListing.deleted_at !== null);
        }

        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Primary Actions - View Details and Edit (always visible for non-deleted) */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/share-profit-listings/${typeof shareProfitListing.slug === 'string' ? shareProfitListing.slug : ''}`);
                }}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>

            {/* Edit button - only for non-deleted share profit listingings */}
            {!isDeleted && (
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/share-profit-listings/${typeof shareProfitListing.slug === 'string' ? shareProfitListing.slug : ''}/edit`);
                }}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            )}

            {/* Secondary Actions - Dropdown Menu */}
            {!isDeleted && (
              <Tooltip title="More Actions">
                <IconButton
                  size="small"
                  onClick={(event) => typeof shareProfitListing.slug === 'string' ? handleActionMenuOpen(event, shareProfitListing) : undefined}
                  color="default"
                  sx={{
                    bgcolor: 'grey.100',
                    '&:hover': { bgcolor: 'grey.200' }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Restore action - Only for deleted share profit listingings */}
            {isDeleted && (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRestoreShareProfitListing(shareProfitListing);
                  }}
                  color="success"
                  disabled={restoreShareProfitListingMutation.isPending}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [isMobile, navigate, restoreShareProfitListingMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (shareProfitListing: ShareProfitListing): MobileCardAction[] => {
    // Defensive check to ensure we have a valid share profit listing object
    if (!shareProfitListing || typeof shareProfitListing !== 'object') {
      return [];
    }

    // Properly check if deleted_at field exists and is not null/undefined/empty
    let isDeleted = false;
    if (shareProfitListing.deleted_at === null ||
        shareProfitListing.deleted_at === undefined ||
        shareProfitListing.deleted_at === '') {
      isDeleted = false;
    } else {
      // If it's a string, check if it's not empty
      // If it's an object, consider it as deleted if it exists
      isDeleted = (typeof shareProfitListing.deleted_at === 'string' && shareProfitListing.deleted_at.trim() !== '') ||
                  (typeof shareProfitListing.deleted_at === 'object' && shareProfitListing.deleted_at !== null);
    }
    const slug = typeof shareProfitListing.slug === 'string' ? shareProfitListing.slug : '';

    const baseActions: MobileCardAction[] = [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/share-profit-listings/${slug}`),
      },
    ];

    if (!isDeleted) {
      baseActions.push(
        {
          icon: <EditIcon />,
          tooltip: 'Edit',
          color: 'secondary' as const,
          onClick: () => navigate(`/share-profit-listings/${slug}/edit`),
        },
        {
          icon: <DeleteIcon />,
          tooltip: 'Delete',
          color: 'error' as const,
          onClick: () => handleDeleteShareProfitListing(shareProfitListing),
        }
      );
    } else {
      baseActions.push({
        icon: <RestoreIcon />,
        tooltip: 'Restore',
        color: 'success' as const,
        onClick: () => handleRestoreShareProfitListing(shareProfitListing),
      });
    }

    return baseActions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteShareProfitListing = (shareProfitListing: ShareProfitListing) => {
    openDeleteConfirmation(
      shareProfitListing.title,
      'share profit listinging',
      async () => {
        try {
          await deleteShareProfitListingMutation.mutateAsync(shareProfitListing.slug);
          showSuccess(`${shareProfitListing.title} deleted successfully!`, true);
        } catch (error: any) {
          // Handle validation errors from API response
          if ((error as any)?.response?.data?.message) {
            showError((error as any).response.data.message, true);
          } else if ((error as any)?.response?.data?.errors) {
            // Handle validation errors object (e.g., Laravel validation errors)
            const errorMessages = Object.values((error as any).response.data.errors).flat();
            showError(errorMessages.join('\n'), true);
          } else {
            showError(error.message || 'Failed to delete share profit listinging. Please try again.', true);
          }
        }
      }
    );
  };

  const handleRestoreShareProfitListing = (shareProfitListing: ShareProfitListing) => {
    setShareProfitListingToRestore(shareProfitListing);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!shareProfitListingToRestore) return;

    try {
      await restoreShareProfitListingMutation.mutateAsync(shareProfitListingToRestore.slug);
      showSuccess(`${shareProfitListingToRestore.title} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      setShareProfitListingToRestore(null);
    } catch (error: any) {
      // Handle validation errors from API response
      if ((error as any)?.response?.data?.message) {
        showError((error as any).response.data.message, true);
      } else if ((error as any)?.response?.data?.errors) {
        // Handle validation errors object (e.g., Laravel validation errors)
        const errorMessages = Object.values((error as any).response.data.errors).flat();
        showError(errorMessages.join('\n'), true);
      } else {
        showError(error.message || 'Failed to restore share profit listinging. Please try again.', true);
      }
    }
  };

  const handleToggleStatus = (shareProfitListing: ShareProfitListing) => {
    toggleShareProfitListingStatusMutation.mutate(shareProfitListing.slug, {
      onSuccess: (data) => {
        const newStatus = data.data.is_active ? 'enabled' : 'disabled';
        showSuccess(`${shareProfitListing.title} ${newStatus} successfully!`, true);
      },
      onError: (error: any) => {
        showError(error.message || 'Failed to toggle status. Please try again.', true);
      }
    });
  };

  const handleAddShareProfitListing = () => {
    navigate('/share-profit-listings/create');
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset to first page when switching tabs
    setActivePage(0);
    setDeletedPage(0);
  };

  const handleChangePage = (_: React.SyntheticEvent, newPage: number) => {
    if (activeTab === 0) {
      setActivePage(newPage);
    } else {
      setDeletedPage(newPage);
    }
  };

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof ShareProfitListingFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();

    // Reset all filters to default values
    setFilter('typeFilter', 'all');
    setFilter('regionFilter', 'all');
    setFilter('townshipFilter', 'all');
    setFilter('propertyTypeFilter', 'all');
    setFilter('minBudgetFilter', '');
    setFilter('maxBudgetFilter', '');
    setFilter('bedroomsFilter', 'all');
    setFilter('bathroomsFilter', 'all');
    setFilter('minAreaFilter', '');
    setFilter('maxAreaFilter', '');

    // Reset to first page
    handleChangePage({} as any, 0);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Error state - show inline error instead of full page error
  if (error) {
    let errorMessage = error.message || 'An error occurred while loading share profit listingings';

    // Handle validation errors from API response (only if error has response property)
    if ((error as any)?.response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    } else if ((error as any)?.response?.data?.errors) {
      // Handle validation errors object (e.g., Laravel validation errors)
      const errorMessages = Object.values((error as any).response.data.errors).flat();
      errorMessage = errorMessages.join('\n');
    }

    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Share Profit Listings"
          subtitle="Manage share profit listing entries"
          actionButton={{
            text: "Refresh",
            icon: <MoreVertIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Share Profit Listings"
            message={errorMessage}
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
        breadcrumbs="Dashboard / Share Profit Listing Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddShareProfitListing
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
          aria-label="share profit listinging status tabs"
        >
          <Tab
            label={`Active Share Profit Listings`}
            id="wanting-list-tab-0"
            aria-controls="wanting-list-tabpanel-0"
          />
          <Tab
            label={`Deleted Share Profit Listings`}
            id="wanting-list-tab-1"
            aria-controls="wanting-list-tabpanel-1"
          />
        </Tabs>
      </Box>


      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box sx={{ opacity: isRefreshing ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
          {isInitialLoading ? (
            // Loading skeleton cards for mobile
            Array.from({ length: rowsPerPage }).map((_, index) => (
              <MobileCard
                key={`skeleton-${index}`}
                title=""
                loading={true}
                showRowNumber={true}
              />
            ))
          ) : error ? (
            <PageErrorState
              error={error}
              title="Error Loading Share Profit Listings"
              message={(error as any)?.message || 'Failed to load share profit listingings'}
              onRetry={() => window.location.reload()}
            />
          ) : filteredShareProfitListings.length > 0 ? (
            paginatedShareProfitListings.map((shareProfitListing: any, index: number) => (
              <MobileCard
                key={shareProfitListing.slug}
                title={shareProfitListing.title}
                subtitle={typeof shareProfitListing.description === 'string' && shareProfitListing.description.length > 0
                  ? shareProfitListing.description.substring(0, 50) + '...'
                  : typeof shareProfitListing.additional_requirement === 'string' && shareProfitListing.additional_requirement.length > 0
                  ? shareProfitListing.additional_requirement.substring(0, 50) + '...'
                  : 'N/A'}
                rowNumber={((activeTab === 0 ? activePage : deletedPage) * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={`${shareProfitListing.contact?.name || 'N/A'} - ${shareProfitListing.contact?.phone || 'N/A'}`}
                avatar={<HomeIcon />}
                avatarColor="primary.main"
                status={
                  shareProfitListing
                  ? {
                      label: shareProfitListing.status?.status === 'published' ? 'Published' :
                             shareProfitListing.status?.status === 'draft' ? 'Draft' :
                             shareProfitListing.status?.status === 'expired' ? 'Expired' :
                             shareProfitListing.status?.status === 'closed' ? 'Closed' : 'Unknown',
                      color: 'default',
                    }
                  : undefined
                }
                chips={
                  shareProfitListing
                  ? [
                      {
                        label: typeof shareProfitListing.wanted_type === 'string'
                          ? shareProfitListing.wanted_type === 'buyer'
                            ? 'Buyer'
                            : shareProfitListing.wanted_type === 'renter'
                              ? 'Renter'
                              : shareProfitListing.wanted_type === 'seller'
                                ? 'Seller'
                                : shareProfitListing.wanted_type === 'share_profit'
                                  ? 'Share Profit'
                                  : shareProfitListing.wanted_type
                          : 'Unknown',
                        color: typeof shareProfitListing.wanted_type === 'string' && shareProfitListing.wanted_type === 'buyer' ? 'primary' : 'secondary',
                      },
                      {
                        label: `${shareProfitListing.property_type?.name_en || 'N/A'}`,
                        color: 'info',
                      },
                      {
                        label: shareProfitListing.preferred_location?.region
                          ? `${shareProfitListing.preferred_location.region.name_en || 'N/A'}, ${shareProfitListing.preferred_location.township.name_en || 'N/A'}`
                          : shareProfitListing.location
                          ? `${shareProfitListing.location.region_en || 'N/A'}, ${shareProfitListing.location.township_en || 'N/A'}`
                          : 'N/A',
                        color: 'warning',
                      },
                      {
                        label: `Budget: ${shareProfitListing.budget?.min_budget || 0} - ${shareProfitListing.budget?.max_budget || 0}`,
                        color: 'info',
                      },
                    ]
                  : []
                }
                actions={createMobileCardActions(shareProfitListing)}
                onClick={() => navigate(`/share-profit-listings/${shareProfitListing.slug}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Share Profit Listings Found"
              message="No share profit listingings match your current filters. Try adjusting your search criteria."
            />
          )}
          <Pagination
            page={activeTab === 0 ? activePage : deletedPage}
            rowsPerPage={rowsPerPage}
            totalCount={pagination?.total || 0}
            onPageChange={activeTab === 0 ? (_, newPage) => setActivePage(newPage) : (_, newPage) => setDeletedPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        error ? (
          <PageErrorState
            error={error}
            title="Error Loading Share Profit Listings"
            message={(error as any)?.message || 'Failed to load share profit listingings'}
            onRetry={() => window.location.reload()}
          />
        ) : filteredShareProfitListings.length === 0 && !isInitialLoading ? (
          <PageEmptyState
            title="No Share Profit Listings Found"
            message={searchTerm || filters.typeFilter !== 'all' || filters.regionFilter !== 'all' || filters.townshipFilter !== 'all' || filters.propertyTypeFilter !== 'all'
              ? "No share profit listingings match your current filters. Try adjusting your search criteria."
              : "No share profit listingings have been created yet."
            }
          />
        ) : (
        <Box sx={{ opacity: isRefreshing ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
        <StandardTable
          columns={columns}
          data={paginatedShareProfitListings}
          page={activeTab === 0 ? activePage : deletedPage}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={activeTab === 0 ? (_, newPage) => setActivePage(newPage) : (_, newPage) => setDeletedPage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(shareProfitListing) => shareProfitListing?.slug}
          loading={isInitialLoading}
          showRowNumbers={true}
          rowNumberLabel="No."
        />
        </Box>
        )
      )}

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuAction('toggle-status')}>
          <ListItemIcon>
            {selectedShareProfitListingForMenu?.is_active ? (
              <CancelIcon color="error" />
            ) : (
              <CheckCircleIcon color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedShareProfitListingForMenu?.is_active ? 'Disable' : 'Enable'}
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteShareProfitListingMutation.isPending}
        error={deleteShareProfitListingMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setShareProfitListingToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={shareProfitListingToRestore?.title}
        itemType="share profit listing"
        action="restore"
        isLoading={restoreShareProfitListingMutation.isPending}
        error={restoreShareProfitListingMutation.error?.message}
      />
    </Box>
  );
};

export default ShareProfitListingListPage;