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
  Typography,
  InputAdornment,
  Tooltip,
  Grid,
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

interface Role {
  id: number;
  name: string;
  permissions: string[];
  createdAt: string;
}

const mockRoles: Role[] = [
  { id: 1, name: 'Super Admin', permissions: ['manage users', 'manage roles', 'manage permissions'], createdAt: '2023-01-01' },
  { id: 2, name: 'Admin', permissions: ['manage users'], createdAt: '2023-03-12' },
  { id: 3, name: 'Editor', permissions: ['edit content'], createdAt: '2023-05-20' },
];

const RoleListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewRole = (roleId: number) => {
    navigate(`/roles/${roleId}`);
  };

  const handleEditRole = (roleId: number) => {
    navigate(`/roles/${roleId}/edit`);
  };

  const handleDeleteRole = (role: Role) => {
    // Handle delete role logic
    console.log('Delete role:', role);
  };

  const handleAddRole = () => {
    navigate('/roles/create');
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Role Management"
        breadcrumbs="Dashboard / Admin Management / Roles"
        subtitle="Manage roles and their permissions"
        actionButton={{
          text: 'Add Role',
          icon: <AddIcon />,
          onClick: handleAddRole
        }}
      />
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search roles by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />
        </Box>
      </Paper>
      {isMobile ? (
        <Grid container spacing={2}>
          {filteredRoles
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((role) => (
              <Grid item xs={12} key={role.id}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                      {role.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Role">
                        <IconButton size="small" onClick={() => handleViewRole(role.id)} color="primary">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Role">
                        <IconButton size="small" onClick={() => handleEditRole(role.id)} color="secondary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Role">
                        <IconButton size="small" onClick={() => handleDeleteRole(role)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {role.permissions.map((perm) => (
                      <Chip key={perm} label={perm} size="small" />
                    ))}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Created: {role.createdAt}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          <Grid item xs={12}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRoles.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((role) => (
                    <TableRow hover key={role.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="600">
                          {role.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {role.permissions.map((perm) => (
                          <Chip key={perm} label={perm} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {role.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Role">
                            <IconButton
                              size="small"
                              onClick={() => handleViewRole(role.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              onClick={() => handleEditRole(role.id)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Role">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRole(role)}
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
            count={filteredRoles.length}
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

export default RoleListPage; 