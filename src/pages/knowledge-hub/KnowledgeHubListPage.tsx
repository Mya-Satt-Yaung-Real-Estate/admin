import React, { useMemo } from 'react';
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useKnowledgeHubs, useDeleteKnowledgeHub, useKnowledgeHubCategories } from '../../services/queries/knowledge-hub';
import { FilterState } from '../../constants/filters';
import { KnowledgeHub } from '../../types/knowledgeHub';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface KnowledgeHubFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Knowledge Hub Management',
  description: 'Manage all knowledge hub articles in the system',
  createButtonText: 'Add Knowledge Hub',
  createButtonPath: '/knowledge-hub/create',
} as const;

const createFilterFields = (categories: any[]): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title, description, or content...',
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
    key: 'categoryFilter',
    type: 'select',
    label: 'Category',
    options: [
      { value: 'all', label: 'All Categories' },
      ...categories.map(category => ({
        value: category.id.toString(),
        label: category.name_en,
      })),
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KnowledgeHubListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  } = useFilters<KnowledgeHubFilters>({
    searchTerm: '',
    statusFilter: 'all',
    categoryFilter: 'all',
  });

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // Check for success message from URL params
  React.useEffect(() => {
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage), true);
      // Clean up URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      navigate(`${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`, { replace: true });
    }
  }, [searchParams, navigate, showSuccess]);

  // API Queries
  const { data: knowledgeHubsResponse, isLoading, error, refetch } = useKnowledgeHubs({
    per_page: 100, // Get all knowledge hubs for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const { data: categoriesResponse } = useKnowledgeHubCategories({
    type: 'knowledge_hub',
    per_page: 100,
  });

  // Delete mutation
  const deleteKnowledgeHubMutation = useDeleteKnowledgeHub();

  // Extract data
  const knowledgeHubs = knowledgeHubsResponse?.data || [];
  const allCategories = categoriesResponse?.data || [];
  
  // Filter categories to show only knowledge_hub type and non-deleted
  const categories = allCategories.filter(category => 
    category.type === 'knowledge_hub' && 
    !category.deleted_at
  );

  // Create filter fields
  const filterFields = createFilterFields(categories);

  // Filter knowledge hubs using client-side filtering (only active knowledge hubs)
  const filteredKnowledgeHubs = useMemo(() => {
    if (!knowledgeHubs || knowledgeHubs.length === 0) return [];
    
    const validKnowledgeHubs = knowledgeHubs.filter(kh => kh != null);
    
    return validKnowledgeHubs.filter((kh) => {
      // Only show active knowledge hubs (not deleted)
      if (kh.deleted_at) return false;
      
      const matchesSearch = !filters.searchTerm || 
        kh.title_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        kh.title_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (kh.short_description && kh.short_description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        kh.main_content.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && kh.is_active) ||
        (filters.statusFilter === 'inactive' && !kh.is_active);
      
      const matchesCategory = filters.categoryFilter === 'all' || 
        kh.category?.id.toString() === filters.categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [knowledgeHubs, filters]);

  // Paginate data
  const paginatedKnowledgeHubs = useMemo(() => {
    return filteredKnowledgeHubs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredKnowledgeHubs, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Knowledge Hubs',
      value: knowledgeHubs.filter(kh => !kh.deleted_at).length,
      color: 'primary',
      icon: <ArticleIcon />,
    },
    {
      title: 'Active Knowledge Hubs',
      value: knowledgeHubs.filter(kh => kh.is_active && !kh.deleted_at).length,
      color: 'success',
      icon: <ArticleIcon />,
    },
    {
      title: 'Total Views',
      value: knowledgeHubs.filter(kh => !kh.deleted_at).reduce((sum, kh) => sum + kh.view_count, 0),
      color: 'info',
      icon: <ArticleIcon />,
    },
    {
      title: 'Total Likes',
      value: knowledgeHubs.filter(kh => !kh.deleted_at).reduce((sum, kh) => sum + kh.like_count, 0),
      color: 'secondary',
      icon: <ArticleIcon />,
    },
  ], [knowledgeHubs]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<KnowledgeHub>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      render: (_value, kh) => {
        if (!kh) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {kh.title_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {kh.title_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'category',
      label: 'Category',
      render: (_value, kh) => {
        if (!kh) return <Typography variant="body2">No data</Typography>;
        if (!kh.category) return <Typography variant="body2" color="textSecondary">No category</Typography>;
        return (
          <Chip
            label={kh.category.name_en}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'stats',
      label: 'Views / Likes',
      render: (_value, kh) => {
        if (!kh) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" color="textSecondary">
              {kh.view_count} views
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {kh.like_count} likes
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, kh) => {
        if (!kh) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={kh.is_active ? 'active' : 'inactive'} 
            size="small" 
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, kh) => {
        if (!kh) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(kh.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, kh) => {
        if (!kh) return <Typography variant="body2">No data</Typography>;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => handleView(kh)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/knowledge-hub/${kh.slug}/edit`)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDeleteKnowledgeHub(kh)}
                color="error"
                disabled={deleteKnowledgeHubMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [isMobile, navigate, deleteKnowledgeHubMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (kh: KnowledgeHub): MobileCardAction[] => {
    return [
      {
        icon: <ViewIcon />,
        tooltip: 'View',
        color: 'primary' as const,
        onClick: () => handleView(kh),
      },
      {
        icon: <EditIcon />,
        tooltip: 'Edit',
        color: 'secondary' as const,
        onClick: () => navigate(`/knowledge-hub/${kh.slug}/edit`),
      },
      {
        icon: <DeleteIcon />,
        tooltip: 'Delete',
        color: 'error' as const,
        onClick: () => handleDeleteKnowledgeHub(kh),
      },
    ];
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteKnowledgeHub = (kh: KnowledgeHub) => {
    openDeleteConfirmation(
      `${kh.title_en} (${kh.title_mm})`,
      'knowledge hub',
      async () => {
        try {
          await deleteKnowledgeHubMutation.mutateAsync(kh.slug);
          showSuccess(`${kh.title_en} deleted successfully!`, true);
        } catch (error: any) {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to delete knowledge hub. Please try again.';
          showError(errorMessage, true);
        }
      }
    );
  };

  const handleAddKnowledgeHub = () => {
    navigate('/knowledge-hub/create');
  };

  const handleView = (kh: KnowledgeHub) => {
    navigate(`/knowledge-hub/${kh.slug}`);
  };

  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete: handleDeleteConfirm,
  } = useDeleteConfirmation();

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
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Page Header */}
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs="Dashboard / Content Management / Knowledge Hub"
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddKnowledgeHub,
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof KnowledgeHubFilters, value)}
        fields={filterFields}
      />

      {/* Empty state */}
      {filteredKnowledgeHubs.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Knowledge Hubs Found"
          message={filters.searchTerm || filters.statusFilter !== 'all' || filters.categoryFilter !== 'all'
            ? "No knowledge hubs match your current filters. Try adjusting your search criteria."
            : "No knowledge hubs found. Create your first knowledge hub to get started."}
          actionButton={{
            text: 'Add Knowledge Hub',
            icon: <AddIcon />,
            onClick: handleAddKnowledgeHub,
          }}
        />
      )}

      {/* Content */}
      {filteredKnowledgeHubs.length > 0 && (
        isMobile ? (
          // Mobile Cards
          <Box>
            {paginatedKnowledgeHubs.map((kh: KnowledgeHub) => (
              <MobileCard
                key={kh.id}
                title={kh.title_en}
                subtitle={kh.title_mm}
                description={kh.short_description}
                actions={createMobileCardActions(kh)}
                chips={[
                  { label: kh.category?.name_en || 'No category', color: 'primary' },
                  { label: `${kh.view_count} views`, color: 'info' },
                  { label: `${kh.like_count} likes`, color: 'secondary' },
                ]}
              />
            ))}
          </Box>
        ) : (
          // Desktop Table
          <StandardTable
            columns={columns}
            data={paginatedKnowledgeHubs}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredKnowledgeHubs.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(kh) => kh.id}
          />
        )
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleDeleteConfirm}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteKnowledgeHubMutation.isPending}
        error={deleteKnowledgeHubMutation.error?.message}
      />

    </Box>
  );
};

export default KnowledgeHubListPage;
