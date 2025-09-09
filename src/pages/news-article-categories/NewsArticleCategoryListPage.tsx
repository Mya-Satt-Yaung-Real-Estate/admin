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
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useNewsArticleCategories, useDeleteNewsArticleCategory, useRestoreNewsArticleCategory } from '../../services/queries/news-article-categories';
import { FilterState } from '../../constants/filters';
import { NewsArticleCategory } from '../../types/newsArticleCategory';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NewsArticleCategoryFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Content Category Management',
  description: 'Manage content categories',
  createButtonText: 'Add Category',
  createButtonPath: '/news-article-categories/create',
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
  {
    key: 'typeFilter',
    type: 'select',
    label: 'Type',
    options: [
      { value: 'all', label: 'All Types' },
      { value: 'news_update', label: 'News & Updates' },
      { value: 'knowledge_hub', label: 'Knowledge Hub' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const NewsArticleCategoryListPage: React.FC = () => {
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

  // Tab state for active/deleted categories
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [categoryToRestore, setCategoryToRestore] = useState<NewsArticleCategory | null>(null);

  // Filters hook
  const {
    filters,
    setFilter,
  } = useFilters<NewsArticleCategoryFilters>({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all',
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
      navigate(`/news-article-categories?${newSearchParams.toString()}`, { replace: true });
    }
  }, [searchParams, showSuccess, navigate]);
  
  // Delete confirmation hook
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  // API Queries
  const { data: newsArticleCategoriesResponse, isLoading, error } = useNewsArticleCategories({
    per_page: 100, // Get all categories for client-side filtering
    sort_by: 'name_en',
    sort_direction: 'asc',
  });

  // Delete and restore mutations
  const deleteNewsArticleCategoryMutation = useDeleteNewsArticleCategory();
  const restoreNewsArticleCategoryMutation = useRestoreNewsArticleCategory();

  // Extract categories data
  const newsArticleCategories = newsArticleCategoriesResponse?.data || [];

  // Filter categories using client-side filtering
  const filteredCategories = useMemo(() => {
    if (!newsArticleCategories || newsArticleCategories.length === 0) return [];
    
    const validCategories = newsArticleCategories.filter(category => category != null);
    
    return validCategories.filter((category) => {
      // Check if category is deleted
      const isDeleted = category.deleted_at;
      
      // Apply tab filter (0 = Active, 1 = Deleted)
      if (activeTab === 0 && isDeleted) return false;
      if (activeTab === 1 && !isDeleted) return false;
      
      const matchesSearch = !filters.searchTerm || 
        category.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        category.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && category.is_active) ||
        (filters.statusFilter === 'inactive' && !category.is_active);
      
      const matchesType = filters.typeFilter === 'all' || 
        category.type === filters.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [newsArticleCategories, filters, activeTab]);

  // Paginate data
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Categories',
      value: newsArticleCategories.length,
      color: 'primary',
      icon: <CategoryIcon />,
    },
    {
      title: 'Active Categories',
      value: newsArticleCategories.filter(category => !category.deleted_at).length,
      color: 'success',
      icon: <CategoryIcon />,
    },
    {
      title: 'News & Updates',
      value: newsArticleCategories.filter(category => category.type === 'news_update' && !category.deleted_at).length,
      color: 'info',
      icon: <CategoryIcon />,
    },
    {
      title: 'Knowledge Hub',
      value: newsArticleCategories.filter(category => category.type === 'knowledge_hub' && !category.deleted_at).length,
      color: 'secondary',
      icon: <CategoryIcon />,
    },
    {
      title: 'Deleted Categories',
      value: newsArticleCategories.filter(category => category.deleted_at).length,
      color: 'error',
      icon: <CategoryIcon />,
    },
  ], [newsArticleCategories]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<NewsArticleCategory>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {category.name_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {category.name_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'type',
      label: 'Type',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        const typeLabel = category.type === 'news_update' ? 'News & Updates' : 'Knowledge Hub';
        const typeColor = category.type === 'news_update' ? 'primary' : 'secondary';
        return (
          <StatusChip 
            status={typeLabel} 
            size="small"
            sx={{
              backgroundColor: typeColor === 'primary' ? '#E3F2FD' : '#F3E5F5',
              color: typeColor === 'primary' ? '#1976D2' : '#7B1FA2',
              borderColor: typeColor === 'primary' ? '#1976D2' : '#7B1FA2',
            }}
          />
        );
      },
    },
    {
      id: 'slug',
      label: 'Slug',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {category.slug}
          </Typography>
        );
      },
      hidden: true, // Hide slug column completely
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {category.description || 'No description'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        if (category.deleted_at) {
          return <StatusChip status="deleted" size="small" />;
        }
        return (
          <StatusChip 
            status={category.is_active ? 'active' : 'inactive'} 
            size="small"
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, category) => {
        if (!category) return <Typography variant="body2">No data</Typography>;
        
        const isDeleted = category.deleted_at;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Show different actions based on deleted status */}
            {!isDeleted ? (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/news-article-categories/${category.slug}/edit`)}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteCategory(category)}
                    color="error"
                    disabled={deleteNewsArticleCategoryMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestoreCategory(category)}
                  color="success"
                  disabled={restoreNewsArticleCategoryMutation.isPending}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [isMobile, navigate, deleteNewsArticleCategoryMutation.isPending, restoreNewsArticleCategoryMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (category: NewsArticleCategory): MobileCardAction[] => {
    const actions: MobileCardAction[] = [];
    const isDeleted = category.deleted_at;

    if (!isDeleted) {
      // Add actions for non-deleted categories
      actions.push(
        {
          icon: <EditIcon />,
          tooltip: 'Edit',
          color: 'secondary' as const,
          onClick: () => navigate(`/news-article-categories/${category.slug}/edit`),
        },
        {
          icon: <DeleteIcon />,
          tooltip: 'Delete',
          color: 'error' as const,
          onClick: () => handleDeleteCategory(category),
        }
      );
    } else {
      // Add restore action for deleted categories
      actions.push({
        icon: <RestoreIcon />,
        tooltip: 'Restore',
        color: 'success' as const,
        onClick: () => handleRestoreCategory(category),
      });
    }

    return actions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleDeleteCategory = (category: NewsArticleCategory) => {
    openDeleteConfirmation(
      `${category.name_en} (${category.name_mm})`,
      'content category',
      async () => {
        try {
          await deleteNewsArticleCategoryMutation.mutateAsync(category.slug);
          showSuccess(`${category.name_en} deleted successfully!`, true);
        } catch (error: any) {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to delete content category. Please try again.';
          showError(errorMessage, true);
        }
      }
    );
  };

  const handleAddCategory = () => {
    navigate('/news-article-categories/create');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset to first page when switching tabs
    handleChangePage(event, 0);
  };

  const handleRestoreCategory = (category: NewsArticleCategory) => {
    setCategoryToRestore(category);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!categoryToRestore) return;
    
    try {
      await restoreNewsArticleCategoryMutation.mutateAsync(categoryToRestore.slug);
      showSuccess(`${categoryToRestore.name_en} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      setCategoryToRestore(null);
    } catch (error: any) {
      // Show API response error message if available, otherwise show generic message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to restore content category. Please try again.';
      showError(errorMessage, true);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Loading state
  if (isLoading) {
    return <PageLoadingState title="Loading Content Categories" />;
  }

  // Error state
  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Content Categories"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / Content Category Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddCategory
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof NewsArticleCategoryFilters, value)}
        fields={FILTER_FIELDS}
      />

      {/* Active/Deleted Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="category status tabs"
        >
          <Tab 
            label={`Active Categories (${newsArticleCategories.filter(c => !c.deleted_at).length})`} 
            id="category-tab-0"
            aria-controls="category-tabpanel-0"
          />
          <Tab 
            label={`Deleted Categories (${newsArticleCategories.filter(c => c.deleted_at).length})`} 
            id="category-tab-1"
            aria-controls="category-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Empty state */}
      {filteredCategories.length === 0 && !isLoading && (
        <PageEmptyState
          title="No Content Categories Found"
          message={filters.searchTerm || filters.statusFilter !== 'all' || filters.typeFilter !== 'all'
            ? "No categories match your current filters. Try adjusting your search criteria."
            : "No content categories have been created yet."
          }
        />
      )}

      {/* Mobile Card Layout */}
      {isMobile && filteredCategories.length > 0 ? (
        <Box>
          {paginatedCategories.map((category) => (
            <MobileCard
              key={category.id}
              title={category.name_en}
              subtitle={category.name_mm}
              description={category.description || 'No description'}
              avatar={<CategoryIcon />}
              avatarColor="primary.main"
              status={{
                label: category.is_active ? 'Active' : 'Inactive',
                color: category.is_active ? 'success' : 'error',
              }}
              chips={[
                {
                  label: category.type === 'news_update' ? 'News & Updates' : 'Knowledge Hub',
                  color: category.type === 'news_update' ? 'primary' : 'secondary',
                },
              ]}
              actions={createMobileCardActions(category)}
              onClick={() => navigate(`/news-article-categories/${category.id}`)}
              clickable={true}
            />
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredCategories.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredCategories.length > 0 && (
          <StandardTable
            columns={columns}
            data={paginatedCategories}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredCategories.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(category) => category.id}
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
        isLoading={deleteNewsArticleCategoryMutation.isPending}
        error={deleteNewsArticleCategoryMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setCategoryToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={categoryToRestore?.name_en}
        itemType="content category"
        action="restore"
        isLoading={restoreNewsArticleCategoryMutation.isPending}
        error={restoreNewsArticleCategoryMutation.error?.message}
      />
    </Box>
  );
};

export default NewsArticleCategoryListPage;
