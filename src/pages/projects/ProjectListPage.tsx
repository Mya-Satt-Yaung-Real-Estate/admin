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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Visibility as ViewIcon,
  Apartment as ProjectIcon,
  Visibility as ViewCountIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ActionAlert,
} from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import {
  useProjects,
  useProjectStatistics,
  useDeleteProject,
  useRestoreProject,
} from '../../services/queries/projects';
import { usePropertyTypes } from '../../services/queries/properties';
import { FilterState } from '../../constants/filters';
import { Project } from '../../types/project';
import { formatDate } from '../../constants/dateFormats';
import { PROJECT_CONDITIONS } from '../../validations/schemas/projectSchemas';

interface ProjectFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  conditionFilter: string;
  propertyTypeFilter: string;
}

const PAGE_CONFIG = {
  title: 'Project Management',
  description: 'Manage development projects',
  createButtonText: 'Add Project',
  createButtonPath: '/projects/create',
} as const;

const createFilterFields = (propertyTypes: Array<{ id: number; name_en: string; name_mm: string }>): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by title, address, or developer...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Publish Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'unpublished', label: 'Unpublished' },
    ],
  },
  {
    key: 'conditionFilter',
    type: 'select',
    label: 'Condition',
    options: [
      { value: 'all', label: 'All Conditions' },
      ...PROJECT_CONDITIONS.map((item) => ({ value: item.value, label: item.label })),
    ],
  },
  {
    key: 'propertyTypeFilter',
    type: 'select',
    label: 'Property Type',
    options: [
      { value: 'all', label: 'All Types' },
      ...propertyTypes.map((type) => ({
        value: String(type.id),
        label: `${type.name_en} (${type.name_mm})`,
      })),
    ],
  },
];

const getDeveloperName = (project: Project): string => {
  if (project.project_mode === 'platform' || project.developer_user_type === 'admin') {
    return 'Platform';
  }
  if (typeof project.developer === 'string') return project.developer;
  if (project.developer && typeof project.developer === 'object') return project.developer.name;
  if (project.user?.name) return project.user.name;
  return 'Unknown';
};

const getConditionLabel = (condition: Project['condition']): string =>
  PROJECT_CONDITIONS.find((item) => item.value === condition)?.label
  ?? condition.replace(/_/g, ' ');

const getConditionChipColor = (
  condition: Project['condition']
): 'info' | 'success' | 'warning' | 'default' => {
  switch (condition) {
    case 'upcoming':
      return 'info';
    case 'ongoing':
      return 'success';
    case 'under_construction':
      return 'warning';
    default:
      return 'default';
  }
};

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { filters, setFilter } = useFilters<ProjectFilters>({
    searchTerm: '',
    statusFilter: 'all',
    conditionFilter: 'all',
    propertyTypeFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const [activeTab, setActiveTab] = useState(0);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [projectToRestore, setProjectToRestore] = useState<Project | null>(null);

  const { data: projectsResponse, isLoading, error, refetch } = useProjects({
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });
  const { data: statisticsResponse } = useProjectStatistics();
  const { data: propertyTypesResponse } = usePropertyTypes();

  const deleteProjectMutation = useDeleteProject();
  const restoreProjectMutation = useRestoreProject();
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  const {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  } = useDeleteConfirmation();

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');
    if (successMessage) {
      showSuccess(decodeURIComponent(successMessage));
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('success');
      navigate(`${location.pathname}${newSearch.toString() ? `?${newSearch.toString()}` : ''}`, { replace: true });
    }
  }, [location.search, navigate, showSuccess]);

  const projects = projectsResponse?.data || [];
  const propertyTypes = propertyTypesResponse?.data || [];
  const filterFields = createFilterFields(propertyTypes);

  const filteredProjects = useMemo(() => {
    if (!projects.length) return [];

    return projects.filter((project) => {
      const isDeleted = project.is_deleted;
      if (activeTab === 0 && isDeleted) return false;
      if (activeTab === 1 && !isDeleted) return false;

      const searchTerm = (filters.searchTerm || '').toLowerCase();
      const matchesSearch =
        (project.title_en || '').toLowerCase().includes(searchTerm) ||
        (project.title_mm || '').toLowerCase().includes(searchTerm) ||
        (project.location?.address || '').toLowerCase().includes(searchTerm) ||
        getDeveloperName(project).toLowerCase().includes(searchTerm);

      const matchesStatus =
        filters.statusFilter === 'all' || project.publish_status === filters.statusFilter;

      const matchesCondition =
        filters.conditionFilter === 'all' || project.condition === filters.conditionFilter;

      const matchesPropertyType =
        filters.propertyTypeFilter === 'all' ||
        String(project.property_type?.id) === filters.propertyTypeFilter;

      return matchesSearch && matchesStatus && matchesCondition && matchesPropertyType;
    });
  }, [projects, filters, activeTab]);

  const paginatedProjects = useMemo(
    () => filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredProjects, page, rowsPerPage]
  );

  const stats = statisticsResponse?.data;
  const statsCards: StatCard[] = useMemo(
    () => [
      { title: 'Total Projects', value: stats?.total ?? projects.length, color: 'primary', icon: <ProjectIcon /> },
      { title: 'Published', value: stats?.published ?? 0, color: 'success', icon: <ProjectIcon /> },
      { title: 'Draft', value: stats?.draft ?? 0, color: 'warning', icon: <ProjectIcon /> },
      { title: 'On Homepage', value: stats?.show_on_homepage ?? 0, color: 'info', icon: <HomeIcon /> },
    ],
    [stats, projects.length]
  );

  const handleView = (project: Project) => navigate(`/projects/${project.id}`);
  const handleEdit = (project: Project) => navigate(`/projects/${project.id}/edit`);
  const handleCreate = () => navigate(PAGE_CONFIG.createButtonPath);

  const handleDelete = (project: Project) => {
    openDeleteConfirmation(project.title_en, 'project', async () => {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        showSuccess(`${project.title_en} deleted successfully!`, true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete project.';
        showError(message, true);
      }
    });
  };

  const handleRestore = (project: Project) => {
    setProjectToRestore(project);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!projectToRestore) return;
    try {
      await restoreProjectMutation.mutateAsync(projectToRestore.id);
      showSuccess(`${projectToRestore.title_en} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      setProjectToRestore(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restore project.';
      showError(message, true);
    }
  };

  const columns: TableColumn<Project>[] = useMemo(
    () => [
      {
        id: 'title',
        label: 'Title',
        render: (_value, project) => (
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {project.title_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {project.title_mm}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'developer',
        label: 'Developer',
        render: (_value, project) => (
          <Typography variant="body2">{getDeveloperName(project)}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'location',
        label: 'Location',
        render: (_value, project) => (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {project.location?.region?.name_en || '—'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {project.location?.township?.name_en || ''}
            </Typography>
          </Box>
        ),
        hidden: isMobile,
      },
      {
        id: 'condition',
        label: 'Condition',
        render: (_value, project) => (
          <Chip
            label={getConditionLabel(project.condition)}
            size="small"
            color={getConditionChipColor(project.condition)}
            variant="outlined"
          />
        ),
        hidden: isMobile,
      },
      {
        id: 'price',
        label: 'Price Range',
        render: (_value, project) => (
          <Typography variant="body2">{project.price?.range || '—'}</Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'status',
        label: 'Status',
        render: (_value, project) => <StatusChip status={project.publish_status} />,
      },
      {
        id: 'flags',
        label: 'Homepage',
        render: (_value, project) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {project.show_on_homepage ? (
              <Chip icon={<HomeIcon sx={{ fontSize: 14 }} />} label="Home" size="small" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            )}
          </Box>
        ),
        hidden: isMobile,
      },
      {
        id: 'views',
        label: 'Views',
        render: (_value, project) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewCountIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">{project.view_count || 0}</Typography>
          </Box>
        ),
        hidden: isMobile,
      },
      {
        id: 'createdAt',
        label: 'Created',
        render: (_value, project) => (
          <Typography variant="body2" color="textSecondary">
            {project.dates?.created_at ? formatDate(project.dates.created_at, 'display') : '—'}
          </Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_value, project) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View">
              <IconButton size="small" color="primary" onClick={() => handleView(project)}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
            {!project.is_deleted ? (
              <>
                <Tooltip title="Edit">
                  <IconButton size="small" color="secondary" onClick={() => handleEdit(project)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(project)}
                    disabled={deleteProjectMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton size="small" color="success" onClick={() => handleRestore(project)}>
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [isMobile, deleteProjectMutation.isPending]
  );

  const getMobileCardActions = (project: Project): MobileCardAction[] => {
    const actions: MobileCardAction[] = [
      { tooltip: 'View', icon: <ViewIcon />, onClick: () => handleView(project), color: 'primary' },
    ];
    if (!project.is_deleted) {
      actions.push(
        { tooltip: 'Edit', icon: <EditIcon />, onClick: () => handleEdit(project), color: 'secondary' },
        { tooltip: 'Delete', icon: <DeleteIcon />, onClick: () => handleDelete(project), color: 'error' }
      );
    } else {
      actions.push({
        tooltip: 'Restore',
        icon: <RestoreIcon />,
        onClick: () => handleRestore(project),
        color: 'success',
      });
    }
    return actions;
  };

  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} onRetry={() => refetch()} />;

  return (
    <Box>
      <PageHeader
        title={PAGE_CONFIG.title}
        subtitle={PAGE_CONFIG.description}
        breadcrumbs="Dashboard / Projects"
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleCreate,
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <StatisticsCards cards={statsCards} />

      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
        <Tab label={`Active (${projects.filter((p) => !p.is_deleted).length})`} />
        <Tab label={`Deleted (${projects.filter((p) => p.is_deleted).length})`} />
      </Tabs>

      <StandardFilters filters={filters} fields={filterFields} onFilterChange={setFilter} />

      {filteredProjects.length === 0 ? (
        <PageEmptyState
          title="No projects found"
          message="Try adjusting your filters or create a new project."
          actionButton={{
            text: PAGE_CONFIG.createButtonText,
            onClick: handleCreate,
          }}
        />
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paginatedProjects.map((project) => (
            <MobileCard
              key={project.id}
              title={project.title_en}
              subtitle={getDeveloperName(project)}
              description={`${project.location?.region?.name_en || ''} · ${project.publish_status}`}
              actions={getMobileCardActions(project)}
              onClick={() => handleView(project)}
              clickable
              chips={[
                { label: project.publish_status, color: 'primary' },
                { label: getConditionLabel(project.condition), color: getConditionChipColor(project.condition) },
                ...(project.show_on_homepage ? [{ label: 'Homepage', color: 'info' as const }] : []),
              ]}
            />
          ))}
        </Box>
      ) : (
        <StandardTable
          columns={columns}
          data={paginatedProjects}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredProjects.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteState.itemName}"?`}
        isLoading={deleteProjectMutation.isPending}
      />

      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setProjectToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        itemName={projectToRestore?.title_en}
        itemType="project"
        action="restore"
        isLoading={restoreProjectMutation.isPending}
        error={restoreProjectMutation.error?.message}
      />
    </Box>
  );
};

export default ProjectListPage;
