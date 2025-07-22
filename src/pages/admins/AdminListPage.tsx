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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
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
import { Admin } from '../../types/admin';
import { mockAdmins } from '../../data/mockAdmins';
import { getActiveRoles } from '../../data/mockRoles';
import {
  getStatusColor,
  getStatusCount,
  filterAdmins,
  formatLastLogin,
  getFullName,
} from '../../utils/adminUtils';

const AdminListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  // Filter admins
  const filteredAdmins = filterAdmins(mockAdmins, searchTerm, statusFilter, roleFilter);

  // Event handlers
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

  const handleDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('Deleting admin:', adminToDelete);
    setDeleteDialogOpen(false);
    setAdminToDelete(null);
  };

  const handleAddAdmin = () => {
    navigate('/admins/create');
  };

  const getRoleName = (roleId: number) => {
    const role = getActiveRoles().find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  const getInitials = (admin: Admin) => {
    return `${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}`;
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Admin Management"
        breadcrumbs="Dashboard / Admin Management"
        subtitle="Manage system administrators and their roles"
        actionButton={{
          text: 'Add Admin',
          icon: <AddIcon />,
          onClick: handleAddAdmin
        }}
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Admins
              </Typography>
              <Typography variant="h4">
                {mockAdmins.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Admins
              </Typography>
              <Typography variant="h4" color="success.main">
                {getStatusCount(mockAdmins, 'active')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive Admins
              </Typography>
              <Typography variant="h4" color="error.main">
                {getStatusCount(mockAdmins, 'inactive')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Roles
              </Typography>
              <Typography variant="h4" color="primary">
                {getActiveRoles().length}
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
            placeholder="Search admins by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { xs: 250, sm: 350 }, 
              maxWidth: { sm: 450 },
              flexGrow: 1 
            }}
          />
          <FormControl sx={{ minWidth: { xs: 200, sm: 150 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: { xs: 200, sm: 150 } }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {getActiveRoles().map((role) => (
                <MenuItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Admin List/Table */}
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
                      {admin.avatar ? (
                        <img src={admin.avatar} alt={getFullName(admin)} />
                      ) : (
                        <Typography variant="body2">{getInitials(admin)}</Typography>
                      )}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {getFullName(admin)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {admin.email}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={admin.status}
                        color={getStatusColor(admin.status)}
                        size="small"
                      />
                      <Chip
                        label={getRoleName(admin.roleId)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Last login: {formatLastLogin(admin.lastLogin)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewAdmin(admin.id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditAdmin(admin.id)}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
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
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
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
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {admin.avatar ? (
                              <img src={admin.avatar} alt={getFullName(admin)} />
                            ) : (
                              <Typography variant="body2" fontSize="0.75rem">
                                {getInitials(admin)}
                              </Typography>
                            )}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight="600">
                            {getFullName(admin)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{admin.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {getRoleName(admin.roleId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={admin.status}
                          color={getStatusColor(admin.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {formatLastLogin(admin.lastLogin)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" color="textSecondary">
                          {admin.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAdmin(admin.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditAdmin(admin.id)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete "{adminToDelete ? getFullName(adminToDelete) : ''}"? This action cannot be undone.
          </Alert>
          <Typography variant="body2" color="textSecondary">
            This will permanently remove the admin user and all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminListPage; 