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
  Business as BusinessIcon,
  AttachMoney as PriceIcon,
  Visibility as ViewCountIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  ConfirmationDialog, 
  ActionAlert 
} from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useAdvertisements, useDeleteAdvertisement, useRejectAdvertisement, useRenewAdvertisement } from '../../services/queries/advertisements';
import { FilterState } from '../../constants/filters';
import { Advertisement } from '../../types/advertisement';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AdvertisementFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  verificationFilter: string;
  priceTypeFilter: string;
  expiringFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Advertisement Management',
  description: 'Manage all advertisements in the system',
  createButtonText: 'Add Advertisement',
  createButtonPath: '/advertisements/create',
} as const;

const createFilterFields = (): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title, description, or contact...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'expired', label: 'Expired' },
      { value: 'rejected', label: 'Rejected' },
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
    key: 'priceTypeFilter',
    type: 'select',
    label: 'Price Type',
    options: [
      { value: 'all', label: 'All Price Types' },
      { value: 'monthly_rent', label: 'Monthly Rent' },
      { value: 'yearly_rent', label: 'Yearly Rent' },
      { value: 'sale_price', label: 'Sale Price' },
      { value: 'negotiable', label: 'Negotiable' },
      { value: 'contact_for_price', label: 'Contact for Price' },
      { value: 'free', label: 'Free' },
    ],
  },
  {
    key: 'expiringFilter',
    type: 'select',
    label: 'Expiry Status',
    options: [
      { value: 'all', label: 'All Advertisements' },
      { value: 'expiring_soon', label: 'Expiring Soon' },
      { value: 'active', label: 'Active Only' },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdvertisementListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const { filters, setFilter } = useFilters<AdvertisementFilters>({
    searchTerm: '',
    statusFilter: 'all',
    verificationFilter: 'all',
    priceTypeFilter: 'all',
    expiringFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted advertisements
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Action confirmation states
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [renewConfirmOpen, setRenewConfirmOpen] = useState(false);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null);

  // API Queries
  const { data: advertisementsResponse, isLoading, error, refetch } = useAdvertisements({
    per_page: 100, // Get all advertisements for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });



  // Mutations
  const deleteAdvertisementMutation = useDeleteAdvertisement();
  const rejectAdvertisementMutation = useRejectAdvertisement();
  const renewAdvertisementMutation = useRenewAdvertisement();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete: handleDeleteConfirm,
  } = useDeleteConfirmation();

  // ========================================================================
  // DATA PROCESSING
  // ========================================================================

  // Extract advertisements data
  const advertisements = advertisementsResponse?.data || [];
  
  // Create filter fields
  const filterFields = createFilterFields();

  // Filter advertisements using client-side filtering
  const filteredAdvertisements = useMemo(() => {
    if (!advertisements || advertisements.length === 0) return [];
    
    const validAdvertisements = advertisements.filter(advertisement => advertisement != null);
    
    return validAdvertisements.filter(advertisement => {
      // Check if advertisement is deleted using is_deleted field
      const isDeleted = advertisement.is_deleted;
      
      // Apply tab filter (0 = Active, 1 = Deleted)
      if (activeTab === 0 && isDeleted) return false;
      if (activeTab === 1 && !isDeleted) return false;
      
      const matchesSearch = 
        advertisement.title_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        advertisement.title_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        advertisement.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        advertisement.contact_name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || 
        advertisement.status === filters.statusFilter;
      
      const matchesVerification = filters.verificationFilter === 'all' || 
        advertisement.verification_status === filters.verificationFilter;
      
      const matchesPriceType = filters.priceTypeFilter === 'all' || 
        advertisement.price?.type === filters.priceTypeFilter;
      
      // Apply expiring filter
      let matchesExpiring = true;
      if (filters.expiringFilter !== 'all') {
        const isExpiringSoon = advertisement.is_expiring_soon || false;
        if (filters.expiringFilter === 'expiring_soon') {
          matchesExpiring = isExpiringSoon;
        } else if (filters.expiringFilter === 'active') {
          matchesExpiring = !advertisement.is_expired;
        }
      }
      
      return matchesSearch && matchesStatus && matchesVerification && matchesPriceType && matchesExpiring;
    });
  }, [advertisements, filters, activeTab]);

  // Paginate data
  const paginatedAdvertisements = useMemo(() => {
    return filteredAdvertisements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAdvertisements, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Advertisements',
      value: advertisements.length,
      color: 'primary',
      icon: <BusinessIcon />,
    },
    {
      title: 'Active Advertisements',
      value: advertisements.filter(advertisement => !advertisement.is_deleted).length,
      color: 'success',
      icon: <BusinessIcon />,
    },
    {
      title: 'Pending Advertisements',
      value: advertisements.filter(advertisement => advertisement.verification_status === 'pending' && !advertisement.is_deleted).length,
      color: 'warning',
      icon: <BusinessIcon />,
    },
    {
      title: 'Published',
      value: advertisements.filter(advertisement => advertisement.status === 'published' && !advertisement.is_deleted).length,
      color: 'info',
      icon: <BusinessIcon />,
    },
  ], [advertisements]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Advertisement>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {advertisement.title_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {advertisement.title_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'user',
      label: 'User',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {advertisement.user || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {advertisement.user_type || 'Unknown'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'location',
      label: 'Location',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {advertisement.location?.region?.name_en || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {advertisement.location?.region?.name_mm || ''}
            </Typography>
            <Typography variant="body2" fontWeight="500" sx={{ mt: 0.5 }}>
              {advertisement.location?.township?.name_en || 'N/A'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {advertisement.location?.township?.name_mm || ''}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'price',
      label: 'Price',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PriceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {advertisement.price?.formatted || 'Contact for price'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'verificationStatus',
      label: 'Verification',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return <StatusChip status={advertisement.verification_status} statusType="verification_status" />;
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return <StatusChip status={advertisement.status} />;
      },
    },
    {
      id: 'views',
      label: 'Views',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewCountIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {advertisement.stats?.view_count || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },

    {
      id: 'favorites',
      label: 'Favorites',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FavoriteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="500">
              {advertisement.stats?.favorite_count || 0}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {advertisement.dates?.created_at ? formatDate(advertisement.dates.created_at, 'display') : formatDate(advertisement.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'expiresAt',
      label: 'Expires At',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        
        // Only show expiration date for approved advertisements
        if (advertisement.verification_status !== 'approved') {
          return <Typography variant="body2" color="textSecondary">-</Typography>;
        }
        
        return (
          <Typography variant="body2" color="textSecondary">
            {advertisement.dates?.expires_at ? formatDate(advertisement.dates.expires_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, advertisement) => {
        if (!advertisement) return <Typography variant="body2">No data</Typography>;
        
        const isDeleted = advertisement.is_deleted;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => handleView(advertisement)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            
            {/* Show different actions based on deleted status */}
            {!isDeleted ? (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(advertisement)}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(advertisement)}
                    color="error"
                    disabled={deleteAdvertisementMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestore(advertisement)}
                  color="success"
                  disabled={false} // Add restore mutation when available
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [isMobile]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const getMobileCardActions = (advertisement: Advertisement): MobileCardAction[] => [
    {
      tooltip: 'View',
      icon: <ViewIcon />,
      onClick: () => handleView(advertisement),
      color: 'primary',
    },
    {
      tooltip: 'Edit',
      icon: <EditIcon />,
      onClick: () => handleEdit(advertisement),
      color: 'primary',
    },
    {
      tooltip: 'Delete',
      icon: <DeleteIcon />,
      onClick: () => handleDelete(advertisement),
      color: 'error',
    },
  ];

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset to first page when switching tabs
    handleChangePage(event, 0);
  };

  const handleView = (advertisement: Advertisement) => {
    navigate(`/advertisements/${advertisement.id}`);
  };

  const handleEdit = (advertisement: Advertisement) => {
    navigate(`/advertisements/${advertisement.id}/edit`);
  };

  const handleDelete = (advertisement: Advertisement) => {
    openDeleteConfirmation(
      advertisement.title_en,
      'advertisement',
      async () => {
        try {
          await deleteAdvertisementMutation.mutateAsync(advertisement.id);
          showSuccess('Advertisement deleted successfully');
        } catch (error) {
          showError('Failed to delete advertisement');
        }
      }
    );
  };



  const handleReject = async (reason?: string) => {
    if (!selectedAdvertisement) return;
    
    try {
      await rejectAdvertisementMutation.mutateAsync({ 
        id: selectedAdvertisement.id, 
        reason: reason || 'Rejected by admin'
      });
      showSuccess('Advertisement rejected successfully');
      setRejectConfirmOpen(false);
      setSelectedAdvertisement(null);
    } catch (error) {
      showError('Failed to reject advertisement');
    }
  };

  const handleRenew = async () => {
    if (!selectedAdvertisement) return;
    
    try {
      await renewAdvertisementMutation.mutateAsync(selectedAdvertisement.id);
      showSuccess('Advertisement renewed successfully');
      setRenewConfirmOpen(false);
      setSelectedAdvertisement(null);
    } catch (error) {
      showError('Failed to renew advertisement');
    }
  };

  const handleRestore = (_advertisement: Advertisement) => {
    // TODO: Implement restore functionality when API is available
    showError('Restore functionality not yet implemented');
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
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
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
        onFilterChange={setFilter}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Active (${advertisements.filter(a => !a.is_deleted).length})`} />
          <Tab label={`Deleted (${advertisements.filter(a => a.is_deleted).length})`} />
        </Tabs>
      </Box>

      {/* Content */}
      {filteredAdvertisements.length === 0 ? (
        <PageEmptyState
          title="No Advertisements Found"
          message="No advertisements match your current filters."
          actionButton={{
            text: 'Add Advertisement',
            icon: <AddIcon />,
            onClick: () => navigate(PAGE_CONFIG.createButtonPath),
          }}
        />
      ) : isMobile ? (
        // Mobile Cards
        <Box>
          {paginatedAdvertisements.map((advertisement: Advertisement) => (
            <MobileCard
              key={advertisement.id}
              title={advertisement.title_en}
              subtitle={advertisement.title_mm}
              description={advertisement.description}
              actions={getMobileCardActions(advertisement)}
              chips={[
                { label: advertisement.status, color: 'primary' },
                { label: advertisement.verification_status, color: 'secondary' },
                ...(advertisement.is_featured ? [{ label: 'Featured', color: 'secondary' as const }] : []),
              ]}
            />
          ))}
        </Box>
      ) : (
        // Desktop Table
        <StandardTable
          columns={columns}
          data={paginatedAdvertisements}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredAdvertisements.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onConfirm={handleDeleteConfirm}
        onClose={closeDeleteConfirmation}
        title="Delete Advertisement"
        message={`Are you sure you want to delete "${deleteState.itemName}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        open={rejectConfirmOpen}
        onConfirm={handleReject}
        onClose={() => {
          setRejectConfirmOpen(false);
          setSelectedAdvertisement(null);
        }}
        title="Reject Advertisement"
        message="Please provide a reason for rejecting this advertisement:"
      />

      <ConfirmationDialog
        open={renewConfirmOpen}
        onConfirm={handleRenew}
        onClose={() => {
          setRenewConfirmOpen(false);
          setSelectedAdvertisement(null);
        }}
        title="Renew Advertisement"
        message="Are you sure you want to renew this advertisement? It will extend the expiration date by 30 days."
      />
    </Box>
  );
};

export default AdvertisementListPage;
