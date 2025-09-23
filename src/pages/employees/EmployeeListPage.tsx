import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { MobileCard, MobileCardAction } from '../../components/common/MobileCard';
import { Pagination, StatusChip, PageErrorState, PageEmptyState, ActionAlert, DeleteConfirmationDialog, ConfirmationDialog } from '../../components/ui';
import { usePagination, useFilters, useAlertSystem, useManualSearch } from '../../hooks';
import { useEmployees, useEmployeeStatistics, useDeleteEmployee, useRestoreEmployee } from '../../services/queries/employees';
import { FilterState } from '../../constants/filters';
import { Employee } from '../../types/employee';
import { formatDate } from '../../constants/dateFormats';
import { EMPLOYEE_POSITIONS, EMPLOYEE_DEPARTMENTS, EMPLOYEE_STATUSES } from '../../constants/employees';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EmployeeFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  positionFilter: string;
  departmentFilter: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const PAGE_CONFIG = {
  title: 'Employee Management',
  description: 'Manage employee records and property assignments',
  createButtonText: 'Add Employee',
  createButtonPath: '/employees/create',
} as const;

// Filter fields will be generated dynamically
const createFilterFields = (): FilterField[] => [
  {
    key: 'searchTerm',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name, email, or employee ID...',
  },
  {
    key: 'statusFilter',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'all', label: 'All Statuses' },
      ...EMPLOYEE_STATUSES,
    ],
  },
  {
    key: 'positionFilter',
    type: 'select',
    label: 'Position',
    options: [
      { value: 'all', label: 'All Positions' },
      ...EMPLOYEE_POSITIONS,
    ],
  },
  {
    key: 'departmentFilter',
    type: 'select',
    label: 'Department',
    options: [
      { value: 'all', label: 'All Departments' },
      ...EMPLOYEE_DEPARTMENTS,
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Manual search: only triggers on Enter key or search button click
  const {
    searchValue,
    searchTerm,
    handleInputChange,
    triggerSearch,
    clearSearch,
    handleKeyPress,
  } = useManualSearch('');

  const { filters, setFilter } = useFilters<EmployeeFilters>({
    searchTerm: '', // This will be overridden by manual search
    statusFilter: 'all',
    positionFilter: 'all',
    departmentFilter: 'all',
  });

  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Tab state for active/deleted employees
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Deleted

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Restore confirmation state
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [employeeToRestore, setEmployeeToRestore] = useState<Employee | null>(null);

  // Alert system hook
  const { alert, clearAlert, showSuccess, showError } = useAlertSystem();

  // API Queries - Server-side filtering and pagination
  const queryParams = {
    page: page + 1, // API uses 1-based pagination
    per_page: rowsPerPage,
    search: searchTerm || undefined, // Use manual search term
    status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
    position: filters.positionFilter !== 'all' ? filters.positionFilter : undefined,
    department: filters.departmentFilter !== 'all' ? filters.departmentFilter : undefined,
    deleted: activeTab === 1 ? 'true' : undefined, // Show deleted employees when tab 1 is active
    sort_by: 'created_at',
    sort_direction: 'desc' as const,
  };

  const { data: employeesResponse, isLoading, error } = useEmployees(queryParams);

  // Employee statistics for dashboard cards
  const { data: statistics } = useEmployeeStatistics();

  // Delete and restore mutations
  const deleteEmployeeMutation = useDeleteEmployee();
  const restoreEmployeeMutation = useRestoreEmployee();

  // Extract employees data (already filtered and paginated by server)
  const employees: Employee[] = employeesResponse?.data || [];
  const pagination = employeesResponse?.pagination;
  
  // Create filter fields
  const filterFields = createFilterFields();

  // Server-side filtering and pagination - no client-side processing needed
  const filteredEmployees = employees;
  const paginatedEmployees = employees; // Already paginated by server

  // ========================================================================
  // STATISTICS
  // ========================================================================

  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Employees',
      value: statistics?.data?.total_employees || 0,
      color: 'primary',
      icon: <PersonIcon />,
    },
    {
      title: 'Active Employees',
      value: statistics?.data?.active_employees || 0,
      color: 'success',
      icon: <PersonIcon />,
    },
    {
      title: 'Inactive Employees',
      value: statistics?.data?.inactive_employees || 0,
      color: 'warning',
      icon: <PersonIcon />,
    },
    {
      title: 'Terminated Employees',
      value: statistics?.data?.terminated_employees || 0,
      color: 'error',
      icon: <PersonIcon />,
    },
  ], [statistics]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns: TableColumn<Employee>[] = useMemo(() => [
    {
      id: 'employee_id',
      label: 'Employee',
      render: (_value, employee) => {
        if (!employee) return <Typography variant="body2">No data</Typography>;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: 'primary.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}>
              <PersonIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="600">
                {employee.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {employee.employee_id || 'No Employee ID'}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'contact',
      label: 'Contact',
      render: (_value, employee) => {
        if (!employee) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="500">
                {employee.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="500">
                {employee.phone}
              </Typography>
            </Box>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'position',
      label: 'Position / Department',
      render: (_value, employee) => {
        if (!employee) return <Typography variant="body2">No data</Typography>;
        return (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {employee.position}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {employee.department || 'No Department'}
            </Typography>
          </Box>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, employee) => {
        if (!employee) return <Typography variant="body2">No data</Typography>;
        return (
          <StatusChip 
            status={employee.status} 
            statusType="status"
            size="small"
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_value, employee) => {
        if (!employee) return <Typography variant="body2">No data</Typography>;
        return (
          <Typography variant="body2" color="textSecondary">
            {employee.created_at ? formatDate(employee.created_at, 'display') : 'N/A'}
          </Typography>
        );
      },
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_value, employee) => {
        if (!employee) return <Typography variant="body2">No data</Typography>;
        
        const isDeleted = employee.is_deleted;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/employees/${employee.id}`)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            
            {/* Show different actions based on deleted status */}
            {!isDeleted ? (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/employees/${employee.id}/edit`)}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteEmployee(employee)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore">
                <IconButton
                  size="small"
                  onClick={() => handleRestoreEmployee(employee)}
                  color="success"
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ], [isMobile, navigate]);

  // ========================================================================
  // MOBILE CARD ACTIONS
  // ========================================================================

  const createMobileCardActions = (employee: Employee): MobileCardAction[] => {
    const isDeleted = employee.is_deleted;
    
    const baseActions: MobileCardAction[] = [
      {
        icon: <ViewIcon />,
        tooltip: 'View Details',
        color: 'primary' as const,
        onClick: () => navigate(`/employees/${employee.id}`),
      },
    ];
    
    if (!isDeleted) {
      baseActions.push(
        {
          icon: <EditIcon />,
          tooltip: 'Edit',
          color: 'secondary' as const,
          onClick: () => navigate(`/employees/${employee.id}/edit`),
        },
        {
          icon: <DeleteIcon />,
          tooltip: 'Delete',
          color: 'error' as const,
          onClick: () => handleDeleteEmployee(employee),
        }
      );
    } else {
      baseActions.push({
        icon: <RestoreIcon />,
        tooltip: 'Restore',
        color: 'success' as const,
        onClick: () => handleRestoreEmployee(employee),
      });
    }
    
    return baseActions;
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleAddEmployee = () => {
    navigate('/employees/create');
  };

  // Delete employee handler
  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    
    try {
      await deleteEmployeeMutation.mutateAsync(employeeToDelete.id.toString());
      showSuccess(`${employeeToDelete.name} deleted successfully!`, true);
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    } catch (error: any) {
      showError(error.message || 'Failed to delete employee. Please try again.', true);
    }
  };

  // Restore employee handler
  const handleRestoreEmployee = (employee: Employee) => {
    setEmployeeToRestore(employee);
    setRestoreConfirmOpen(true);
  };

  // Confirm restore
  const confirmRestore = async () => {
    if (!employeeToRestore) return;
    
    try {
      await restoreEmployeeMutation.mutateAsync(employeeToRestore.id.toString());
      showSuccess(`${employeeToRestore.name} restored successfully!`, true);
      setRestoreConfirmOpen(false);
      setEmployeeToRestore(null);
    } catch (error: any) {
      showError(error.message || 'Failed to restore employee. Please try again.', true);
    }
  };

  // Custom filter change handler that handles search input specially
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'searchTerm') {
      // Use manual search for search input
      handleInputChange(value);
    } else {
      // Use regular filter for other inputs
      setFilter(key as keyof EmployeeFilters, value);
    }
  };

  // Clear all filters function
  const handleClearFilters = () => {
    // Clear search
    clearSearch();
    
    // Reset all filters to default values
    setFilter('statusFilter', 'all');
    setFilter('positionFilter', 'all');
    setFilter('departmentFilter', 'all');
    
    // Reset to first page
    handleChangePage({} as any, 0);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Error state - show inline error instead of full page error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="Employees"
          subtitle="Manage employee records"
          actionButton={{
            text: "Refresh",
            icon: <AddIcon />,
            onClick: () => window.location.reload()
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Employees"
            message={error.message}
            onRetry={() => window.location.reload()}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={PAGE_CONFIG.title}
        breadcrumbs="Dashboard / Employee Management"
        subtitle={PAGE_CONFIG.description}
        actionButton={{
          text: PAGE_CONFIG.createButtonText,
          icon: <AddIcon />,
          onClick: handleAddEmployee
        }}
      />
      
      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={{
          ...filters,
          searchTerm: searchValue, // Use current search value for immediate UI feedback
        }}
        onFilterChange={handleFilterChange}
        fields={filterFields}
        searchHelperText={undefined}
        onSearchKeyPress={handleKeyPress}
        onSearchClick={triggerSearch}
        showSearchButton={true}
        onClearFilters={handleClearFilters}
        showClearButton={true}
      />

      {/* Tabs for Active/Deleted Employees */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Active Employees" />
          <Tab label="Deleted Employees" />
        </Tabs>
      </Box>

      {/* Mobile Card Layout */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            // Loading skeleton cards for mobile
            Array.from({ length: rowsPerPage }).map((_, index) => (
              <MobileCard
                key={`skeleton-${index}`}
                title=""
                loading={true}
                showRowNumber={true}
              />
            ))
          ) : filteredEmployees.length > 0 ? (
            paginatedEmployees.map((employee, index) => (
              <MobileCard
                key={employee.id}
                title={employee.name}
                subtitle={employee.email}
                rowNumber={(page * rowsPerPage) + index + 1}
                showRowNumber={true}
                description={`${employee.position} • ${employee.department || 'No Department'}`}
                avatar={<PersonIcon />}
                avatarColor="primary.main"
                status={{
                  label: employee.status_label,
                  color: employee.status === 'active' ? 'success' : employee.status === 'inactive' ? 'warning' : 'error',
                }}
                chips={[
                  {
                    label: employee.employee_id || 'No Employee ID',
                    color: 'primary',
                  },
                  {
                    label: employee.position,
                    color: 'secondary',
                  },
                ]}
                actions={createMobileCardActions(employee)}
                onClick={() => navigate(`/employees/${employee.id}`)}
                clickable={true}
              />
            ))
          ) : (
            <PageEmptyState
              title="No Employees Found"
              message={searchTerm || filters.statusFilter !== 'all' || filters.positionFilter !== 'all' || filters.departmentFilter !== 'all'
                ? "No employees match your current filters. Try adjusting your search criteria."
                : "No employees have been created yet."
              }
            />
          )}
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={pagination?.total || 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showResultsInfo={true}
          />
        </Box>
      ) : (
        /* Desktop Table Layout */
        filteredEmployees.length === 0 && !isLoading ? (
          <PageEmptyState
            title="No Employees Found"
            message={searchTerm || filters.statusFilter !== 'all' || filters.positionFilter !== 'all' || filters.departmentFilter !== 'all'
              ? "No employees match your current filters. Try adjusting your search criteria."
              : "No employees have been created yet."
            }
          />
        ) : (
        <StandardTable
          columns={columns}
          data={paginatedEmployees}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          getRowKey={(employee) => employee.id}
          loading={isLoading}
          showRowNumbers={true}
          rowNumberLabel="No."
        />
        )
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={employeeToDelete?.name}
        itemType="employee"
        isLoading={deleteEmployeeMutation.isPending}
        error={deleteEmployeeMutation.error?.message}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmationDialog
        open={restoreConfirmOpen}
        onClose={() => {
          setRestoreConfirmOpen(false);
          setEmployeeToRestore(null);
        }}
        onConfirm={confirmRestore}
        itemName={employeeToRestore?.name}
        itemType="employee"
        action="restore"
        isLoading={restoreEmployeeMutation.isPending}
        error={restoreEmployeeMutation.error?.message}
      />
    </Box>
  );
};

export default EmployeeListPage;