import React, {
    useMemo,
    useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useTheme,
    useMediaQuery,
    Typography,
    Box,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
} from '@mui/material';
import {
    useFilters,
    usePagination,
    useAlertSystem,
    useDeleteConfirmation,
} from '../../hooks';
import { FilterState } from '../../constants/filters';
import {
    useFaqs,
    useDeleteFaq,
    useRestoreFaq,
    useFaqStatistics,
} from '../../services/queries/faqs';
import { Faq } from '@/types/faq';
import {
    QuestionMark as QuestionMarkIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    RestoreFromTrash as RestoreIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import PageHeader from '../../components/layout/PageHeader';
import { 
    Pagination, 
    StatusChip, 
    PageErrorState, 
    PageEmptyState, 
    DeleteConfirmationDialog, 
    ActionAlert,
} from '../../components/ui';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { formatDate } from '../../constants/dateFormats';



// ============================================================================  
// TYPES & INTERFACES
// ============================================================================

interface FaqFiltersState extends FilterState {
    status: string;
    searchTerm: string;
}

const PAGE_CONFIG = {
    title: 'FAQs',
    description: 'Manage frequently asked questions',
} as const;

const FILTER_FIELDS: FilterField[] = [
    {
        key: 'searchTerm',
        type: 'search',
        label: 'Search',
        placeholder: 'Search by question or answer (EN or MM)...',
    },
    {
        key: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
        ],
    },
];

// ============================================================================  
// MAIN COMPONENT
// ============================================================================

const FaqListPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ========================================================================  
    // HOOKS & STATE
    // ========================================================================

    const { filters, setFilter } = useFilters<FaqFiltersState>({
        status: '',
        searchTerm: '',
    });

    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

    // Tab state for active/deleted faqs
    const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

    // API Queries - Fetch a larger dataset for client-side filtering
    const { data: faqsResponse, isLoading, error } = useFaqs({
        page: 1, // Fetch first page
        per_page: 90, // Fetch a larger number to accommodate both active and deleted requests
        status: filters.status || undefined, // Add status filter
    });

    // API Query - Fetch faq statistics
    const { data: statistics } = useFaqStatistics();

    // Delete and restore mutations
    const deleteFaqMutation = useDeleteFaq();
    const restoreFaqMutation = useRestoreFaq();

    // Alert system hook
    const { alert, showSuccess, showError, clearAlert } = useAlertSystem();

    // Delete confirmation hook
    const {
        deleteState,
        openDeleteConfirmation,
        closeDeleteConfirmation,
        handleConfirmDelete,
    } = useDeleteConfirmation();

    // ========================================================================  
    // EVENT HANDLERS
    // ========================================================================

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        // Reset to first page when switching tabs
        handleChangePage(event, 0);
    };

    // Filter change handler - updates filters immediately
    const handleFilterChange = (key: string, value: string) => {
        setFilter(key as keyof FaqFiltersState, value);
    };

    // Clear all filters function
    const handleClearFilters = () => {
        // Reset all filters to default values
        setFilter('searchTerm', '');
        setFilter('status', '');

        // Reset to first page
        handleChangePage({} as any, 0);
    };

    const handleDeleteFaq = (faq: Faq) => {
        openDeleteConfirmation(
            `FAQ #${faq.id}`,
            'FAQ',
            async () => {
                try {
                    await deleteFaqMutation.mutateAsync(faq.slug);
                    showSuccess(`FAQ #${faq.id} deleted successfully!`);
                } catch (error: any) {
                    showError(error.message || 'Failed to delete FAQ. Please try again.');
                }
            }
        );
    };

    const handleRestoreFaq = async (faq: Faq) => {
        try {
            await restoreFaqMutation.mutateAsync(faq.slug);
            showSuccess(`FAQ #${faq.id} restored successfully!`);
        } catch (error: any) {
            showError(error.message || 'Failed to restore FAQ. Please try again.');
        }
    };

    // ========================================================================  
    // HELPER FUNCTIONS
    // ========================================================================

    // Helper function to check if a string contains a search term (case insensitive)
    const containsSearchTerm = (text: string | null | undefined, term: string): boolean => {
        if (!text || !term) return false;
        return text.toLowerCase().includes(term.toLowerCase());
    };

    // Enhanced search function that checks all relevant fields
    const matchesSearchTerm = (faq: Faq, term: string): boolean => {
        if (!term) return true;
        
        return (
            containsSearchTerm(faq.question_en, term) ||
            containsSearchTerm(faq.question_mm, term) ||
            containsSearchTerm(faq.answer_en, term) ||
            containsSearchTerm(faq.answer_mm, term) ||
            faq.id.toString().includes(term)
        );
    };

    // Extract faqs data
    const allFaqs = faqsResponse?.data || [];

    // Filter faqs based on active/deleted status
    const filteredFaqs = useMemo(() => {
        return allFaqs.filter((faq) => {
            // Filter by active/deleted status based on tab
            const matchesDeletedStatus = activeTab === 0
                ? faq.deleted_at === null  // Active tab: show non-deleted requests
                : faq.deleted_at !== null; // Deleted tab: show deleted requests

            // Filter by search term using enhanced search function
            const matchesSearch = matchesSearchTerm(faq, filters.searchTerm);

            // Filter by status
            const matchesStatus = !filters.status ||
                (faq.is_active ? 'active' : 'inactive') === filters.status;

            return matchesDeletedStatus && matchesSearch && matchesStatus;
        });
    }, [allFaqs, activeTab, filters.searchTerm, filters.status]);

    // Paginate data
    const paginatedFaqs = useMemo(() => {
        return filteredFaqs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredFaqs, page, rowsPerPage]);

    // ========================================================================  
    // STATISTICS
    // ========================================================================

    const statsCards: StatCard[] = useMemo(() => [
        {
            title: 'Total FAQs',
            value: statistics?.data?.total_count || allFaqs.length,
            color: 'primary',
            icon: <QuestionMarkIcon />,
        },
        // {
        //     title: 'Active FAQs',
        //     value: statistics?.data?.active_count || allFaqs.filter(f => f.is_active && !f.deleted_at).length,
        //     color: 'success',
        //     icon: <QuestionMarkIcon />,
        // },
        // {
        //     title: 'Inactive FAQs',
        //     value: statistics?.data?.active_count || allFaqs.filter(f => !f.is_active && !f.deleted_at).length,
        //     color: 'success',
        //     icon: <QuestionMarkIcon />,
        // },
    ], [statistics, allFaqs]);

    // ========================================================================  
    // TABLE COLUMNS
    // ========================================================================

    const columns: TableColumn<Faq>[] = useMemo(() => [
        {
            id: 'id',
            label: 'ID',
            render: (_value, row) => (
                <Typography variant="body2" fontWeight="500">
                    #{row.id}
                </Typography>
            ),
        },
        {
            id: 'question_en',
            label: 'Question (EN)',
            render: (_value, row) => (
                <Box>
                    <Typography variant="body2" fontWeight="500">
                        {row.question_en}
                    </Typography>
                    {row.question_mm && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            {row.question_mm}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            id: 'answer_en',
            label: 'Answer (EN)',
            render: (_value, row) => (
                <Box>
                    <Typography variant="body2" sx={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.answer_en}
                    </Typography>
                    {row.answer_mm && (
                        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', mt: 0.5 }}>
                            {row.answer_mm}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            id: 'is_active',
            label: 'Status',
            render: (_value, row) => (
                <StatusChip 
                    status={row.is_active ? 'active' : 'inactive'} 
                    label={row.is_active ? 'Active' : 'Inactive'}
                    size="small" 
                />
            ),
        },
        {
            id: 'order',
            label: 'Order',
            render: (_value, row) => (
                <Typography variant="body2">
                    {row.order}
                </Typography>
            ),
        },
        {
            id: 'created_at',
            label: 'Created',
            render: (_value, row) => (
                <Typography variant="body2" color="textSecondary">
                    {row.created_at ? formatDate(row.created_at, 'display') : 'N/A'}
                </Typography>
            ),
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            render: (_value, row) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {activeTab === 0 ? (
                        <>
                            <Tooltip title="View Details">
                                <IconButton
                                    size="small"
                                    onClick={() => navigate(`/faqs/${row.slug}`)}
                                    color="primary"
                                >
                                    <ViewIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteFaq(row)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <Tooltip title="View Details">
                                <IconButton
                                    size="small"
                                    onClick={() => navigate(`/faqs/${row.slug}`)}
                                    color="primary"
                                >
                                    <ViewIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Restore">
                                <IconButton
                                    size="small"
                                    onClick={() => handleRestoreFaq(row)}
                                    color="success"
                                >
                                    <RestoreIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            ),
        },
    ], [activeTab, navigate]);

    // ========================================================================  
    // MOBILE CARD ACTIONS
    // ========================================================================

    const createMobileCardActions = (faq: Faq): MobileCardAction[] => {
        if (activeTab === 0) {
            return [
                {
                    icon: <ViewIcon />,
                    tooltip: 'View Details',
                    color: 'primary',
                    onClick: () => navigate(`/faqs/${faq.slug}`),
                },
                {
                    icon: <DeleteIcon />,
                    tooltip: 'Delete',
                    color: 'error',
                    onClick: () => handleDeleteFaq(faq),
                },
            ];
        } else {
            return [
                {
                    icon: <ViewIcon />,
                    tooltip: 'View Details',
                    color: 'primary',
                    onClick: () => navigate(`/faqs/${faq.slug}`),
                },
                {
                    icon: <RestoreIcon />,
                    tooltip: 'Restore',
                    color: 'success',
                    onClick: () => handleRestoreFaq(faq),
                },
            ];
        }
    };

    // ========================================================================  
    // RENDER
    // ========================================================================

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ marginLeft: 0, width: '100%' }}>
                <PageHeader
                    title={PAGE_CONFIG.title}
                    breadcrumbs="Dashboard / FAQs"
                    subtitle={PAGE_CONFIG.description}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Typography variant="body1">Loading FAQs...</Typography>
                </Box>
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <PageErrorState
                error={error}
                title="Error Loading FAQs"
                message={(error as any).message}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <Box sx={{ marginLeft: 0, width: '100%' }}>
            <PageHeader
                title={PAGE_CONFIG.title}
                breadcrumbs="Dashboard / FAQs"
                subtitle={PAGE_CONFIG.description}
                actionButton={{
                    text: 'Create FAQ',
                    icon: <AddIcon />,
                    onClick: () => navigate('/faqs/create')
                }}
            />

            {/* Success/Error Alert */}
            <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

            {/* Statistics Cards */}
            <Box sx={{ mb: 3 }}>
                <StatisticsCards cards={statsCards} />
            </Box>

            {/* Active/Deleted Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    aria-label="faq status tabs"
                >
                    <Tab 
                        label={`Active FAQs (${allFaqs.filter(f => f.deleted_at === null).length})`} 
                        id="faq-tab-0"
                        aria-controls="faq-tabpanel-0"
                    />
                    <Tab 
                        label={`Deleted FAQs (${allFaqs.filter(f => f.deleted_at !== null).length})`} 
                        id="faq-tab-1"
                        aria-controls="faq-tabpanel-1"
                    />
                </Tabs>
            </Box>

            {/* Filters */}
            <StandardFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                fields={FILTER_FIELDS}
                onClearFilters={handleClearFilters}
                showClearButton={true}
            />

            {/* Empty state */}
            {filteredFaqs.length === 0 && !isLoading && (
                <PageEmptyState
                    title="No FAQs Found"
                    message={filters.searchTerm || filters.status
                        ? "No FAQs match your current filters. Try adjusting your search criteria."
                        : activeTab === 0
                            ? "No active FAQs have been created yet."
                            : "No deleted FAQs found."
                    }
                />
            )}

            {/* Mobile Card Layout */}
            {isMobile && filteredFaqs.length > 0 ? (
                <Box>
                    {paginatedFaqs.map((faq) => (
                        <MobileCard
                            key={faq.id}
                            title={faq.question_en}
                            subtitle={faq.question_mm || ''}
                            description={`${faq.answer_en} ${faq.answer_mm ? ` (${faq.answer_mm})` : ''}`}
                            avatar={<QuestionMarkIcon />}
                            avatarColor="primary.main"
                            status={{
                                label: faq.is_active ? 'Active' : 'Inactive',
                                color: faq.is_active ? 'success' : 'default',
                            }}
                            chips={[
                                {
                                    label: `Order: ${faq.order}`,
                                    color: 'primary',
                                },
                                {
                                    label: `ID: ${faq.id}`,
                                    color: 'secondary',
                                },
                            ]}
                            actions={createMobileCardActions(faq)}
                            onClick={() => navigate(`/faqs/${faq.slug}`)}
                            clickable={true}
                        />
                    ))}
                    <Pagination
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={filteredFaqs.length}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        showResultsInfo={true}
                    />
                </Box>
            ) : (
                /* Desktop Table Layout */
                filteredFaqs.length > 0 && (
                    <StandardTable
                        columns={columns}
                        data={paginatedFaqs}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={filteredFaqs.length}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        getRowKey={(row) => row.id}
                    />
                )
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteState.open}
                onClose={closeDeleteConfirmation}
                onConfirm={handleConfirmDelete}
                itemName={deleteState.itemName}
                itemType={deleteState.itemType}
                isLoading={deleteFaqMutation.isPending}
                error={deleteFaqMutation.error?.message}
            />
        </Box>
    );
};

export default FaqListPage;