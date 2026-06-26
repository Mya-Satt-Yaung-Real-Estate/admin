import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { ActionAlert, PageErrorState } from '../../components/ui';
import { useAlertSystem, useManualSearch, usePagination } from '../../hooks';
import {
  useDeleteHomeExploreCategory,
  useHomeExploreCategories,
  useReorderHomeExploreCategories,
} from '../../services/queries/homeExploreCategories';
import {
  HOME_EXPLORE_CATEGORY_MAX_ACTIVE,
  HomeExploreCategory,
} from '../../types/homeExploreCategory';

const filterFields: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title, description, or path...',
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
];

const HomeExploreCategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { alert, showError, showSuccess, clearAlert } = useAlertSystem();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: categoriesResponse, isLoading, error } = useHomeExploreCategories({
    sort_by: 'sort_order',
    sort_direction: 'asc',
    search: searchTerm || undefined,
    is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  const { data: allCategoriesResponse } = useHomeExploreCategories({
    sort_by: 'sort_order',
    sort_direction: 'asc',
  });

  const deleteCategoryMutation = useDeleteHomeExploreCategory();
  const reorderMutation = useReorderHomeExploreCategories();

  const categories = categoriesResponse?.data || [];
  const allCategories = allCategoriesResponse?.data || [];
  const canReorder = !searchTerm && statusFilter === 'all';
  const activeCount = categories.filter((category) => category.is_active).length;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (!successMessage) return;

    showSuccess(decodeURIComponent(successMessage));
    const newSearch = new URLSearchParams(location.search);
    newSearch.delete('success');
    navigate(`${location.pathname}${newSearch.toString() ? `?${newSearch.toString()}` : ''}`, { replace: true });
  }, [location.pathname, location.search, navigate, showSuccess]);

  const handleDelete = useCallback((category: HomeExploreCategory) => {
    if (!window.confirm(`Are you sure you want to delete "${category.title_en}"?`)) {
      return;
    }

    deleteCategoryMutation.mutate(category.id, {
      onSuccess: () => showSuccess('Explore category deleted successfully.'),
      onError: (deleteError: Error) => showError(deleteError?.message || 'Failed to delete explore category.', true),
    });
  }, [deleteCategoryMutation, showError, showSuccess]);

  const handleMove = useCallback((index: number, direction: 'up' | 'down') => {
    if (!canReorder) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= allCategories.length) return;

    const ordered = [...allCategories];
    const [moved] = ordered.splice(index, 1);
    ordered.splice(swapIndex, 0, moved);

    const items = ordered.map((category, position) => ({
      id: category.id,
      sort_order: position + 1,
    }));

    reorderMutation.mutate(items, {
      onSuccess: () => showSuccess('Explore categories reordered successfully.'),
      onError: (reorderError: Error) => showError(reorderError?.message || 'Failed to reorder explore categories.', true),
    });
  }, [allCategories, canReorder, reorderMutation, showError, showSuccess]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      handleInputChange(value);
      return;
    }

    if (key === 'statusFilter') {
      setStatusFilter(value);
    }
  };

  const handleClearFilters = () => {
    clearSearch();
    setStatusFilter('all');
  };

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Categories',
      value: categories.length,
      color: 'primary',
      icon: <CategoryIcon />,
    },
    {
      title: 'Active on Home',
      value: `${activeCount} / ${HOME_EXPLORE_CATEGORY_MAX_ACTIVE}`,
      color: 'success',
      icon: <StarIcon />,
    },
    {
      title: 'Inactive',
      value: categories.length - activeCount,
      color: 'warning',
      icon: <CategoryIcon />,
    },
  ], [activeCount, categories.length]);

  const paginatedCategories = useMemo(
    () => categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [categories, page, rowsPerPage],
  );

  const columns: TableColumn<HomeExploreCategory>[] = useMemo(() => [
    {
      id: 'sort_order',
      label: 'Order',
      render: (_, category) => {
        const globalIndex = canReorder
          ? allCategories.findIndex((item) => item.id === category.id)
          : -1;
        const displayOrder = globalIndex >= 0 ? globalIndex + 1 : category.sort_order;

        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 20 }}>
              {displayOrder}
            </Typography>
            <Stack direction="column" spacing={0}>
              <Tooltip title={canReorder ? 'Move up' : 'Clear filters to reorder'}>
                <span>
                  <IconButton
                    size="small"
                    disabled={!canReorder || globalIndex <= 0 || reorderMutation.isPending}
                    onClick={() => handleMove(globalIndex, 'up')}
                  >
                    <ArrowUpwardIcon fontSize="inherit" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={canReorder ? 'Move down' : 'Clear filters to reorder'}>
                <span>
                  <IconButton
                    size="small"
                    disabled={
                      !canReorder
                      || globalIndex < 0
                      || globalIndex >= allCategories.length - 1
                      || reorderMutation.isPending
                    }
                    onClick={() => handleMove(globalIndex, 'down')}
                  >
                    <ArrowDownwardIcon fontSize="inherit" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        );
      },
    },
    {
      id: 'title',
      label: 'Title',
      render: (_, category) => (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              {category.title_en}
            </Typography>
            {category.sort_order === 1 ? (
              <Chip label="Featured" size="small" color="warning" variant="outlined" />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block">
            {category.title_mm}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'description_en',
      label: 'Description (EN)',
      render: (_, category) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }} noWrap>
          {category.description_en || '—'}
        </Typography>
      ),
    },
    {
      id: 'link_path',
      label: 'URL',
      render: (_, category) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', maxWidth: 260 }} noWrap>
          {category.link_path}
        </Typography>
      ),
    },
    {
      id: 'icon_key',
      label: 'Icon',
      render: (_, category) => (
        <Chip label={category.icon_key || 'home'} size="small" variant="outlined" />
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (_, category) => (
        <Chip
          label={category.is_active ? 'Active' : 'Inactive'}
          color={category.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, category) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/home-explore-categories/${category.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDelete(category)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [allCategories, canReorder, handleDelete, handleMove, navigate, reorderMutation.isPending]);

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Failed to load explore categories"
        message="Please try refreshing the page."
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Explore Category"
        subtitle="Manage home page Explore by Category cards"
        breadcrumbs="Dashboard / Settings / Explore Category"
        actionButton={{
          text: 'Add Explore Category',
          icon: <AddIcon />,
          onClick: () => navigate('/home-explore-categories/create'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Alert severity="info" sx={{ mb: 2 }}>
        Up to {HOME_EXPLORE_CATEGORY_MAX_ACTIVE} categories can be active on the home page.
        Sort order <strong>1</strong> is shown as the large featured card. Use the arrows to reorder
        {canReorder ? '' : ' (clear search and status filters first)'}.
      </Alert>

      <Box sx={{ mb: 2 }}>
        <StatisticsCards cards={statsCards} />
      </Box>

      <StandardFilters
        filters={{
          searchTerm: searchValue,
          statusFilter,
        }}
        onFilterChange={handleFilterChange}
        fields={filterFields}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={triggerSearch}
        showSearchButton
        onClearFilters={handleClearFilters}
        showClearButton
      />

      <StandardTable
        columns={columns}
        data={paginatedCategories}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={categories.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        loading={isLoading}
        emptyMessage="No explore categories found"
        getRowKey={(category) => category.id}
        showRowNumbers
      />
    </Box>
  );
};

export default HomeExploreCategoryListPage;
