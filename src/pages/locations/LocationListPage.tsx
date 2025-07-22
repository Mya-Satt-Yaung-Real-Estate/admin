import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { MobilePagination } from '../../components/common/MobilePagination';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { getStatusColor, getStatusLabel } from '../../constants/status';
import { formatDate } from '../../constants/dateFormats';
import { FilterState } from '../../constants/filters';
import { Region, Township } from '../../types/location';
import { mockRegions, getAllTownships } from '../../data/mockLocations';

interface LocationFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

const LocationListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use standardized hooks
  const { filters, setFilter } = useFilters<LocationFilters>({
    statusFilter: 'all',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // State for navigation
  const [selectedRegion, setSelectedRegion] = React.useState<Region | null>(null);

  // Get all townships from all regions
  const allTownships = getAllTownships();

  // Filter data based on current view
  const filteredData = useMemo(() => {
    const data = selectedRegion ? selectedRegion.townships : mockRegions;
    return data.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (selectedRegion ? '' : (item as Region).description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || '');
      const matchesStatus = filters.statusFilter === 'all' || item.status === filters.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [filters, selectedRegion]);

  // Paginate data
  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => {
    if (selectedRegion) {
      return [
        {
          title: 'Total Townships',
          value: selectedRegion.townships.length,
          color: 'primary',
          icon: <HomeIcon />,
        },
        {
          title: 'Active Townships',
          value: selectedRegion.townships.filter(t => t.status === 'active').length,
          color: 'success',
          icon: <HomeIcon />,
        },
        {
          title: 'Inactive Townships',
          value: selectedRegion.townships.filter(t => t.status === 'inactive').length,
          color: 'error',
          icon: <HomeIcon />,
        },
        {
          title: 'Region Status',
          value: selectedRegion.status,
          color: selectedRegion.status === 'active' ? 'success' : 'error',
          icon: <LocationIcon />,
        },
      ];
    } else {
      return [
        {
          title: 'Total Regions',
          value: mockRegions.length,
          color: 'primary',
          icon: <LocationIcon />,
        },
        {
          title: 'Active Regions',
          value: mockRegions.filter(r => r.status === 'active').length,
          color: 'success',
          icon: <LocationIcon />,
        },
        {
          title: 'Total Townships',
          value: allTownships.length,
          color: 'info',
          icon: <HomeIcon />,
        },
        {
          title: 'Active Townships',
          value: allTownships.filter(t => t.status === 'active').length,
          color: 'secondary',
          icon: <HomeIcon />,
        },
      ];
    }
  }, [selectedRegion, allTownships]);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: selectedRegion 
        ? 'Search townships...' 
        : 'Search regions...',
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

  // Table columns configuration
  const columns: TableColumn<Region | Township>[] = [
    {
      id: 'name',
      label: selectedRegion ? 'Township' : 'Region',
      render: (_, item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: selectedRegion ? 'secondary.main' : 'primary.main',
              color: 'white',
            }}
          >
            {selectedRegion ? <HomeIcon fontSize="small" /> : <LocationIcon fontSize="small" />}
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {item.name}
            </Typography>
            {!selectedRegion && (item as Region).description && (
              <Typography variant="body2" color="textSecondary">
                {(item as Region).description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, item) => (
        <Chip
          label={getStatusLabel(item.status)}
          color={getStatusColor(item.status)}
          size="small"
        />
      ),
    },
    {
      id: 'details',
      label: selectedRegion ? 'Description' : 'Townships',
      render: (_, item) => {
        if (selectedRegion) {
          return (
            <Typography variant="body2" color="textSecondary">
              {(item as Township).description || 'No description'}
            </Typography>
          );
        } else {
          return (
            <Typography variant="body2" color="textSecondary">
              {(item as Region).townships?.length || 0} townships
            </Typography>
          );
        }
      },
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_, item) => (
        <Typography variant="body2" color="textSecondary">
          {formatDate(item.createdAt, 'display')}
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, item) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          {!selectedRegion && (
            <Tooltip title="View Townships">
              <IconButton
                size="small"
                onClick={() => handleRegionClick(item as Region)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditItem(item)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteItem(item)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Event handlers
  const handleRegionClick = (region: Region) => {
    setSelectedRegion(region);
    setFilter('searchTerm', '');
    setFilter('statusFilter', 'all');
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
    setFilter('searchTerm', '');
    setFilter('statusFilter', 'all');
  };

  const handleEditItem = (item: Region | Township) => {
    if (selectedRegion) {
      navigate(`/locations/townships/${item.id}/edit`);
    } else {
      navigate(`/locations/regions/${item.id}/edit`);
    }
  };

  const handleDeleteItem = (item: Region | Township) => {
    console.log('Delete item:', item);
  };

  const handleAddItem = () => {
    if (selectedRegion) {
      navigate('/locations/townships/create');
    } else {
      navigate('/locations/regions/create');
    }
  };

  // Helper function to create mobile card actions
  const createMobileCardActions = (item: Region | Township): MobileCardAction[] => {
    const actions: MobileCardAction[] = [
      {
        icon: <EditIcon />,
        tooltip: 'Edit',
        color: 'secondary',
        onClick: () => handleEditItem(item),
      },
      {
        icon: <DeleteIcon />,
        tooltip: 'Delete',
        color: 'error',
        onClick: () => handleDeleteItem(item),
      },
    ];

    if (!selectedRegion) {
      actions.unshift({
        icon: <ViewIcon />,
        tooltip: 'View Townships',
        color: 'primary',
        onClick: () => handleRegionClick(item as Region),
      });
    }

    return actions;
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={selectedRegion ? `Townships in ${selectedRegion.name}` : 'Location Management'}
        breadcrumbs={
          selectedRegion 
            ? `Dashboard / Location Management / ${selectedRegion.name}`
            : 'Dashboard / Location Management'
        }
        subtitle={
          selectedRegion 
            ? `Manage townships in ${selectedRegion.name} region`
            : 'Manage regions and townships'
        }
        actionButton={{
          text: selectedRegion ? 'Add Township' : 'Add Region',
          icon: <AddIcon />,
          onClick: handleAddItem
        }}
      />

      {/* Breadcrumb Navigation */}
      {selectedRegion && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToRegions}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ArrowBackIcon fontSize="small" />
              Back to Regions
            </Link>
          </Breadcrumbs>
        </Box>
      )}

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof LocationFilters, value)}
        fields={filterFields}
      />

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {paginatedData.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No data available
              </Typography>
            </Paper>
          ) : (
            <Box>
              {paginatedData.map((item) => (
                <MobileCard
                  key={item.id}
                  title={item.name}
                  subtitle={!selectedRegion ? (item as Region).description : undefined}
                  description={selectedRegion ? (item as Township).description : undefined}
                  avatar={selectedRegion ? <HomeIcon /> : <LocationIcon />}
                  avatarColor={selectedRegion ? 'secondary.main' : 'primary.main'}
                  status={{
                    label: getStatusLabel(item.status),
                    color: getStatusColor(item.status) === 'success' ? 'success' : 
                           getStatusColor(item.status) === 'error' ? 'error' : 
                           getStatusColor(item.status) === 'warning' ? 'warning' : 'default',
                  }}
                  chips={
                    !selectedRegion 
                      ? [{ label: `${(item as Region).townships?.length || 0} townships` }]
                      : []
                  }
                  actions={createMobileCardActions(item)}
                  onClick={!selectedRegion ? () => handleRegionClick(item as Region) : undefined}
                  clickable={!selectedRegion}
                />
              ))}
            </Box>
          )}
          <MobilePagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredData.length}
            onPageChange={handleChangePage}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        <StandardTable
          columns={columns}
          data={paginatedData}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredData.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(item) => item.id}
        />
      )}
    </Box>
  );
};

export default LocationListPage; 