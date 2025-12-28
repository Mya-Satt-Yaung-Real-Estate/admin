import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useYarpyatTaxes, useDeleteYarpyatTax, useWards, useTownships, useRegions } from '../../services/queries/locations';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { ActionAlert, Pagination, PageEmptyState } from '../../components/ui';
import { YarpyatTax } from '../../types/location';
import { useAlertSystem } from '../../hooks';

const YarpyatListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Alert system hook
  const { alert, showError, clearAlert } = useAlertSystem();

  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState<string>('');
  const [townshipFilter, setTownshipFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  // API hooks - API uses 1-based pagination, component uses 0-based
  // Server-side filtering: only search and ward_id are sent to API
  const { data: yarpyatData, isLoading, error } = useYarpyatTaxes({
    page: page + 1, // Convert 0-based to 1-based for API
    per_page: rowsPerPage,
    search: search || '',
    ward_id: wardFilter || '',
  });

  const { data: wardsData } = useWards();
  const { data: townshipsData } = useTownships();
  const { data: regionsData } = useRegions();

  const deleteYarpyatMutation = useDeleteYarpyatTax();

  // Event handlers
  const handleAdd = () => {
    navigate('/yarpyat/create');
  };

  const handleEdit = (yarpyat: YarpyatTax) => {
    navigate(`/yarpyat/${yarpyat.slug}/edit`);
  };

  const handleDelete = useMemo(() => {
    return (yarpyat: YarpyatTax) => {
      if (window.confirm(`Are you sure you want to delete "${yarpyat.name_en}"?`)) {
        deleteYarpyatMutation.mutate(yarpyat.slug, {
          onSuccess: () => {
            // Success is handled by the mutation's onSuccess
          },
          onError: (error: any) => {
            showError(error?.message || 'Failed to delete yarpyat tax', true);
          },
        });
      }
    };
  }, [deleteYarpyatMutation, showError]);

  // Clear all filters function
  const handleClearFilters = () => {
    setSearch('');
    setWardFilter('');
    setTownshipFilter('');
    setRegionFilter('');
    setPage(0);
  };


  // Extract pagination from API response
  const pagination = yarpyatData?.pagination;

  // Client-side filtering for region and township (search and ward are filtered server-side)
  const filteredYarpyatData = useMemo(() => {
    if (!yarpyatData?.data) return [];
    
    return yarpyatData.data.filter(yarpyat => {
      const matchesTownship = !townshipFilter || yarpyat.ward?.township?.id.toString() === townshipFilter;
      const matchesRegion = !regionFilter || yarpyat.ward?.township?.region?.id.toString() === regionFilter;
      
      return matchesTownship && matchesRegion;
    });
  }, [yarpyatData?.data, townshipFilter, regionFilter]);

  // Filter fields with cascading dropdowns
  const filterFields: FilterField[] = [
    {
      key: 'regionFilter',
      label: 'Region',
      type: 'select',
      options: [
        { value: '', label: 'All Regions' },
        ...(regionsData?.data || []).map(region => ({
          value: region.id.toString(),
          label: `${region.name_en} (${region.name_mm})`,
        })),
      ],
    },
    {
      key: 'townshipFilter',
      label: 'Township',
      type: 'select',
      options: [
        { value: '', label: 'All Townships' },
        ...(townshipsData?.data?.filter(township => 
          !regionFilter || township.region_id.toString() === regionFilter
        ) || []).map(township => ({
          value: township.id.toString(),
          label: `${township.name_en} (${township.name_mm})`,
        })),
      ],
    },
    {
      key: 'wardFilter',
      label: 'Ward',
      type: 'select',
      options: [
        { value: '', label: 'All Wards' },
        ...(wardsData?.data?.filter(ward => {
          if (!townshipFilter) return true;
          return ward.township_id.toString() === townshipFilter;
        }) || []).map(ward => ({
          value: ward.id.toString(),
          label: `${ward.ward_name_en} (${ward.ward_name_mm})`,
        })),
      ],
    },
  ];

  // Table columns
  const createTableColumns = (): TableColumn<YarpyatTax>[] => [
    {
      id: 'name_en',
      label: 'Road & Floor',
      render: (_, yarpyat) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {yarpyat.name_en}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {yarpyat.name_mm}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'ward',
      label: 'Ward',
      render: (_, yarpyat) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {yarpyat.ward?.ward_name_en || 'Unknown Ward'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {yarpyat.ward?.ward_name_mm || ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'township',
      label: 'Township',
      render: (_, yarpyat) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {yarpyat.ward?.township?.name_en || 'Unknown Township'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {yarpyat.ward?.township?.name_mm || ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'region',
      label: 'Region',
      render: (_, yarpyat) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {yarpyat.ward?.township?.region?.name_en || 'Unknown Region'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {yarpyat.ward?.township?.region?.name_mm || ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      render: (_, yarpyat) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          {yarpyat.price.toLocaleString()} MMK
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_value, yarpyat) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleEdit(yarpyat)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDelete(yarpyat)}
              color="error"
              disabled={deleteYarpyatMutation.isPending}
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

  const createMobileCardActions = (yarpyat: YarpyatTax): MobileCardAction[] => [
    {
      icon: <EditIcon />,
      tooltip: 'Edit',
      color: 'secondary' as const,
      onClick: () => handleEdit(yarpyat),
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete',
      color: 'error' as const,
      onClick: () => handleDelete(yarpyat),
    },
  ];

  // ========================================================================
  // RENDER
  // ========================================================================

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error.message || 'Failed to load yarpyat taxes'}
        </Alert>
      </Box>
    );
  }


  return (
    <Box>
      <PageHeader
        title="Yarpyat Taxes"
        subtitle="Manage yarpyat tax information"
        breadcrumbs="Dashboard / Master Data / Yarpyat Taxes"
        actionButton={{
          text: 'Add Yarpyat Tax',
          icon: <AddIcon />,
          onClick: handleAdd
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Filters */}
      <StandardFilters
        filters={{ 
          searchTerm: search, 
          regionFilter, 
          townshipFilter, 
          wardFilter 
        }}
        onFilterChange={(key, value) => {
          if (key === 'searchTerm') {
            setSearch(value);
            setPage(0); // Reset to first page when search changes
          } else if (key === 'regionFilter') {
            setRegionFilter(value);
            // Reset township and ward filters when region changes
            setTownshipFilter('');
            setWardFilter('');
            setPage(0); // Reset to first page when filter changes
          } else if (key === 'townshipFilter') {
            setTownshipFilter(value);
            // Reset ward filter when township changes
            setWardFilter('');
            setPage(0); // Reset to first page when filter changes
          } else if (key === 'wardFilter') {
            setWardFilter(value);
            setPage(0); // Reset to first page when filter changes
          }
        }}
        fields={[
          {
            key: 'searchTerm',
            type: 'search',
            label: 'Search',
            placeholder: 'Search yarpyat taxes...',
          },
          ...filterFields,
        ]}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Desktop Table */}
      {!isMobile && (
        filteredYarpyatData.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Yarpyat Taxes Found"
            message={search || wardFilter || townshipFilter || regionFilter
              ? "No yarpyat taxes match your current filters. Try adjusting your search criteria."
              : "No yarpyat taxes have been created yet."
            }
          />
        ) : (
          <StandardTable
            columns={createTableColumns()}
            data={filteredYarpyatData}
            loading={isLoading}
            emptyMessage="No yarpyat taxes found"
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={pagination?.total || 0}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        )
      )}

      {/* Mobile Cards */}
      {isMobile && (
        filteredYarpyatData.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Yarpyat Taxes Found"
            message={search || wardFilter || townshipFilter || regionFilter
              ? "No yarpyat taxes match your current filters. Try adjusting your search criteria."
              : "No yarpyat taxes have been created yet."
            }
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isLoading ? (
              // Loading skeleton cards for mobile
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <MobileCard
                  key={`skeleton-${index}`}
                  title=""
                  loading={true}
                />
              ))
            ) : (
              filteredYarpyatData.map((yarpyat) => (
                <MobileCard
                  key={yarpyat.id}
                  title={yarpyat.name_en}
                  subtitle={yarpyat.name_mm}
                  description={`${yarpyat.ward?.ward_name_en || 'Unknown Ward'} (${yarpyat.ward?.ward_name_mm || ''}), ${yarpyat.ward?.township?.name_en || 'Unknown Township'} (${yarpyat.ward?.township?.name_mm || ''}), ${yarpyat.ward?.township?.region?.name_en || 'Unknown Region'} (${yarpyat.ward?.township?.region?.name_mm || ''})`}
                  avatar={<MoneyIcon />}
                  avatarColor="primary.main"
                  actions={createMobileCardActions(yarpyat)}
                  onClick={() => handleEdit(yarpyat)}
                  clickable
                />
              ))
            )}
            {!isLoading && (
              <Pagination
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={pagination?.total || 0}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              />
            )}
          </Box>
        )
      )}
    </Box>
  );
};

export default YarpyatListPage;
