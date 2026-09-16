import React, { useEffect, useMemo } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  HomeWork as SoldIcon,
  Map as MapIcon,
  Person as PersonIcon,
  Key as RentedIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard } from '../../components/common/MobileCard';
import {
  PageEmptyState,
  PageErrorState,
  PageLoadingState,
  StatusChip,
} from '../../components/ui';
import { useDebouncedValue, useFilters, usePagination } from '../../hooks';
import { usePropertyNotes } from '../../services/queries/propertyNotes';
import { FilterState } from '../../constants/filters';
import type { PropertyNote, PropertyNoteStatus } from '../../types/propertyNote';

interface PropertyNoteFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
}

const SEARCH_DEBOUNCE_MS = 500;

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search code, user, phone, ward, road...',
    minWidth: { xs: 220, sm: 280 },
    maxWidth: { sm: 340 },
    flexGrow: 0,
    width: { xs: '100%', sm: 300 },
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'sold', label: 'Sold' },
      { value: 'rented', label: 'Rented' },
    ],
  },
];

const PropertyNoteListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination();

  const { filters, setFilter, resetFilters } = useFilters<PropertyNoteFilters>({
    searchTerm: '',
    statusFilter: 'all',
  });

  const debouncedSearch = useDebouncedValue(filters.searchTerm.trim(), SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    handleChangePage(null, 0);
  }, [debouncedSearch, filters.statusFilter, handleChangePage]);

  const listParams = useMemo(
    () => ({
      page: page + 1,
      per_page: rowsPerPage,
      search: debouncedSearch || undefined,
      status:
        filters.statusFilter !== 'all'
          ? (filters.statusFilter as PropertyNoteStatus)
          : undefined,
    }),
    [page, rowsPerPage, debouncedSearch, filters.statusFilter]
  );

  const { data, isLoading, isFetching, error, refetch } = usePropertyNotes(listParams);
  const notes = data?.data ?? [];
  const statistics = data?.statistics;
  const totalCount = data?.pagination?.total ?? notes.length;
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isFetching && !isInitialLoading;

  const statsCards: StatCard[] = useMemo(
    () => [
      {
        title: 'Total',
        value: statistics?.total ?? 0,
        color: 'primary',
        icon: <MapIcon />,
      },
      {
        title: 'Active',
        value: statistics?.active ?? 0,
        color: 'success',
        icon: <ActiveIcon />,
      },
      {
        title: 'Sold',
        value: statistics?.sold ?? 0,
        color: 'info',
        icon: <SoldIcon />,
      },
      {
        title: 'Rented',
        value: statistics?.rented ?? 0,
        color: 'warning',
        icon: <RentedIcon />,
      },
    ],
    [statistics]
  );

  const columns: TableColumn<PropertyNote>[] = useMemo(
    () => [
      {
        id: 'note_code',
        label: 'Code',
        render: (_value, row) => (
          <Typography variant="body2" fontWeight={600}>
            {row?.note_code || '—'}
          </Typography>
        ),
      },
      {
        id: 'user',
        label: 'Owner',
        render: (_value, row) => {
          if (!row?.user) return <Typography variant="body2">—</Typography>;
          return (
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {row.user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {row.user.phone || row.user.email || '—'}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'listing_type',
        label: 'Type',
        render: (_value, row) => (
          <Typography variant="body2">
            {row?.listing_type?.name_en || '—'}
          </Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'location',
        label: 'Location',
        render: (_value, row) => {
          const parts = [row?.township?.name_en, row?.region?.name_en].filter(Boolean);
          return (
            <Typography variant="body2">{parts.length ? parts.join(', ') : '—'}</Typography>
          );
        },
        hidden: isMobile,
      },
      {
        id: 'status',
        label: 'Status',
        render: (_value, row) => {
          if (!row) return null;
          return <StatusChip status={row.status} size="small" />;
        },
      },
      {
        id: 'created_at',
        label: 'Created',
        render: (_value, row) => (
          <Typography variant="body2">{row?.created_at || '—'}</Typography>
        ),
        hidden: isMobile,
      },
    ],
    [isMobile]
  );

  if (isInitialLoading) {
    return <PageLoadingState title="Loading Property Notes" />;
  }

  if (error && !data) {
    return (
      <PageErrorState
        error={error}
        title="Error Loading Property Notes"
        message={error instanceof Error ? error.message : 'Failed to load property notes.'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Property Notes"
        breadcrumbs="Dashboard / Property Note / Property Notes"
        subtitle="All property notes created by users (read-only)"
      />

      <StatisticsCards cards={statsCards} columns={{ xs: 12, sm: 6, md: 3, lg: 3 }} />

      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof PropertyNoteFilters, value)}
        fields={FILTER_FIELDS}
        showClearButton
        onClearFilters={resetFilters}
      />

      <Box sx={{ height: 4, mb: 1 }}>
        {isRefreshing ? <LinearProgress sx={{ height: 4, borderRadius: 1 }} /> : null}
      </Box>

      {notes.length === 0 && (
        <PageEmptyState
          title="No property notes"
          message={
            filters.searchTerm || filters.statusFilter !== 'all'
              ? 'Try changing filters.'
              : 'No property notes yet.'
          }
        />
      )}

      {isMobile && notes.length > 0 ? (
        <Box>
          {notes.map((note) => (
            <MobileCard
              key={note.id}
              title={note.note_code}
              subtitle={note.user?.name || '—'}
              description={`${note.listing_type?.name_en || '—'} · ${note.township?.name_en || '—'}`}
              avatar={<PersonIcon />}
              status={{
                label: note.status,
                color:
                  note.status === 'active'
                    ? ('success' as const)
                    : note.status === 'sold'
                      ? ('info' as const)
                      : ('warning' as const),
              }}
            />
          ))}
        </Box>
      ) : (
        notes.length > 0 && (
          <StandardTable
            columns={columns}
            data={notes}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            getRowKey={(row) => row.id}
          />
        )
      )}
    </Box>
  );
};

export default PropertyNoteListPage;
