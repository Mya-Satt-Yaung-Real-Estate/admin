import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { StandardTable, TableColumn } from '../../components/common/StandardTable';
import { StandardFilters, FilterField } from '../../components/common/StandardFilters';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { getStatusColor, getStatusLabel } from '../../constants/status';
import { formatRelativeTime } from '../../constants/dateFormats';
import { FilterState } from '../../constants/filters';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Normal User' | 'Company User';
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  lastLogin: string;
  createdAt: string;
  phone?: string;
}

interface UserFilters extends FilterState {
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'JD',
    lastLogin: '2024-01-15 09:30',
    createdAt: '2023-01-15',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'JS',
    lastLogin: '2024-01-14 16:45',
    createdAt: '2023-02-20',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Normal User',
    status: 'inactive',
    avatar: 'BJ',
    lastLogin: '2024-01-10 11:20',
    createdAt: '2023-03-10',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'Company User',
    status: 'pending',
    avatar: 'AB',
    lastLogin: '2024-01-12 14:15',
    createdAt: '2023-04-05',
    phone: '+1 (555) 456-7890'
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'CW',
    lastLogin: '2024-01-13 10:30',
    createdAt: '2023-05-12',
    phone: '+1 (555) 567-8901'
  },
  {
    id: 6,
    name: 'Diana Davis',
    email: 'diana.davis@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'DD',
    lastLogin: '2024-01-14 13:45',
    createdAt: '2023-06-18',
    phone: '+1 (555) 678-9012'
  },
  {
    id: 7,
    name: 'Edward Miller',
    email: 'edward.miller@example.com',
    role: 'Normal User',
    status: 'inactive',
    avatar: 'EM',
    lastLogin: '2024-01-08 09:15',
    createdAt: '2023-07-22',
    phone: '+1 (555) 789-0123'
  },
  {
    id: 8,
    name: 'Fiona Garcia',
    email: 'fiona.garcia@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'FG',
    lastLogin: '2024-01-15 08:20',
    createdAt: '2023-08-30',
    phone: '+1 (555) 890-1234'
  },
  {
    id: 9,
    name: 'George Martinez',
    email: 'george.martinez@example.com',
    role: 'Normal User',
    status: 'pending',
    avatar: 'GM',
    lastLogin: '2024-01-11 15:40',
    createdAt: '2023-09-14',
    phone: '+1 (555) 901-2345'
  },
  {
    id: 10,
    name: 'Helen Taylor',
    email: 'helen.taylor@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'HT',
    lastLogin: '2024-01-13 12:10',
    createdAt: '2023-10-08',
    phone: '+1 (555) 012-3456'
  },
  {
    id: 11,
    name: 'Ivan Anderson',
    email: 'ivan.anderson@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'IA',
    lastLogin: '2024-01-14 17:25',
    createdAt: '2023-11-20',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 12,
    name: 'Julia Thomas',
    email: 'julia.thomas@example.com',
    role: 'Company User',
    status: 'inactive',
    avatar: 'JT',
    lastLogin: '2024-01-09 14:50',
    createdAt: '2023-12-03',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 13,
    name: 'Kevin Jackson',
    email: 'kevin.jackson@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'KJ',
    lastLogin: '2024-01-15 11:35',
    createdAt: '2023-12-15',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 14,
    name: 'Laura White',
    email: 'laura.white@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'LW',
    lastLogin: '2024-01-14 16:20',
    createdAt: '2023-12-25',
    phone: '+1 (555) 456-7890'
  },
  {
    id: 15,
    name: 'Michael Harris',
    email: 'michael.harris@example.com',
    role: 'Normal User',
    status: 'pending',
    avatar: 'MH',
    lastLogin: '2024-01-12 10:45',
    createdAt: '2024-01-02',
    phone: '+1 (555) 567-8901'
  },
  {
    id: 16,
    name: 'Nancy Clark',
    email: 'nancy.clark@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'NC',
    lastLogin: '2024-01-13 13:30',
    createdAt: '2024-01-05',
    phone: '+1 (555) 678-9012'
  },
  {
    id: 17,
    name: 'Oscar Lewis',
    email: 'oscar.lewis@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'OL',
    lastLogin: '2024-01-14 09:15',
    createdAt: '2024-01-08',
    phone: '+1 (555) 789-0123'
  },
  {
    id: 18,
    name: 'Patricia Hall',
    email: 'patricia.hall@example.com',
    role: 'Company User',
    status: 'inactive',
    avatar: 'PH',
    lastLogin: '2024-01-10 15:20',
    createdAt: '2024-01-10',
    phone: '+1 (555) 890-1234'
  },
  {
    id: 19,
    name: 'Quentin Young',
    email: 'quentin.young@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'QY',
    lastLogin: '2024-01-15 14:40',
    createdAt: '2024-01-12',
    phone: '+1 (555) 901-2345'
  },
  {
    id: 20,
    name: 'Rachel King',
    email: 'rachel.king@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'RK',
    lastLogin: '2024-01-13 11:25',
    createdAt: '2024-01-14',
    phone: '+1 (555) 012-3456'
  },
  {
    id: 21,
    name: 'Samuel Wright',
    email: 'samuel.wright@example.com',
    role: 'Normal User',
    status: 'pending',
    avatar: 'SW',
    lastLogin: '2024-01-11 16:50',
    createdAt: '2024-01-15',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 22,
    name: 'Tina Lopez',
    email: 'tina.lopez@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'TL',
    lastLogin: '2024-01-14 12:35',
    createdAt: '2024-01-16',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 23,
    name: 'Ulysses Scott',
    email: 'ulysses.scott@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'US',
    lastLogin: '2024-01-15 08:45',
    createdAt: '2024-01-17',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 24,
    name: 'Victoria Green',
    email: 'victoria.green@example.com',
    role: 'Company User',
    status: 'inactive',
    avatar: 'VG',
    lastLogin: '2024-01-09 13:15',
    createdAt: '2024-01-18',
    phone: '+1 (555) 456-7890'
  },
  {
    id: 25,
    name: 'Walter Baker',
    email: 'walter.baker@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'WB',
    lastLogin: '2024-01-14 17:30',
    createdAt: '2024-01-19',
    phone: '+1 (555) 567-8901'
  }
];

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use standardized hooks
  const { filters, setFilter } = useFilters<UserFilters>({
    statusFilter: 'all',
    roleFilter: 'all',
  });
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination();

  // Filter users using standardized logic
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(filters.searchTerm));
      const matchesStatus = filters.statusFilter === 'all' || user.status === filters.statusFilter;
      const matchesRole = filters.roleFilter === 'all' || user.role === filters.roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [filters]);

  // Paginate data
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // Statistics cards
  const statsCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Users',
      value: mockUsers.length,
      color: 'primary',
      icon: <PeopleIcon />,
    },
    {
      title: 'Active Users',
      value: mockUsers.filter(user => user.status === 'active').length,
      color: 'success',
      icon: <PeopleIcon />,
    },
    {
      title: 'Normal Users',
      value: mockUsers.filter(user => user.role === 'Normal User').length,
      color: 'info',
      icon: <PeopleIcon />,
    },
    {
      title: 'Company Users',
      value: mockUsers.filter(user => user.role === 'Company User').length,
      color: 'secondary',
      icon: <BusinessIcon />,
    },
  ], []);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'searchTerm',
      type: 'search',
      label: 'Search',
      placeholder: 'Search users by name, email, or phone...',
    },
    {
      key: 'statusFilter',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
    {
      key: 'roleFilter',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'Normal User', label: 'Normal User' },
        { value: 'Company User', label: 'Company User' },
      ],
    },
  ];

  // Table columns configuration
  const columns: TableColumn<User>[] = [
    {
      id: 'user',
      label: 'User',
      render: (_, user) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: user.status === 'active' ? '#4caf50' : '#f44336'
                }}
              />
            }
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <Typography variant="body2" fontSize="0.75rem">
                {user.avatar}
              </Typography>
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {user.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      render: (_, user) => (
        <Chip
          label={user.role}
          size="small"
          color={user.role === 'Normal User' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_, user) => (
        <Chip
          label={getStatusLabel(user.status)}
          color={getStatusColor(user.status)}
          size="small"
        />
      ),
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      render: (_, user) => (
        <Typography variant="body2" color="textSecondary">
          {formatRelativeTime(user.lastLogin)}
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (_, user) => (
        <Typography variant="body2" color="textSecondary">
          {user.createdAt}
        </Typography>
      ),
      hidden: isMobile,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, user) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${user.id}`)}
              color="primary"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/users/${user.id}/edit`)}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteUser(user)}
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
  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user);
  };

  const handleAddUser = () => {
    navigate('/users/create');
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="User Management"
        breadcrumbs="Dashboard / User Management"
        subtitle="Manage real estate users and company users"
        actionButton={{
          text: 'Add User',
          icon: <AddIcon />,
          onClick: handleAddUser
        }}
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Filters */}
      <StandardFilters
        filters={filters}
        onFilterChange={(key, value) => setFilter(key as keyof UserFilters, value)}
        fields={filterFields}
      />

      {/* User Table */}
      <StandardTable
        columns={columns}
        data={paginatedUsers}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredUsers.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        getRowKey={(user) => user.id}
      />
    </Box>
  );
};

export default UserListPage; 