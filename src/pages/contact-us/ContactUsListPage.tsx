import React, { useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Restore as RestoreIcon,
  DeleteForever as ForceDeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { PageErrorState, PageEmptyState, DeleteConfirmationDialog, ActionAlert, Pagination } from '../../components/ui';
import { usePagination, useFilters, useDeleteConfirmation, useAlertSystem } from '../../hooks';
import { useContactUs, useDeleteContactUs, useRestoreContactUs, useForceDeleteContactUs } from '../../services/queries/contactUs';
import { FilterState } from '../../constants/filters';
import { ContactUs } from '../../types/contactUs';
import { formatDate } from '../../constants/dateFormats';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ContactUsFilters extends FilterState {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  user_name: string;
  email: string;
  category: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Contact Us Management',
  description: 'View and manage contact us submissions',
  createButtonText: 'Add Contact',
  createButtonPath: '/contact-us/create',
} as const;

const CATEGORY_OPTIONS = [
  'General Inquiry',
  'Property Listing', 
  'Technical Support',
  'Partnership',
  'Complaint',
  'Suggestions'
];

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name, email, subject, or message...',
  },
  {
    key: 'category',
    type: 'select',
    label: 'Category',
    placeholder: 'All Categories',
    options: [
      { value: '', label: 'All Categories' },
      ...CATEGORY_OPTIONS.map(cat => ({ value: cat, label: cat }))
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ContactUsListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Hooks
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();
  const { filters, setFilter, resetFilters } = useFilters<ContactUsFilters>({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    user_name: '',
    email: '',
    category: '',
  });
  
  // Create a custom reset function that ensures all fields are cleared
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);
  
  const { showSuccess, showError } = useAlertSystem();
  const { 
    deleteState, 
    openDeleteConfirmation, 
    closeDeleteConfirmation, 
    handleConfirmDelete 
  } = useDeleteConfirmation();

  // API Queries - Fetch all data once for client-side filtering
  const { data: contactUsResponse, isLoading, error, refetch } = useContactUs({
    page: 1,
    per_page: 1000, // Fetch all data
  });

  const deleteContactUsMutation = useDeleteContactUs();
  const restoreContactUsMutation = useRestoreContactUs();
  const forceDeleteContactUsMutation = useForceDeleteContactUs();

  // Data processing
  const allContactUs = contactUsResponse?.data || [];

  // Client-side filtering
  const filteredContactUs = useMemo(() => {
    let filtered = allContactUs;

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(contact => 
        (contact.user_name && contact.user_name.toLowerCase().includes(searchLower)) ||
        (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
        (contact.subject && contact.subject.toLowerCase().includes(searchLower)) ||
        (contact.message && contact.message.toLowerCase().includes(searchLower)) ||
        (contact.slug && contact.slug.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(contact => contact.category === filters.category);
    }

    return filtered;
  }, [allContactUs, filters.searchTerm, filters.category]);
  
  // Log filter changes for debugging
  useEffect(() => {
    console.log('Filters changed:', filters);
  }, [filters]);

  // Client-side pagination
  const paginatedContactUs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredContactUs.slice(startIndex, endIndex);
  }, [filteredContactUs, page, rowsPerPage]);

  // Use filtered and paginated data
  const contactUsRecords = paginatedContactUs;

  // Reset page to 0 when filters change
  useEffect(() => {
    handleChangePage(null, 0);
  }, [filters.searchTerm, filters.category, handleChangePage]);


  // Event handlers
  const handleDeleteContactUs = async (contact: ContactUs) => {
    const userName = contact.user_name ? String(contact.user_name) : 'Unknown User';
    
    openDeleteConfirmation(
      userName,
      'contact submission',
      async () => {
        try {
          const slug = contact.slug || '';
          if (!slug) {
            throw new Error('Contact slug is missing');
          }
          
          await deleteContactUsMutation.mutateAsync(slug);
          showSuccess(`Contact submission from ${userName} deleted successfully!`);
          refetch();
        } catch (error: any) {
          console.error('Delete contact error:', error);
          showError(error.message || 'Failed to delete contact submission.');
        }
      }
    );
  };

  const handleRestoreContactUs = async (contact: ContactUs) => {
    try {
      const slug = contact.slug || '';
      if (!slug) {
        throw new Error('Contact slug is missing');
      }
      
      await restoreContactUsMutation.mutateAsync(slug);
      showSuccess(`Contact submission from ${contact.user_name} restored successfully!`);
      refetch();
    } catch (error: any) {
      console.error('Restore contact error:', error);
      showError(error.message || 'Failed to restore contact submission.');
    }
  };

  const handleForceDeleteContactUs = async (contact: ContactUs) => {
    const userName = contact.user_name ? String(contact.user_name) : 'Unknown User';
    
    openDeleteConfirmation(
      userName,
      'contact submission permanently',
      async () => {
        try {
          const slug = contact.slug || '';
          if (!slug) {
            throw new Error('Contact slug is missing');
          }
          
          await forceDeleteContactUsMutation.mutateAsync(slug);
          showSuccess(`Contact submission from ${userName} permanently deleted!`);
          refetch();
        } catch (error: any) {
          console.error('Force delete contact error:', error);
          showError(error.message || 'Failed to permanently delete contact submission.');
        }
      }
    );
  };

  // Table columns configuration
  const columns: TableColumn<ContactUs>[] = [
    {
      id: 'user',
      label: 'User',
      sortable: true,
      render: (_, contact) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {contact.user_name || 'Unknown User'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {contact.created_at ? formatDate(contact.created_at) : 'Unknown date'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      sortable: false,
      render: (_, contact) => (
        <Box>
          {contact.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                {contact.email}
              </Typography>
            </Box>
          )}
          {contact.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                {contact.phone}
              </Typography>
            </Box>
          )}
          {!contact.email && !contact.phone && (
            <Typography variant="caption" color="textSecondary">
              No contact info
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'subject',
      label: 'Subject',
      sortable: false,
      render: (_, contact) => (
        <Box sx={{ maxWidth: 200 }}>
          <Typography 
            variant="body2" 
            fontWeight={500}
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {contact.subject || 'No subject'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <CategoryIcon fontSize="small" color="action" />
            <Chip
              label={contact.category}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
      ),
    },
    {
      id: 'message',
      label: 'Message',
      sortable: false,
      render: (_, contact) => (
        <Box sx={{ maxWidth: 300 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {contact.message || 'No message'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, contact) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/contact-us/${contact.slug}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {contact.deleted_at ? (
            <>
              <Tooltip title="Restore Contact">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleRestoreContactUs(contact)}
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Permanently Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleForceDeleteContactUs(contact)}
                >
                  <ForceDeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Delete Contact">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteContactUs(contact)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  // Mobile card actions
  const getMobileCardActions = (contact: ContactUs): MobileCardAction[] => {
    const actions: MobileCardAction[] = [
      {
        icon: <VisibilityIcon />,
        color: 'primary',
        tooltip: 'View Details',
        onClick: () => navigate(`/contact-us/${contact.slug}`),
      },
    ];

    if (contact.deleted_at) {
      actions.push(
        {
          icon: <RestoreIcon />,
          color: 'success',
          tooltip: 'Restore Contact',
          onClick: () => handleRestoreContactUs(contact),
        },
        {
          icon: <ForceDeleteIcon />,
          color: 'error',
          tooltip: 'Permanently Delete',
          onClick: () => handleForceDeleteContactUs(contact),
        }
      );
    } else {
      actions.push({
        icon: <DeleteIcon />,
        color: 'error',
        tooltip: 'Delete Contact',
        onClick: () => handleDeleteContactUs(contact),
      });
    }

    return actions;
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Contact Us Management"
        subtitle={PAGE_CONFIG.description}
      />


      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof ContactUsFilters, value)}
        fields={FILTER_FIELDS}
        showClearButton={true}
        onClearFilters={handleResetFilters}
      />

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="body1">Loading contact submissions...</Typography>
        </Box>
      )}

      {/* Error state */}
      {error && (
        <PageErrorState 
          error={error} 
          onRetry={refetch}
          title="Failed to load contact submissions"
        />
      )}

      {/* Empty state - shown when no contacts match filters */}
      {!isLoading && !error && contactUsRecords.length === 0 && (
        <PageEmptyState
          title="No Contact Submissions Found"
          message={filters.searchTerm || filters.category
            ? "No contact submissions match your current filters. Try adjusting your search criteria."
            : "No contact submissions have been received yet."
          }
        />
      )}

      {/* Table/Cards */}
      {!isLoading && !error && contactUsRecords.length > 0 && isMobile && (
        <Box sx={{ mt: 2 }}>
          {contactUsRecords.map((contact) => (
            <MobileCard
              key={contact.id}
              title={contact.user_name || 'Unknown User'}
              subtitle={`${contact.subject} • ${contact.category} • ${contact.created_at ? formatDate(contact.created_at) : 'Unknown Date'}`}
              actions={getMobileCardActions(contact)}
            />
          ))}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredContactUs.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      )}

      {/* Desktop Table Layout */}
      {!isLoading && !error && contactUsRecords.length > 0 && !isMobile && (
        <StandardTable
          columns={columns}
          data={contactUsRecords}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredContactUs.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteState.open}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete Contact Submission"
        isLoading={deleteContactUsMutation.isPending || forceDeleteContactUsMutation.isPending}
      />

      {/* Action Alert */}
      <ActionAlert />
    </Box>
  );
};

export default ContactUsListPage;
