import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWards, useDeleteWard, useRegions, useTownships } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination } from '../../components/ui';
import { PageLoadingState, PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert } from '../../components/ui';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { FilterState } from '../../constants/filters';

import { Ward } from '../../types/location';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface WardFilters extends FilterState {
  searchTerm: string;
  townshipFilter: string;
  regionFilter: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WardListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ========================================================================
  // STATE & HOOKS
  // ========================================================================

  const { filters, setFilter, resetFilters } = useFilters<WardFilters>({
    searchTerm: '',
    townshipFilter: 'all',
    regionFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Alert system hook
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

  // API Queries
  const { data: wardsData, isLoading, error } = useWards();
  const { data: regionsData } = useRegions();
  const { data: townshipsData } = useTownships();

  // Delete mutation
  const deleteWardMutation = useDeleteWard();

  // Delete confirmation
  const { deleteState, openDeleteConfirmation, closeDeleteConfirmation, handleConfirmDelete } = useDeleteConfirmation();

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const wards = wardsData?.data || [];

  // Filter data based on search, township, and region filters
  const filteredData = useMemo(() => {
    return wards.filter((ward: Ward) => {
      const matchesSearch = filters.searchTerm === '' || 
        ward.ward_name_en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ward.ward_name_mm.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesTownship = filters.townshipFilter === 'all' || 
        ward.township?.id.toString() === filters.townshipFilter;
      
      const matchesRegion = filters.regionFilter === 'all' || 
        ward.township?.region?.id.toString() === filters.regionFilter;
      
      return matchesSearch && matchesTownship && matchesRegion;
    });
  }, [wards, filters]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = [
    {
      title: 'Total Wards',
      value: wards.length,
      color: 'primary',
      icon: <LocationIcon />,
    },
    {
      title: 'Filtered Wards',
      value: filteredData.length,
      color: 'secondary',
      icon: <BusinessIcon />,
    },
  ];

  // Filter fields with cascading dropdowns
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search wards...',
    },
    {
      key: 'regionFilter',
      type: 'select',
      label: 'Region',
      options: [
        { value: 'all', label: 'All Regions' },
        ...(regionsData?.data || []).map(region => ({
          value: region.id.toString(),
          label: `${region.name_en} (${region.name_mm})`,
        })),
      ],
    },
    {
      key: 'townshipFilter',
      type: 'select',
      label: 'Township',
      options: [
        { value: 'all', label: 'All Townships' },
        ...(townshipsData?.data?.filter(township => 
          filters.regionFilter === 'all' || township.region_id.toString() === filters.regionFilter
        ) || []).map(township => ({
          value: township.id.toString(),
          label: `${township.name_en} (${township.name_mm})`,
        })),
      ],
    },
  ];

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  // Clear all filters function
  const handleClearFilters = () => {
    resetFilters();
    handleChangePage({} as any, 0);
  };

  const handleAdd = () => {
    navigate('/wards/create');
  };


  const handleEdit = (ward: Ward) => {
    navigate(`/wards/${ward.slug}/edit`);
  };

  const handleDelete = useMemo(() => {
    return (ward: Ward) => {
      const wardName = ward.ward_name_en || ward.ward_name_mm;
      
      openDeleteConfirmation(wardName, 'ward', async () => {
        try {
          await deleteWardMutation.mutateAsync(ward.slug);
          showSuccess(`${wardName} deleted successfully!`, true);
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to delete ward. Please try again.';
          showError(errorMessage, true);
        }
      });
    };
  }, [deleteWardMutation, openDeleteConfirmation, showSuccess, showError]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const createTableColumns = (): TableColumn<Ward>[] => [
    {
      id: 'ward_name',
      label: 'Ward Name',
      render: (_value, ward) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {ward.ward_name_en}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {ward.ward_name_mm}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'township',
      label: 'Township',
      render: (_value, ward) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {ward.township?.name_en || 'Unknown Township'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {ward.township?.name_mm || ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'region',
      label: 'Region',
      render: (_value, ward) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {ward.township?.region?.name_en || 'Unknown Region'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {ward.township?.region?.name_mm || ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_value, ward) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleEdit(ward)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDelete(ward)}
              color="error"
              disabled={deleteWardMutation.isPending}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (ward: Ward): MobileCardAction[] => [
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary' as const,
      onClick: () => handleEdit(ward),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error' as const,
      onClick: () => handleDelete(ward),
    },
  ];

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return <PageLoadingState title="Loading Wards" />;
  }

  if (error) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Wards"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Box>
      <PageHeader 
        title="Wards"
        breadcrumbs="Dashboard / Master Data / Wards"
        subtitle="Manage wards"
        actionButton={{
          text: 'Add Ward',
          icon: <AddIcon />,
          onClick: handleAdd
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <StatisticsCards cards={statsCards} />

      <StandardFilters
        filters={filters}
        onFilterChange={setFilter}
        fields={filterFields}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {filteredData.length === 0 ? (
        <PageEmptyState
          title="No Wards Found"
          message={filters.searchTerm || filters.townshipFilter !== 'all' || filters.regionFilter !== 'all'
            ? "Try adjusting your search or filter criteria."
            : "No wards have been created yet."
          }
        />
      ) : isMobile ? (
        <Box>
          {paginatedData.map((ward) => (
            <MobileCard
              key={ward.id}
              title={ward.ward_name_en}
              subtitle={ward.ward_name_mm}
              description={`${ward.township?.name_en || 'Unknown Township'} (${ward.township?.name_mm || ''}), ${ward.township?.region?.name_en || 'Unknown Region'} (${ward.township?.region?.name_mm || ''})`}
              avatar={<LocationIcon />}
              avatarColor="primary.main"
              actions={createMobileCardActions(ward)}
              onClick={() => handleEdit(ward)}
              clickable
            />
          ))}
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
          getRowKey={(ward) => ward.id}
          emptyMessage="No wards found"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteState.itemType}`}
        message={`Are you sure you want to delete this ${deleteState.itemType}? This action cannot be undone.`}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isLoading={deleteWardMutation.isPending}
        error={deleteWardMutation.error?.message}
      />
    </Box>
  );
};

export default WardListPage;
