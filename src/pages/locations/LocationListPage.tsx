import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRegions, useTownships, useDeleteRegion, useDeleteTownship } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination } from '../../components/ui';
import { PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, StatusChip } from '../../components/ui';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useDeleteConfirmation } from '../../hooks/useDeleteConfirmation';
import { FilterState } from '../../constants/filters';

import { Region, Township } from '../../types/location';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LocationFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`location-tabpanel-${index}`}
      aria-labelledby={`location-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LocationListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // STATE & HOOKS
  // ========================================================================

  const [activeTab, setActiveTab] = React.useState(0);
  const { filters, setFilter, resetFilters } = useFilters<LocationFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // API Queries
  const { data: regionsData, isLoading: regionsLoading, error: regionsError } = useRegions();
  const { data: townshipsData, isLoading: townshipsLoading, error: townshipsError } = useTownships();

  // Delete mutations
  const deleteRegionMutation = useDeleteRegion();
  const deleteTownshipMutation = useDeleteTownship();

  // Delete confirmation
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation } = useDeleteConfirmation();

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const isLoading = regionsLoading || townshipsLoading;
  const error = regionsError || townshipsError;

  const regions = regionsData?.data || [];
  const townships = townshipsData?.data || [];

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    const data = activeTab === 0 ? regions : townships;
    
    return data.filter((item: Region | Township) => {
      const matchesSearch = filters.searchTerm === '' || 
        item.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || 
        (filters.statusFilter === 'active' && item.is_active) ||
        (filters.statusFilter === 'inactive' && !item.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [regions, townships, filters, activeTab]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = [
    {
      title: 'Total Regions',
      value: regions.length,
      color: 'primary',
      icon: <LocationIcon />,
    },
    {
      title: 'Total Townships',
      value: townships.length,
      color: 'secondary',
      icon: <BusinessIcon />,
    },
    {
      title: 'Active Regions',
      value: regions.filter(r => r.is_active).length,
      color: 'success',
      icon: <LocationIcon />,
    },
    {
      title: 'Active Townships',
      value: townships.filter(t => t.is_active).length,
      color: 'info',
      icon: <BusinessIcon />,
    },
  ];

  // Filter fields
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: `Search ${activeTab === 0 ? 'regions' : 'townships'}...`,
    },
    {
      key: 'statusFilter',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    resetFilters();
  };

  const handleAdd = () => {
    if (activeTab === 0) {
      navigate('/locations/regions/create');
    } else {
      navigate('/locations/townships/create');
    }
  };

  const handleView = (item: Region | Township) => {
    if (activeTab === 0) {
      navigate(`/locations/regions/${item.slug}`);
    } else {
      navigate(`/locations/townships/${item.slug}`);
    }
  };

  const handleEdit = (item: Region | Township) => {
    if (activeTab === 0) {
      navigate(`/locations/regions/${item.slug}/edit`);
    } else {
      navigate(`/locations/townships/${item.slug}/edit`);
    }
  };

  const handleDelete = useMemo(() => {
    return (item: Region | Township) => {
      const itemType = activeTab === 0 ? 'region' : 'township';
      const itemName = item.name_en || item.name_mm;
      
      openDeleteConfirmation(itemName, itemType, async () => {
        try {
          if (activeTab === 0) {
            await deleteRegionMutation.mutateAsync(item.slug);
          } else {
            await deleteTownshipMutation.mutateAsync(item.slug);
          }
        } catch (error) {
          console.error(`Failed to delete ${itemType}:`, error);
        }
      });
    };
  }, [activeTab, deleteRegionMutation, deleteTownshipMutation, openDeleteConfirmation]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const createTableColumns = (): TableColumn<Region | Township>[] => {
    const baseColumns: TableColumn<Region | Township>[] = [
      {
        id: 'name',
        label: 'Name',
        render: (_value, item) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {item.name_en}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {item.name_mm}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        render: (_value, item) => (
          <Typography variant="body2" color="textSecondary">
            {item.description || 'No description'}
          </Typography>
        ),
      },
      {
        id: 'is_active',
        label: 'Status',
        render: (_value, item) => (
          <StatusChip status={item.is_active} />
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        render: (_value, item) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={() => handleView(item)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton 
                size="small" 
                onClick={() => handleEdit(item)}
                color="secondary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                onClick={() => handleDelete(item)}
                color="error"
                disabled={deleteRegionMutation.isPending || deleteTownshipMutation.isPending}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];

    // Add region-specific column for townships
    if (activeTab === 1) {
      baseColumns.splice(1, 0, {
        id: 'region',
        label: 'Region',
        render: (_value, item) => {
          const township = item as Township;
          return (
            <Typography variant="body2" color="textSecondary">
              {township.region?.name_en || 'Unknown Region'}
            </Typography>
          );
        },
      });
    }

    return baseColumns;
  };

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (item: Region | Township): MobileCardAction[] => [
    {
      icon: <ViewIcon />,
      tooltip: 'View',
      color: 'primary' as const,
      onClick: () => handleView(item),
    },
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary' as const,
      onClick: () => handleEdit(item),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error' as const,
      onClick: () => handleDelete(item),
    },
  ];

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return <PageLoadingState title="Loading Locations" />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Locations"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box>
      <PageHeader 
        title="Locations"
        // breadcrumbs="Location Management"
        subtitle="Manage locations"
      />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add {activeTab === 0 ? 'Region' : 'Township'}
        </Button>
      </Box>

      <StatisticsCards cards={statsCards} />

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab 
            label={`Regions (${regions.length})`} 
            icon={<LocationIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Townships (${townships.length})`} 
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        {/* Regions Tab */}
        <StandardFilters
          filters={filters}
          onFilterChange={setFilter}
          fields={filterFields}
        />

        {filteredData.length === 0 ? (
          <PageEmptyState
            title="No Regions Found"
            message={filters.searchTerm || filters.statusFilter !== 'all' 
              ? "Try adjusting your search or filter criteria."
              : "No regions have been created yet."
            }
          />
        ) : isMobile ? (
          <Box>
            {paginatedData.map((item) => {
              const region = item as Region;
              return (
                <MobileCard
                  key={region.id}
                  title={region.name_en}
                  subtitle={region.name_mm}
                  description={region.description}
                  avatar={<LocationIcon />}
                  avatarColor="primary.main"
                                  status={{
                  label: region.is_active ? 'Active' : 'Inactive',
                  color: 'default',
                }}
                  actions={createMobileCardActions(region)}
                  onClick={() => handleView(region)}
                  clickable
                />
              );
            })}
            <Pagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={filteredData.length}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              showResultsInfo={true}
            />
          </Box>
        ) : (
          <StandardTable
            columns={createTableColumns()}
            data={paginatedData}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredData.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(item) => item.id}
            emptyMessage="No regions found"
          />
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Townships Tab */}
        <StandardFilters
          filters={filters}
          onFilterChange={setFilter}
          fields={filterFields}
        />

        {filteredData.length === 0 ? (
          <PageEmptyState
            title="No Townships Found"
            message={filters.searchTerm || filters.statusFilter !== 'all' 
              ? "Try adjusting your search or filter criteria."
              : "No townships have been created yet."
            }
          />
        ) : isMobile ? (
          <Box>
            {paginatedData.map((item) => {
              const township = item as Township;
              return (
                <MobileCard
                  key={township.id}
                  title={township.name_en}
                  subtitle={township.name_mm}
                  description={township.description}
                  avatar={<BusinessIcon />}
                  avatarColor="secondary.main"
                                  status={{
                  label: township.is_active ? 'Active' : 'Inactive',
                  color: 'default',
                }}
                  chips={[
                    {
                      label: township.region?.name_en || 'Unknown Region',
                      color: 'primary',
                      variant: 'outlined',
                    },
                  ]}
                  actions={createMobileCardActions(township)}
                  onClick={() => handleView(township)}
                  clickable
                />
              );
            })}
            <Pagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={filteredData.length}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              showResultsInfo={true}
            />
          </Box>
        ) : (
          <StandardTable
            columns={createTableColumns()}
            data={paginatedData}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredData.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(item) => item.id}
            emptyMessage="No townships found"
          />
        )}
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={deleteState.onConfirm || (() => {})}
        title={`Delete ${deleteState.itemType}`}
        message={`Are you sure you want to delete this ${deleteState.itemType}? This action cannot be undone.`}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteRegionMutation.isPending || deleteTownshipMutation.isPending}
        error={deleteRegionMutation.error?.message || deleteTownshipMutation.error?.message}
      />
    </Box>
  );
};

export default LocationListPage; 