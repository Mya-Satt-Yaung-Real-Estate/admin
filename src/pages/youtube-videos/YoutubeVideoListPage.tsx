import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  YouTube as YouTubeIcon,
  OpenInNew as OpenInNewIcon,
  Visibility as ViewCountIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { ActionAlert, PageErrorState } from '../../components/ui';
import { useAlertSystem, useManualSearch, usePagination } from '../../hooks';
import { useDeleteYoutubeVideo, useYoutubeVideos } from '../../services/queries/youtubeVideos';
import { YoutubeVideo } from '../../types/youtubeVideo';

const filterFields: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name, description, or link...',
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

const YoutubeVideoListPage: React.FC = () => {
  const navigate = useNavigate();
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

  const { data: videosResponse, isLoading, error } = useYoutubeVideos({
    page: page + 1,
    per_page: rowsPerPage,
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter === 'active',
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const deleteVideoMutation = useDeleteYoutubeVideo();
  const videos = videosResponse?.data || [];
  const pagination = videosResponse?.pagination;

  const handleDelete = useCallback((video: YoutubeVideo) => {
    if (!window.confirm(`Are you sure you want to delete "${video.name}"?`)) {
      return;
    }

    deleteVideoMutation.mutate(video.id, {
      onSuccess: () => showSuccess('Jade Home Tour video deleted successfully.'),
      onError: (error: any) => showError(error?.message || 'Failed to delete Jade Home Tour video.', true),
    });
  }, [deleteVideoMutation, showError, showSuccess]);

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

  const columns: TableColumn<YoutubeVideo>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Video',
      render: (_, video) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {video.name}
          </Typography>
          {video.description ? (
            <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 360 }}>
              {video.description}
            </Typography>
          ) : null}
        </Box>
      ),
    },
    {
      id: 'youtube_link',
      label: 'YouTube Link',
      render: (_, video) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <YouTubeIcon color="error" fontSize="small" />
          <Typography variant="body2" color="primary" noWrap sx={{ maxWidth: 360 }}>
            {video.youtube_link}
          </Typography>
          <Tooltip title="Open YouTube link">
            <IconButton
              size="small"
              component="a"
              href={video.youtube_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, video) => (
        <Chip
          label={video.status ? 'Active' : 'Inactive'}
          color={video.status ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'view_count',
      label: 'Views',
      render: (_, video) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <ViewCountIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{video.view_count ?? 0}</Typography>
        </Stack>
      ),
    },
    {
      id: 'created_at',
      label: 'Created',
      render: (_, video) => <Typography variant="body2">{video.created_at}</Typography>,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, video) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/youtube-videos/${video.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDelete(video)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [handleDelete, navigate]);

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Failed to load Jade Home Tour videos"
        message="Please try refreshing the page."
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Jade Home Tour Management"
        subtitle="Manage Jade Home Tour video list content"
        breadcrumbs="Dashboard / Jade Home Tour"
        actionButton={{
          text: 'Add Jade Home Tour Video',
          icon: <AddIcon />,
          onClick: () => navigate('/youtube-videos/create'),
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <StandardFilters
        filters={{
          searchTerm: searchValue,
          statusFilter,
        }}
        onFilterChange={handleFilterChange}
        fields={filterFields}
        searchHelperText={undefined}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={triggerSearch}
        showSearchButton
        onClearFilters={handleClearFilters}
        showClearButton
      />

      <StandardTable
        columns={columns}
        data={videos}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={pagination?.total || videos.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        loading={isLoading}
        emptyMessage="No Jade Home Tour videos found"
        getRowKey={(video) => video.id}
        showRowNumbers
      />
    </Box>
  );
};

export default YoutubeVideoListPage;
