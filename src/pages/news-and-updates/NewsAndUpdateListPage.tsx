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
import { useNewsAndUpdates, useDeleteNewsAndUpdate } from '../../services/queries/news-and-updates';
import { useNewsArticleCategories } from '../../services/queries/news-article-categories';
import { FilterState } from '../../constants/filters';
import { NewsAndUpdate } from '../../types/newsAndUpdate';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NewsAndUpdateFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'News & Updates Management',
  description: 'Manage all news and updates in the system',
  createButtonText: 'Add News & Update',
  createButtonPath: '/news-and-updates/create',
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

const NewsAndUpdateListPage: React.FC = () => {
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
  } = useFilters<NewsAndUpdateFilters>({
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
  const { data: newsAndUpdatesResponse, isLoading, error, refetch } = useNewsAndUpdates({
    per_page: 100, // Get all news for client-side filtering
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const { data: categoriesResponse } = useNewsArticleCategories({
    type: 'news_update',
    per_page: 100,
  });

  // Delete mutation
  const deleteNewsAndUpdateMutation = useDeleteNewsAndUpdate();

  // Extract data
  const newsAndUpdates = newsAndUpdatesResponse?.data || [];
  const allCategories = categoriesResponse?.data || [];
  
  // Filter categories to show only news_update type and non-deleted
  const categories = allCategories.filter(category => 
    category.type === 'news_update' && 
    !category.deleted_at
  );

  // Create filter fields
  const filterFields = createFilterFields(categories);

  // Filter news using client-side filtering (only active news)
  const filteredNews = useMemo(() => {
    if (!newsAndUpdates || newsAndUpdates.length === 0) return [];
    
    const validNews = newsAndUpdates.filter(news => news != null);
    
    return validNews.filter((news) => {
      // Only show active news (not deleted)
      if (news.deleted_at) return false;
      
      const matchesSearch = !filters.searchTerm || 
        news.title_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        news.title_mm.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        news.short_description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        news.main_content.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && news.is_active) ||
        (filters.statusFilter === 'inactive' && !news.is_active);
      
      const matchesCategory = filters.categoryFilter === 'all' || 
        news.category.id.toString() === filters.categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [newsAndUpdates, filters]);

  // Paginate data
  const paginatedNews = useMemo(() => {
    return filteredNews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredNews, page, rowsPerPage]);

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total News & Updates',
      value: newsAndUpdates.filter(news => !news.deleted_at).length,
      color: 'primary',
      icon: <ArticleIcon />,
    },
    {
      title: 'Active News',
      value: newsAndUpdates.filter(news => news.is_active && !news.deleted_at).length,
      color: 'success',
      icon: <ArticleIcon />,
    },
    {
      title: 'Total Views',
      value: newsAndUpdates.filter(news => !news.deleted_at).reduce((sum, news) => sum + news.view_count, 0),
      color: 'info',
      icon: <ArticleIcon />,
    },
    {
      title: 'Total Likes',
      value: newsAndUpdates.filter(news => !news.deleted_at).reduce((sum, news) => sum + news.like_count, 0),
      color: 'secondary',
      icon: <ArticleIcon />,
    },
  ], [newsAndUpdates]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<NewsAndUpdate>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Title',
      render: (_value, news) => {
        if (!news) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {news.title_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {news.title_mm}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'category',
      label: 'Category',
      render: (_value, news) => {
        if (!news) return <Typography variant="body2">No data</Typography>;
        if (!news.category) return <Typography variant="body2" color="textSecondary">No category</Typography>;
        return (
          <Chip
            label={news.category.name_en}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
      hidden: isMobile,
    },
    {
      id: 'writer',
      label: 'Writer',
      render: (_value, news) => {
        if (!news) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {news.writer_name}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'stats',
      label: 'Views / Likes',
      render: (_value, news) => {
        if (!news) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" color="textSecondary">
              {news.view_count} views
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {news.like_count} likes
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, news) => {
        if (!news) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={news.is_active ? 'active' : 'inactive'} 
            size="small" 
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, news) => {
        if (!news) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {formatDate(news.created_at, 'display')}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, news) => {
        if (!news) return <Typography variant="body2">No data</Typography>;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => handleView(news)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/news-and-updates/${news.slug}/edit`)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDeleteNews(news)}
                color="error"
                disabled={deleteNewsAndUpdateMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [isMobile, navigate, deleteNewsAndUpdateMutation.isPending]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (news: NewsAndUpdate): MobileCardAction[] => {
    return [
      {
        icon: <ViewIcon />,
        tooltip: 'View',
        color: 'primary' as const,
        onClick: () => handleView(news),
      },
      {
        icon: <EditIcon />,
        tooltip: 'Edit',
        color: 'secondary' as const,
        onClick: () => navigate(`/news-and-updates/${news.slug}/edit`),
      },
      {
        icon: <DeleteIcon />,
        tooltip: 'Delete',
        color: 'error' as const,
        onClick: () => handleDeleteNews(news),
      },
    ];
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================


  const handleDeleteNews = (news: NewsAndUpdate) => {
    openDeleteConfirmation(
      `${news.title_en} (${news.title_mm})`,
      'news & update',
      async () => {
        try {
          await deleteNewsAndUpdateMutation.mutateAsync(news.slug);
          showSuccess(`${news.title_en} deleted successfully!`, true);
        } catch (error: any) {
          // Show API response error message if available, otherwise show generic message
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Failed to delete news & update. Please try again.';
          showError(errorMessage, true);
        }
      }
    );
  };

  const handleAddNews = () => {
    navigate('/news-and-updates/create');
  };

  const handleView = (news: NewsAndUpdate) => {
    navigate(`/news-and-updates/${news.slug}`);
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
        breadcrumbs="Dashboard / Content Management / News & Updates"
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddNews,
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof NewsAndUpdateFilters, value)}
        fields={filterFields}
      />


      {/* Empty state */}
      {filteredNews.length === 0 && !isLoading && (
        <PageEmptyState
          title="No News & Updates Found"
          message={filters.searchTerm || filters.statusFilter !== 'all' || filters.categoryFilter !== 'all'
            ? "No news & updates match your current filters. Try adjusting your search criteria."
            : "No news & updates found. Create your first news & update to get started."}
          actionButton={{
            text: 'Add News & Update',
            icon: <AddIcon />,
            onClick: handleAddNews,
          }}
        />
      )}

      {/* Content */}
      {filteredNews.length > 0 && (
        isMobile ? (
          // Mobile Cards
          <Box>
            {paginatedNews.map((news: NewsAndUpdate) => (
              <MobileCard
                key={news.id}
                title={news.title_en}
                subtitle={news.title_mm}
                description={news.short_description}
                actions={createMobileCardActions(news)}
                chips={[
                  { label: news.category?.name_en || 'No category', color: 'primary' },
                  { label: `${news.view_count} views`, color: 'info' },
                  { label: `${news.like_count} likes`, color: 'secondary' },
                ]}
              />
            ))}
          </Box>
        ) : (
          // Desktop Table
          <StandardTable
            columns={columns}
            data={paginatedNews}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredNews.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(news) => news.id}
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
        isLoading={deleteNewsAndUpdateMutation.isPending}
        error={deleteNewsAndUpdateMutation.error?.message}
      />

    </Box>
  );
};

export default NewsAndUpdateListPage;
