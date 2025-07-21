import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  Avatar,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  lastLogin: string;
  createdAt: string;
  phone?: string;
  department?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    avatar: 'JD',
    lastLogin: '2024-01-15 10:30',
    createdAt: '2023-06-15',
    phone: '+1 (555) 123-4567',
    department: 'IT'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    avatar: 'JS',
    lastLogin: '2024-01-14 15:45',
    createdAt: '2023-08-20',
    phone: '+1 (555) 234-5678',
    department: 'Marketing'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Manager',
    status: 'inactive',
    avatar: 'MJ',
    lastLogin: '2024-01-10 09:15',
    createdAt: '2023-09-10',
    phone: '+1 (555) 345-6789',
    department: 'Sales'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'User',
    status: 'pending',
    avatar: 'SW',
    lastLogin: 'Never',
    createdAt: '2024-01-12',
    phone: '+1 (555) 456-7890',
    department: 'HR'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'User',
    status: 'active',
    avatar: 'DB',
    lastLogin: '2024-01-13 14:20',
    createdAt: '2023-11-05',
    phone: '+1 (555) 567-8901',
    department: 'Finance'
  }
];

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const handleEditUser = (userId: number) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDeleteUser = (user: User) => {
    // Handle delete user logic
    console.log('Delete user:', user);
  };

  const handleAddUser = () => {
    navigate('/users/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'primary';
      case 'Manager':
        return 'secondary';
      case 'User':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusCount = (status: string) => {
    return mockUsers.filter(user => user.status === status).length;
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="User Management"
        breadcrumbs="Dashboard / Users"
        subtitle="Manage system users, roles, and permissions"
        actionButton={{
          text: 'Add User',
          icon: <AddIcon />,
          onClick: handleAddUser
        }}
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {mockUsers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" color="success.main">
                {getStatusCount('active')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive Users
              </Typography>
              <Typography variant="h4" color="error.main">
                {getStatusCount('inactive')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Users
              </Typography>
              <Typography variant="h4" color="warning.main">
                {getStatusCount('pending')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: 180, sm: 300 }, flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: { xs: 120, sm: 150 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: { xs: 120, sm: 150 } }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setRoleFilter('all');
            }}
            sx={{ minWidth: { xs: 100, sm: 'auto' } }}
          >
            Reset
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ minWidth: { xs: 100, sm: 'auto' } }}
          >
            Export
          </Button>
        </Box>
      </Paper>

      {/* Responsive User List/Table */}
      {isMobile ? (
        <Grid container spacing={2}>
          {filteredUsers
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((user) => (
              <Grid item xs={12} key={user.id}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: user.status === 'active' ? '#4caf50' : 
                                          user.status === 'inactive' ? '#f44336' : '#ff9800'
                        }}
                      />
                    }
                  >
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {user.avatar}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.email}
                    </Typography>
                    {user.phone && (
                      <Typography variant="caption" color="textSecondary">
                        {user.phone}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Tooltip title="View User">
                      <IconButton
                        size="small"
                        onClick={() => handleViewUser(user.id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user.id)}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          <Grid item xs={12}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Department</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Last Login</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow hover key={user.id}>
                      <TableCell>
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
                                  backgroundColor: user.status === 'active' ? '#4caf50' : 
                                                  user.status === 'inactive' ? '#f44336' : '#ff9800'
                                }}
                              />
                            }
                          >
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {user.avatar}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {user.email}
                            </Typography>
                            {user.phone && (
                              <Typography variant="caption" color="textSecondary">
                                {user.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2">
                          {user.department || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" color="textSecondary">
                          {user.lastLogin}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" color="textSecondary">
                          {user.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View User">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUser(user.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(user.id)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUser(user)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default UserListPage; 