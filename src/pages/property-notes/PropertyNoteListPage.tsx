import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  Tooltip,
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
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import {
  PageEmptyState,
  PageErrorState,
  PageLoadingState,
  StatusChip,
} from '../../components/ui';
import { useDebouncedValue, useFilters, usePagination } from '../../hooks';
import { usePropertyNotes } from '../../services/queries/propertyNotes';
import { usePropertyListingTypes } from '../../services/queries/properties';
import { FilterState } from '../../constants/filters';
import type { PropertyNote, PropertyNoteStatus } from '../../types/propertyNote';

interface PropertyNoteFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  listingTypeFilter: string;
}

const SEARCH_DEBOUNCE_MS = 500;

/** Property notes only use Sale / Rent listing types. */
const PROPERTY_NOTE_LISTING_SLUGS = new Set(['for-sale', 'for-rent']);

const PropertyNoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /**
   * 0 = Active (non-deleted) notes, 1 = Deleted notes — same pattern as Properties list.
   */
  const [activeTab, setActiveTab] = useState(0);

  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination();

  const { filters, setFilter, resetFilters } = useFilters<PropertyNoteFilters>({
    searchTerm: '',
    statusFilter: 'all',
    listingTypeFilter: 'all',
  });

  const debouncedSearch = useDebouncedValue(filters.searchTerm.trim(), SEARCH_DEBOUNCE_MS);

  const { data: listingTypesResponse } = usePropertyListingTypes({
    per_page: 100,
  });

  const listingTypeOptions = useMemo(() => {
    const types = (listingTypesResponse?.data ?? []).filter((type) =>
      PROPERTY_NOTE_LISTING_SLUGS.has(type.slug)
    );
    return [
      { value: 'all', label: 'All Types' },
      ...types.map((type) => ({
        value: String(type.id),
        label: type.name_en,
      })),
    ];
  }, [listingTypesResponse?.data]);

  const filterFields: FilterField[] = useMemo(
    () => [
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
        key: 'listingTypeFilter',
        type: 'select',
        label: 'Type',
        options: listingTypeOptions,
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
    ],
    [listingTypeOptions]
  );

  useEffect(() => {
    handleChangePage(null, 0);
  }, [debouncedSearch, filters.statusFilter, filters.listingTypeFilter, activeTab, handleChangePage]);

  const listParams = useMemo(
    () => ({
      page: page + 1,
      per_page: rowsPerPage,
      search: debouncedSearch || undefined,
      status:
        filters.statusFilter !== 'all'
          ? (filters.statusFilter as PropertyNoteStatus)
          : undefined,
      listing_type_id:
        filters.listingTypeFilter !== 'all'
          ? Number(filters.listingTypeFilter)
          : undefined,
      deleted: activeTab === 1 ? ('true' as const) : ('false' as const),
    }),
    [page, rowsPerPage, debouncedSearch, filters.statusFilter, filters.listingTypeFilter, activeTab]
  );

  const { data, isLoading, isFetching, error, refetch } = usePropertyNotes(listParams);
  const notes = data?.data ?? [];
  const statistics = data?.statistics;
  const totalCount = data?.pagination?.total ?? notes.length;
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isFetching && !isInitialLoading;
  const isDeletedTab = activeTab === 1;

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
        id: isDeletedTab ? 'deleted_at' : 'created_at',
        label: isDeletedTab ? 'Deleted' : 'Created',
        render: (_value, row) => (
          <Typography variant="body2">
            {(isDeletedTab ? row?.deleted_at : row?.created_at) || '—'}
          </Typography>
        ),
        hidden: isMobile,
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (_value, row) => {
          if (!row) return null;
          return (
            <Tooltip title="View details">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/property-notes/${row.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        },
      },
    ],
    [isMobile, isDeletedTab, navigate]
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
        fields={filterFields}
        showClearButton
        onClearFilters={resetFilters}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="property note status tabs"
        >
          <Tab
            label="Active Notes"
            id="property-note-tab-0"
            aria-controls="property-note-tabpanel-0"
          />
          <Tab
            label="Deleted Notes"
            id="property-note-tab-1"
            aria-controls="property-note-tabpanel-1"
          />
        </Tabs>
      </Box>

      <Box sx={{ height: 4, mb: 1 }}>
        {isRefreshing ? <LinearProgress sx={{ height: 4, borderRadius: 1 }} /> : null}
      </Box>

      {notes.length === 0 && (
        <PageEmptyState
          title={isDeletedTab ? 'No deleted property notes' : 'No property notes'}
          message={
            filters.searchTerm ||
            filters.statusFilter !== 'all' ||
            filters.listingTypeFilter !== 'all'
              ? 'Try changing filters.'
              : isDeletedTab
                ? 'No soft-deleted property notes yet.'
                : 'No property notes yet.'
          }
        />
      )}

      {isMobile && notes.length > 0 ? (
        <Box>
          {notes.map((note) => {
            const actions: MobileCardAction[] = [
              {
                icon: <ViewIcon />,
                tooltip: 'View details',
                color: 'primary',
                onClick: () => navigate(`/property-notes/${note.id}`),
              },
            ];
            return (
              <MobileCard
                key={note.id}
                title={note.note_code}
                subtitle={note.user?.name || '—'}
                description={`${note.listing_type?.name_en || '—'} · ${note.township?.name_en || '—'}${
                  isDeletedTab && note.deleted_at ? ` · Deleted ${note.deleted_at}` : ''
                }`}
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
                actions={actions}
                clickable
                onClick={() => navigate(`/property-notes/${note.id}`)}
              />
            );
          })}
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
