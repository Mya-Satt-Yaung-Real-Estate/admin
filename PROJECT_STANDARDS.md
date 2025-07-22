# 🎯 Project Standards & Guidelines

This document outlines the standardized patterns, constants, and utilities used throughout the project to ensure consistency, maintainability, and clean code.

## 📋 Table of Contents

1. [Constants](#constants)
2. [Hooks](#hooks)
3. [Components](#components)
4. [Utilities](#utilities)
5. [Data Handling](#data-handling)
6. [Pagination](#pagination)
7. [Filtering](#filtering)
8. [Status Management](#status-management)
9. [Date Handling](#date-handling)
10. [Code Patterns](#code-patterns)

## 🏗️ Constants

### Pagination Constants
```typescript
// src/constants/pagination.ts
export const PAGINATION_OPTIONS = [5, 10, 25, 50];
export const DEFAULT_ROWS_PER_PAGE = 10;
export const DEFAULT_PAGE = 0;
```

### Filter Constants
```typescript
// src/constants/filters.ts
export const STATUS_OPTIONS = {
  all: 'all',
  active: 'active',
  inactive: 'inactive',
};

export const DEFAULT_FILTERS = {
  searchTerm: '',
  statusFilter: STATUS_OPTIONS.all,
};
```

### Status Constants
```typescript
// src/constants/status.ts
export const STATUS_VALUES = {
  active: 'active',
  inactive: 'inactive',
  pending: 'pending',
  draft: 'draft',
  published: 'published',
  archived: 'archived',
};
```

### Date Format Constants
```typescript
// src/constants/dateFormats.ts
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  input: 'yyyy-MM-dd',
  api: 'yyyy-MM-dd',
};
```

## 🪝 Hooks

### usePagination Hook
Standardized pagination handling across all list components.

```typescript
import { usePagination } from '../hooks/usePagination';

const MyListPage = () => {
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPagination,
  } = usePagination();

  // Use in component...
};
```

### useFilters Hook
Standardized filtering across all list components.

```typescript
import { useFilters } from '../hooks/useFilters';

const MyListPage = () => {
  const {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    clearSearch,
  } = useFilters();

  // Use in component...
};
```

## 🧩 Components

### StandardTable Component
Reusable table component with built-in pagination and responsive design.

```typescript
import { StandardTable, TableColumn } from '../components/common/StandardTable';

const columns: TableColumn<MyType>[] = [
  {
    id: 'name',
    label: 'Name',
    render: (value, row) => <CustomCell value={value} />,
  },
  // ... more columns
];

<StandardTable
  columns={columns}
  data={filteredData}
  page={page}
  rowsPerPage={rowsPerPage}
  totalCount={totalCount}
  onPageChange={handleChangePage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  onRowClick={handleRowClick}
/>
```

### StandardFilters Component
Reusable filters component with consistent styling and behavior.

```typescript
import { StandardFilters, FilterField } from '../components/common/StandardFilters';

const filterFields: FilterField[] = [
  {
    key: 'searchTerm',
    type: 'search',
    placeholder: 'Search items...',
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

<StandardFilters
  filters={filters}
  onFilterChange={setFilter}
  fields={filterFields}
/>
```

### StatisticsCards Component
Standardized statistics cards for dashboard and overview pages.

```typescript
import { StatisticsCards, StatCard } from '../components/common/StatisticsCards';

const statsCards: StatCard[] = [
  {
    title: 'Total Items',
    value: totalCount,
    color: 'primary',
    icon: <SomeIcon />,
  },
  // ... more cards
];

<StatisticsCards cards={statsCards} />
```

## 🛠️ Utilities

### Status Utilities
```typescript
import { getStatusColor, getStatusLabel, getStatusCount } from '../constants/status';

// Get color for status chip
const color = getStatusColor('active'); // 'success'

// Get human-readable label
const label = getStatusLabel('active'); // 'Active'

// Count items by status
const activeCount = getStatusCount(items, 'active');
```

### Date Utilities
```typescript
import { formatDate, formatRelativeTime } from '../constants/dateFormats';

// Format date for display
const displayDate = formatDate('2024-01-15', 'display'); // 'Jan 15, 2024'

// Format relative time
const relativeTime = formatRelativeTime('2024-01-15T10:30:00Z'); // '2 hours ago'
```

## 📊 Data Handling

### Standard Data Structure
All data types follow consistent patterns:

```typescript
interface BaseEntity {
  id: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

interface Admin extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  lastLogin?: string;
  avatar?: string;
}
```

### Mock Data Organization
```typescript
// src/data/mockAdmins.ts
export const mockAdmins: Admin[] = [
  // ... data
];

// Helper functions
export const getAdminById = (id: number) => mockAdmins.find(admin => admin.id === id);
export const getActiveAdmins = () => mockAdmins.filter(admin => admin.status === 'active');
```

## 📄 Pagination

### Standard Pagination Pattern
All list pages use the same pagination pattern:

```typescript
const MyListPage = () => {
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination();

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <StandardTable
      data={paginatedData}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={data.length}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};
```

## 🔍 Filtering

### Standard Filtering Pattern
All list pages use consistent filtering:

```typescript
const MyListPage = () => {
  const { filters, setFilter } = useFilters();

  const filteredData = useMemo(() => {
    return filterItems(data, filters.searchTerm, filters.statusFilter);
  }, [data, filters]);

  const filterFields = [
    {
      key: 'searchTerm',
      type: 'search' as const,
      placeholder: 'Search items...',
    },
    {
      key: 'statusFilter',
      type: 'select' as const,
      label: 'Status',
      options: FILTER_CONFIG.statusOptions,
    },
  ];

  return (
    <>
      <StandardFilters
        filters={filters}
        onFilterChange={setFilter}
        fields={filterFields}
      />
      <StandardTable data={filteredData} />
    </>
  );
};
```

## 🏷️ Status Management

### Status Configuration
All status values are centrally configured:

```typescript
export const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'success',
    icon: 'check_circle',
  },
  inactive: {
    label: 'Inactive',
    color: 'error',
    icon: 'cancel',
  },
  // ... more statuses
};
```

### Status Usage
```typescript
// In components
<Chip
  label={getStatusLabel(item.status)}
  color={getStatusColor(item.status)}
  size="small"
/>
```

## 📅 Date Handling

### Date Formatting
Consistent date formatting across the application:

```typescript
// Display formats
formatDate(date, 'display'); // 'Jan 15, 2024'
formatDate(date, 'displayWithTime'); // 'Jan 15, 2024 10:30 AM'

// Relative time
formatRelativeTime(date); // '2 hours ago'
```

## 💻 Code Patterns

### Standard Page Structure
All pages follow this structure:

```typescript
const MyPage = () => {
  // 1. Hooks
  const navigate = useNavigate();
  const { filters, setFilter } = useFilters();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // 2. State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 3. Computed values
  const filteredData = useMemo(() => {
    return filterData(data, filters);
  }, [data, filters]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // 4. Event handlers
  const handleAdd = () => navigate('/add');
  const handleEdit = (id: number) => navigate(`/edit/${id}`);
  const handleDelete = (item: any) => { /* delete logic */ };

  // 5. Render
  return (
    <Box>
      <PageHeader title="My Page" />
      <StatisticsCards cards={statsCards} />
      <StandardFilters filters={filters} onFilterChange={setFilter} fields={filterFields} />
      <StandardTable
        data={paginatedData}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredData.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};
```

### Standard Form Structure
All forms follow this pattern:

```typescript
const MyForm = () => {
  // 1. State
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // validation logic
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    // submit logic
  };

  // 3. Render
  return (
    <Paper>
      <Grid container spacing={3}>
        {/* Form fields */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
```

## 🎨 Benefits of Standardization

1. **Consistency**: All components follow the same patterns
2. **Maintainability**: Changes in one place affect the entire application
3. **Reusability**: Components can be easily reused across different pages
4. **Type Safety**: Strong TypeScript integration throughout
5. **Performance**: Optimized patterns for better performance
6. **Developer Experience**: Familiar patterns make development faster
7. **Testing**: Standardized structure makes testing easier

## 📝 Best Practices

1. **Always use the standard hooks** for pagination and filtering
2. **Use the standard components** for tables, filters, and statistics
3. **Follow the established patterns** for page and form structure
4. **Use the centralized constants** for status, dates, and pagination
5. **Maintain type safety** with proper TypeScript interfaces
6. **Keep components focused** on a single responsibility
7. **Use consistent naming** conventions throughout the project

This standardization system ensures that the entire project maintains high code quality, consistency, and maintainability while providing an excellent developer experience. 