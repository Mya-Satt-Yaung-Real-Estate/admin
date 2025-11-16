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
import { useWantingLists, useWantingListStatistics, useDeleteWantingList, useRestoreWantingList, useToggleWantingListStatus } from '../../services/queries/wantingListings';
import { usePropertyTypes } from '../../services/queries/properties';
import { useRegions, useTownships } from '../../services/queries/locations';
import { FilterState } from '../../constants/filters';
import { WantingList } from '../../types/wantedListing';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface WantingListFilters extends FilterState {
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
  title: 'Wanting List Management',
  description: 'Manage property wanting lists',
  createButtonText: 'Add Wanting List',
  createButtonPath: '/wanting-listings/create',
} as const;

// This function will be updated to accept master data

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WantingListingListPage: React.FC = () => {
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

  const { filters, setFilter } = useFilters<WantingListFilters>({
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

  // Tab state for active/deleted wanting listings
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [wantingListToRestore, setWantingListToRestore] = useState<WantingList | null>(null);

  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedWantingListForMenu, setSelectedWantingListForMenu] = useState<WantingList | null>(null);

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
  const { data: wantingListsResponse, isLoading, error } = useWantingLists({
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
  const { data: statistics } = useWantingListStatistics();

  // Delete and restore mutations
  const deleteWantingListMutation = useDeleteWantingList();
  const restoreWantingListMutation = useRestoreWantingList();
  const toggleWantingListStatusMutation = useToggleWantingListStatus();

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

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, wantingList: WantingList) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedWantingListForMenu(wantingList);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedWantingListForMenu(null);
  };

  const handleMenuAction = (action: 'delete' | 'toggle-status') => {
    if (!selectedWantingListForMenu) return;

    switch (action) {
      case 'delete':
        handleDeleteWantingList(selectedWantingListForMenu);
        break;
      case 'toggle-status':
        handleToggleStatus(selectedWantingListForMenu);
        break;
    }

    handleActionMenuClose();
  };

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract wanting lists data (already filtered by server, pagination will be handled client-side after classification)
  const wantingLists: any[] = Array.isArray(wantingListsResponse)
    ? wantingListsResponse
    : (wantingListsResponse as any)?.data || [];

  // Classify records based on deleted_at field for proper soft-delete handling
  const allClassifiedWantingLists = wantingLists.filter((wantingList: any) => {
    // Properly check if deleted_at field exists and is not null/undefined/empty
    let isDeleted = false;
    if (wantingList.deleted_at === null ||
        wantingList.deleted_at === undefined ||
        wantingList.deleted_at === '') {
      isDeleted = false;
    } else {
      // If it's a string, check if it's not empty
      // If it's an object, consider it as deleted if it exists
      isDeleted = (typeof wantingList.deleted_at === 'string' && wantingList.deleted_at.trim() !== '') ||
                  (typeof wantingList.deleted_at === 'object' && wantingList.deleted_at !== null);
    }

    // For active tab (0), show non-deleted records (deleted_at is null/undefined/empty)
    // For deleted tab (1), show deleted records (deleted_at has a value)
    return activeTab === 0 ? !isDeleted : isDeleted;
  });

  // Apply client-side pagination to the classified data
  const startIndex = (activeTab === 0 ? activePage : deletedPage) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const classifiedWantingLists = allClassifiedWantingLists.slice(startIndex, endIndex);

  // Calculate total counts for pagination display
  const activeCount = allClassifiedWantingLists.filter(item => {
    let isDeleted = false;
    if (item.deleted_at === null || item.deleted_at === undefined || item.deleted_at === '') {
      isDeleted = false;
    } else {
      isDeleted = (typeof item.deleted_at === 'string' && item.deleted_at.trim() !== '') ||
                  (typeof item.deleted_at === 'object' && item.deleted_at !== null);
    }
    return !isDeleted;
  }).length;

  const deletedCount = allClassifiedWantingLists.filter(item => {
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
  const filteredWantingLists = classifiedWantingLists;
  const paginatedWantingLists = classifiedWantingLists; // Already paginated by server (after classification)

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Wanting Lists',
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
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<WantingList>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      width: '300px',
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {typeof wantingList.title === 'string' ? wantingList.title : 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {typeof wantingList.description === 'string' && wantingList.description.length > 0
                ? wantingList.description.substring(0, 50) + '...'
                : typeof wantingList.additional_requirement === 'string' && wantingList.additional_requirement.length > 0
                ? wantingList.additional_requirement.substring(0, 50) + '...'
                : 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'type',
      label: 'Type',
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        const wantedType = typeof wantingList.wanted_type === 'string'
          ? wantingList.wanted_type
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
        }

        return (
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor as 'primary' | 'secondary' | 'default'}
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
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        const propertyType = typeof wantingList.property_type === 'object' ? wantingList.property_type : null;
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
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;

        // Handle both possible location formats from the API
        let regionName = 'N/A';
        let townshipName = 'N/A';

        if (wantingList.preferred_location?.region) {
          // Use the preferred_location format from API
          regionName = wantingList.preferred_location.region.name_en || 'N/A';
          townshipName = wantingList.preferred_location.township.name_en || 'N/A';
        } else if (wantingList.location) {
          // Use the location format (fallback)
          regionName = wantingList.location.region_en || 'N/A';
          townshipName = wantingList.location.township_en || 'N/A';
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
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        const budget = typeof wantingList.budget === 'object' ? wantingList.budget : null;
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
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        const specs = typeof wantingList.specifications === 'object' ? wantingList.specifications : null;
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
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        const contact = typeof wantingList.contact === 'object' ? wantingList.contact : null;
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
    //   render: (_value, wantingList) => {
    //     if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
    //     return <StatusChip status={typeof wantingList.status?.status === 'string' ? wantingList.status.status : 'unknown'} />;
    //   },
    // },
    {
      id: 'isActive',
      label: 'Active Status',
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        const isActive = typeof wantingList.is_active === 'boolean' ? wantingList.is_active : undefined;
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
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {typeof wantingList.created_at === 'string' && wantingList.created_at ? formatDate(wantingList.created_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'expiresAt',
      label: 'Expires At',
      render: (_value, wantingList) => {
        if (!wantingList || typeof wantingList !== 'object') return <Typography variant="body2">No data</Typography>;

        return (
          <Typography variant="body2" color="textSecondary">
            {typeof wantingList.status?.expires_at === 'string' && wantingList.status.expires_at ? formatDate(wantingList.status.expires_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, wantingListing) => {
        if (!wantingListing || typeof wantingListing !== 'object') return <Typography variant="body2">No data</Typography>;

        // Properly check if deleted_at field exists and is not null/undefined/empty
        let isDeleted = false;
        if (wantingListing.deleted_at === null ||
            wantingListing.deleted_at === undefined ||
            wantingListing.deleted_at === '') {
          isDeleted = false;
        } else {
          // If it's a string, check if it's not empty
          // If it's an object, consider it as deleted if it exists
          isDeleted = (typeof wantingListing.deleted_at === 'string' && wantingListing.deleted_at.trim() !== '') ||
                      (typeof wantingListing.deleted_at === 'object' && wantingListing.deleted_at !== null);
        }

        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Primary Actions - View Details and Edit (always visible for non-deleted) */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/wanting-listings/${typeof wantingListing.slug === 'string' ? wantingListing.slug : ''}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>

            {/* Edit button - only for non-deleted wanting listings */}
            {!isDeleted && (
              <IconButton
                size="small"
                onClick={() => navigate(`/wanting-listings/${typeof wantingListing.slug === 'string' ? wantingListing.slug : ''}/edit`)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            )}

            {/* Secondary Actions - Dropdown Menu */}
            {!isDeleted && (
              <>
                <Tooltip title="More Actions">
                  <IconButton
                    size="small"
                    onClick={(e) => typeof wantingListing.slug === 'string' ? handleActionMenuOpen(e, wantingListing) : undefined}
                    color="default"
                    sx={{
                      bgcolor: 'grey.100',
                      '&:hover': { bgcolor: 'grey.200' }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>

                {/* Action Menu */}
                <Menu
                  anchorEl={actionMenuAnchor}
                  open={Boolean(actionMenuAnchor && selectedWantingListForMenu?.slug === wantingListing.slug)}
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
                  {/* Toggle Status Action */}
                  <MenuItem onClick={() => handleMenuAction('toggle-status')}>
                    <ListItemIcon>
                      {typeof wantingListing.is_active === 'boolean' && wantingListing.is_active ? <CancelIcon color="error" /> : <CheckCircleIcon color="success" />}
                    </ListItemIcon>
                    <ListItemText>
                      {typeof wantingListing.is_active === 'boolean' && wantingListing.is_active ? 'Disable' : 'Enable'}
                    </ListItemText>
                  </MenuItem>

                  {/* Delete action */}
                  <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <DeleteIcon color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Restore action - Only for deleted wanting listings */}
            {isDeleted && (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestoreWantingList(wantingListing)}
                  color="success"
                  disabled={restoreWantingListMutation.isPending}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [isMobile, navigate, deleteWantingListMutation.isPending, restoreWantingListMutation.isPending, actionMenuAnchor, selectedWantingListForMenu]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (wantingList: WantingList): MobileCardAction[] => {
    // Defensive check to ensure we have a valid wanting list object
    if (!wantingList || typeof wantingList !== 'object') {
      return [];
    }

    // Properly check if deleted_at field exists and is not null/undefined/empty
    let isDeleted = false;
    if (wantingList.deleted_at === null ||
        wantingList.deleted_at === undefined ||
        wantingList.deleted_at === '') {
      isDeleted = false;
    } else {
      // If it's a string, check if it's not empty
      // If it's an object, consider it as deleted if it exists
      isDeleted = (typeof wantingList.deleted_at === 'string' && wantingList.deleted_at.trim() !== '') ||
                  (typeof wantingList.deleted_at === 'object' && wantingList.deleted_at !== null);
    }
    const slug = typeof wantingList.slug === 'string' ? wantingList.slug : '';

    const baseActions: MobileCardAction[] = [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/wanting-listings/${slug}`),
      },
    ];

    if (!isDeleted) {
      baseActions.push(
        {
          icon: <EditIcon />,
          tooltip: 'Edit',
          color: 'secondary' as const,
          onClick: () => navigate(`/wanting-listings/${slug}/edit`),
        },
        {
          icon: <DeleteIcon />,
          tooltip: 'Delete',
          color: 'error' as const,
          onClick: () => handleDeleteWantingList(wantingList),
        }
      );
    } else {
      baseActions.push({
        icon: <RestoreIcon />,
        tooltip: 'Restore',
        color: 'success' as const,
        onClick: () => handleRestoreWantingList(wantingList),
      });
    }

    return baseActions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteWantingList = (wantingListing: WantingList) => {
    openDeleteConfirmation(
      wantingListing.title,
      'wanting listing',
      async () => {
        try {
          await deleteWantingListMutation.mutateAsync(wantingListing.slug);
          showSuccess(`${wantingListing.title} deleted successfully!`, true);
        } catch (error: any) {
          // Handle validation errors from API response
          if ((error as any)?.response?.data?.message) {
            showError((error as any).response.data.message, true);
          } else if ((error as any)?.response?.data?.errors) {
            // Handle validation errors object (e.g., Laravel validation errors)
            const errorMessages = Object.values((error as any).response.data.errors).flat();
            showError(errorMessages.join('\n'), true);
          } else {
            showError(error.message || 'Failed to delete wanting listing. Please try again.', true);
          }
        }
      }
    );
  };

  const handleRestoreWantingList = (wantingListing: WantingList) => {
    setWantingListToRestore(wantingListing);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!wantingListToRestore) return;

    try {
      await restoreWantingListMutation.mutateAsync(wantingListToRestore.slug);
      showSuccess(`${wantingListToRestore.title} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      setWantingListToRestore(null);
    } catch (error: any) {
      // Handle validation errors from API response
      if ((error as any)?.response?.data?.message) {
        showError((error as any).response.data.message, true);
      } else if ((error as any)?.response?.data?.errors) {
        // Handle validation errors object (e.g., Laravel validation errors)
        const errorMessages = Object.values((error as any).response.data.errors).flat();
        showError(errorMessages.join('\n'), true);
      } else {
        showError(error.message || 'Failed to restore wanting listing. Please try again.', true);
      }
    }
  };

  const handleToggleStatus = (wantingListing: WantingList) => {
    toggleWantingListStatusMutation.mutate(wantingListing.slug, {
      onSuccess: (data) => {
        const newStatus = data.data.is_active ? 'enabled' : 'disabled';
        showSuccess(`${wantingListing.title} ${newStatus} successfully!`, true);
      },
      onError: (error: any) => {
        showError(error.message || 'Failed to toggle status. Please try again.', true);
      }
    });
  };

  const handleAddWantingListing = () => {
    navigate('/wanting-listings/create');
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
      setFilter(key as keyof WantingListFilters, value);
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
    let errorMessage = error.message || 'An error occurred while loading wanting listings';

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
          title="Wanting Listings"
          subtitle="Manage wanting list entries"
          actionButton={{
            text: "Refresh",
            icon: <MoreVertIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Wanting Listings"
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
        breadcrumbs="Dashboard / Wanting List Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddWantingListing
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
          aria-label="wanting listing status tabs"
        >
          <Tab
            label={`Active Wanting Lists`}
            id="wanting-list-tab-0"
            aria-controls="wanting-list-tabpanel-0"
          />
          <Tab
            label={`Deleted Wanting Lists`}
            id="wanting-list-tab-1"
            aria-controls="wanting-list-tabpanel-1"
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
                showRowNumber={true}
              />
            ))
          ) : error ? (
            <PageErrorState
              error={error}
              title="Error Loading Wanting Listings"
              message={(error as any)?.message || 'Failed to load wanting listings'}
              onRetry={() => window.location.reload()}
            />
          ) : filteredWantingLists.length > 0 ? (
            paginatedWantingLists.map((wantingList: any, index: number) => (
              <MobileCard
                key={wantingList.slug}
                title={wantingList.title}
                subtitle={typeof wantingList.description === 'string' && wantingList.description.length > 0
                  ? wantingList.description.substring(0, 50) + '...'
                  : typeof wantingList.additional_requirement === 'string' && wantingList.additional_requirement.length > 0
                  ? wantingList.additional_requirement.substring(0, 50) + '...'
                  : 'N/A'}
                rowNumber={((activeTab === 0 ? activePage : deletedPage) * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={`${wantingList.contact?.name || 'N/A'} - ${wantingList.contact?.phone || 'N/A'}`}
                avatar={<HomeIcon />}
                avatarColor="primary.main"
                status={
                  wantingList
                  ? {
                      label: wantingList.status?.status === 'published' ? 'Published' :
                             wantingList.status?.status === 'draft' ? 'Draft' :
                             wantingList.status?.status === 'expired' ? 'Expired' :
                             wantingList.status?.status === 'closed' ? 'Closed' : 'Unknown',
                      color: 'default',
                    }
                  : undefined
                }
                chips={
                  wantingList
                  ? [
                      {
                        label: typeof wantingList.wanted_type === 'string'
                          ? wantingList.wanted_type === 'buyer'
                            ? 'Buyer'
                            : wantingList.wanted_type === 'renter'
                              ? 'Renter'
                              : wantingList.wanted_type
                          : 'Unknown',
                        color: typeof wantingList.wanted_type === 'string' && wantingList.wanted_type === 'buyer' ? 'primary' : 'secondary',
                      },
                      {
                        label: `${wantingList.property_type?.name_en || 'N/A'}`,
                        color: 'info',
                      },
                      {
                        label: wantingList.preferred_location?.region
                          ? `${wantingList.preferred_location.region.name_en || 'N/A'}, ${wantingList.preferred_location.township.name_en || 'N/A'}`
                          : wantingList.location
                          ? `${wantingList.location.region_en || 'N/A'}, ${wantingList.location.township_en || 'N/A'}`
                          : 'N/A',
                        color: 'warning',
                      },
                      {
                        label: `Budget: ${wantingList.budget?.min_budget || 0} - ${wantingList.budget?.max_budget || 0}`,
                        color: 'info',
                      },
                    ]
                  : []
                }
                actions={createMobileCardActions(wantingList)}
                onClick={() => navigate(`/wanting-listings/${wantingList.slug}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Wanting Listings Found"
              message="No wanting listings match your current filters. Try adjusting your search criteria."
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
            title="Error Loading Wanting Listings"
            message={(error as any)?.message || 'Failed to load wanting listings'}
            onRetry={() => window.location.reload()}
          />
        ) : filteredWantingLists.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Wanting Listings Found"
            message={searchTerm || filters.typeFilter !== 'all' || filters.regionFilter !== 'all' || filters.townshipFilter !== 'all' || filters.propertyTypeFilter !== 'all'
              ? "No wanting listings match your current filters. Try adjusting your search criteria."
              : "No wanting listings have been created yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={paginatedWantingLists}
          page={activeTab === 0 ? activePage : deletedPage}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={activeTab === 0 ? (_, newPage) => setActivePage(newPage) : (_, newPage) => setDeletedPage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(wantingList) => wantingList?.slug}
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
        isLoading={deleteWantingListMutation.isPending}
        error={deleteWantingListMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setWantingListToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={wantingListToRestore?.title}
        itemType="wanting list"
        action="restore"
        isLoading={restoreWantingListMutation.isPending}
        error={restoreWantingListMutation.error?.message}
      />
    </Box>
  );
};

export default WantingListingListPage;