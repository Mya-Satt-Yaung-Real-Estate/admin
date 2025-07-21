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
  IconButton,
  Chip,
  Avatar,
  Typography,
  InputAdornment,
  Tooltip,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  avatar: string;
  lastLogin: string;
  createdAt: string;
}

const mockAdmins: AdminUser[] = [
  {
    id: 1,
    name: 'Alice Admin',
    email: 'alice.admin@example.com',
    role: 'Super Admin',
    status: 'active',
    avatar: 'AA',
    lastLogin: '2024-01-15 09:00',
    createdAt: '2023-01-01',
  },
  {
    id: 2,
    name: 'Bob Manager',
    email: 'bob.manager@example.com',
    role: 'Admin',
    status: 'inactive',
    avatar: 'BM',
    lastLogin: '2024-01-10 14:30',
    createdAt: '2023-03-12',
  },
];

const AdminListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAdmins = mockAdmins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewAdmin = (adminId: number) => {
    navigate(`/admins/${adminId}`);
  };

  const handleEditAdmin = (adminId: number) => {
    navigate(`/admins/${adminId}/edit`);
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    // Handle delete admin logic
    console.log('Delete admin:', admin);
  };

  const handleAddAdmin = () => {
    navigate('/admins/create');
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Admin User Management"
        breadcrumbs="Dashboard / Admin Users"
        subtitle="Manage admin users and permissions"
        actionButton={{
          text: 'Add Admin',
          icon: <AddIcon />,
          onClick: handleAddAdmin
        }}
      />
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
            placeholder="Search admins by name or email..."
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
        </Box>
      </Paper>
      {isMobile ? (
        <Grid container spacing={2}>
          {filteredAdmins
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((admin) => (
              <Grid item xs={12} key={admin.id}>
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
                          backgroundColor: admin.status === 'active' ? '#4caf50' : '#f44336'
                        }}
                      />
                    }
                  >
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {admin.avatar}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {admin.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {admin.email}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={admin.role}
                        color={admin.role === 'Super Admin' ? 'primary' : 'secondary'}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={admin.status}
                        color={admin.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Tooltip title="View Admin">
                      <IconButton
                        size="small"
                        onClick={() => handleViewAdmin(admin.id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Admin">
                      <IconButton
                        size="small"
                        onClick={() => handleEditAdmin(admin.id)}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Admin">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAdmin(admin)}
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
              count={filteredAdmins.length}
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
                  <TableCell>Admin</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Last Login</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((admin) => (
                    <TableRow hover key={admin.id}>
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
                                  backgroundColor: admin.status === 'active' ? '#4caf50' : '#f44336'
                                }}
                              />
                            }
                          >
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {admin.avatar}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              {admin.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {admin.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={admin.role}
                          color={admin.role === 'Super Admin' ? 'primary' : 'secondary'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={admin.status}
                          color={admin.status === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" color="textSecondary">
                          {admin.lastLogin}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" color="textSecondary">
                          {admin.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Admin">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAdmin(admin.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Admin">
                            <IconButton
                              size="small"
                              onClick={() => handleEditAdmin(admin.id)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Admin">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAdmin(admin)}
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
            count={filteredAdmins.length}
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

export default AdminListPage; 