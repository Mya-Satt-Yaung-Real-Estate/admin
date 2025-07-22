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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { Region, Township } from '../../types/location';
import { mockRegions, getAllTownships } from '../../data/mockLocations';
import {
  getStatusColor,
  getStatusCount,
  filterLocations,
  getPageTitle,
  getPageSubtitle,
  getBreadcrumbs,
} from '../../utils/locationUtils';

const LocationListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Region | Township | null>(null);

  // Get all townships from all regions
  const allTownships = getAllTownships();

  // Filter data based on current view
  const getFilteredData = () => {
    if (!selectedRegion) {
      return filterLocations(mockRegions, searchTerm, statusFilter);
    } else {
      return filterLocations(selectedRegion.townships, searchTerm, statusFilter);
    }
  };

  const filteredData = getFilteredData();

  // Event handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRegionClick = (region: Region) => {
    setSelectedRegion(region);
    setPage(0);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
    setPage(0);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleEditItem = (item: Region | Township) => {
    if (!selectedRegion) {
      navigate(`/locations/regions/${item.id}/edit`);
    } else {
      navigate(`/locations/townships/${item.id}/edit`);
    }
  };

  const handleDeleteItem = (item: Region | Township) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('Deleting:', itemToDelete);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleAddItem = () => {
    if (!selectedRegion) {
      navigate('/locations/regions/create');
    } else {
      navigate('/locations/townships/create');
    }
  };

  // Statistics calculations
  const getCurrentItems = () => selectedRegion ? selectedRegion.townships : mockRegions;
  const currentItems = getCurrentItems();

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title={getPageTitle(selectedRegion)}
        breadcrumbs={getBreadcrumbs(selectedRegion)}
        subtitle={getPageSubtitle(selectedRegion)}
        actionButton={{
          text: selectedRegion ? 'Add Township' : 'Add Region',
          icon: <AddIcon />,
          onClick: handleAddItem
        }}
      />

      {/* Breadcrumb Navigation */}
      {selectedRegion && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              component="button"
              variant="body1"
              onClick={handleBackToRegions}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Regions
            </Link>
            <Typography color="text.primary">{selectedRegion.name}</Typography>
          </Breadcrumbs>
        </Paper>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total {selectedRegion ? 'Townships' : 'Regions'}
              </Typography>
              <Typography variant="h4">
                {currentItems.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active {selectedRegion ? 'Townships' : 'Regions'}
              </Typography>
              <Typography variant="h4" color="success.main">
                {getStatusCount(currentItems, 'active')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive {selectedRegion ? 'Townships' : 'Regions'}
              </Typography>
              <Typography variant="h4" color="error.main">
                {getStatusCount(currentItems, 'inactive')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {selectedRegion ? 'Region Status' : 'Total Townships'}
              </Typography>
              <Typography variant="h4" color="primary">
                {selectedRegion ? (
                  <Chip 
                    label={selectedRegion.status} 
                    color={getStatusColor(selectedRegion.status)} 
                    size="small" 
                  />
                ) : (
                  allTownships.length
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters - Show for both regions and townships views */}
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
            placeholder={`Search ${selectedRegion ? 'townships' : 'regions'} by name...`}
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
        </Box>
      </Paper>

      {/* Location List/Table */}
      {isMobile ? (
        <Grid container spacing={2}>
          {filteredData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item) => (
              <Grid item xs={12} key={item.id}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    cursor: !selectedRegion ? 'pointer' : 'default',
                    '&:hover': !selectedRegion ? {
                      backgroundColor: 'action.hover',
                      transition: 'background-color 0.2s'
                    } : {}
                  }}
                  onClick={!selectedRegion ? () => handleRegionClick(item as Region) : undefined}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: item.status === 'active' ? '#4caf50' : '#f44336'
                        }}
                      />
                    }
                  >
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      <LocationIcon />
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.name}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                      {!selectedRegion && (
                        <Chip
                          label={`${(item as Region).townships.length} townships`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item);
                        }}
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
              count={filteredData.length}
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
                  <TableCell>{selectedRegion ? 'Township' : 'Region'}</TableCell>
                  <TableCell>Status</TableCell>
                  {!selectedRegion && <TableCell>Townships Count</TableCell>}
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow 
                      hover 
                      key={item.id}
                      sx={{ 
                        cursor: !selectedRegion ? 'pointer' : 'default',
                        '&:hover': !selectedRegion ? {
                          backgroundColor: 'action.hover',
                        } : {}
                      }}
                      onClick={!selectedRegion ? () => handleRegionClick(item as Region) : undefined}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <LocationIcon />
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight="600">
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                      {!selectedRegion && (
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {(item as Region).townships.length} townships
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" color="textSecondary">
                          {item.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditItem(item);
                              }}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item);
                              }}
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
            count={filteredData.length}
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
            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
          </Alert>
          {!selectedRegion && itemToDelete && (
            <Typography variant="body2" color="textSecondary">
              This will also delete all townships in this region.
            </Typography>
          )}
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

export default LocationListPage; 