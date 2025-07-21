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

interface Permission {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const mockPermissions: Permission[] = [
  { id: 1, name: 'manage users', description: 'Can manage users', createdAt: '2023-01-01' },
  { id: 2, name: 'manage roles', description: 'Can manage roles', createdAt: '2023-03-12' },
  { id: 3, name: 'edit content', description: 'Can edit content', createdAt: '2023-05-20' },
];

const PermissionListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPermissions = mockPermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewPermission = (permissionId: number) => {
    navigate(`/permissions/${permissionId}`);
  };

  const handleEditPermission = (permissionId: number) => {
    navigate(`/permissions/${permissionId}/edit`);
  };

  const handleDeletePermission = (permission: Permission) => {
    // Handle delete permission logic
    console.log('Delete permission:', permission);
  };

  const handleAddPermission = () => {
    navigate('/permissions/create');
  };

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Permission Management"
        breadcrumbs="Dashboard / Admin Management / Permissions"
        subtitle="Manage permissions"
        actionButton={{
          text: 'Add Permission',
          icon: <AddIcon />,
          onClick: handleAddPermission
        }}
      />
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search permissions by name..."
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
          {filteredPermissions
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((permission) => (
              <Grid item xs={12} key={permission.id}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                      {permission.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Permission">
                        <IconButton size="small" onClick={() => handleViewPermission(permission.id)} color="primary">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Permission">
                        <IconButton size="small" onClick={() => handleEditPermission(permission.id)} color="secondary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Permission">
                        <IconButton size="small" onClick={() => handleDeletePermission(permission)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {permission.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Created: {permission.createdAt}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          <Grid item xs={12}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPermissions.length}
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
                  <TableCell>Permission</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPermissions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((permission) => (
                    <TableRow hover key={permission.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="600">
                          {permission.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{permission.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {permission.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Permission">
                            <IconButton
                              size="small"
                              onClick={() => handleViewPermission(permission.id)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Permission">
                            <IconButton
                              size="small"
                              onClick={() => handleEditPermission(permission.id)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Permission">
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePermission(permission)}
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
            count={filteredPermissions.length}
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

export default PermissionListPage; 