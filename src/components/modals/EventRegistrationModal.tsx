import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { EventRegistrationUser, EventRegistrationModalData, PaginationInfo } from '../../types/eventRegistration';
import { formatDate } from '../../constants/dateFormats';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

interface EventRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  data: EventRegistrationModalData | null;
  loading: boolean;
  error: Error | null;
  currentPage: number;
  perPage: number;
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  open,
  onClose,
  data,
  loading,
  error,
  currentPage,
  perPage,
  pagination,
  onPageChange,
  onPerPageChange,
}) => {
  const getMemberLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'default';
      case 'silver': return 'secondary';
      case 'gold': return 'warning';
      case 'platinum': return 'primary';
      default: return 'default';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    return userType === 'company' ? <BusinessIcon /> : <PersonIcon />;
  };

  const getUserDisplayName = (user: EventRegistrationUser) => {
    return user.name || user.email.split('@')[0] || 'Unknown User';
  };

  // Export handlers
  const handleExportExcel = () => {
    if (data) {
      exportToExcel(data);
    }
  };

  const handleExportPDF = () => {
    if (data) {
      exportToPDF(data);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GroupIcon color="primary" />
            <Box>
              <Typography variant="h6" component="div">
                Event Registrations
              </Typography>
              {data && (
                <Typography variant="body2" color="text.secondary">
                  {data.event.name_en} ({data.event.name_mm})
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'Failed to load registration data'}
          </Alert>
        )}

        {data && !loading && (
          <Box>
            {/* Event Summary */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Registrations: {pagination?.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacity: {data.event.user_capacity || 'Unlimited'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExcelIcon />}
                  onClick={handleExportExcel}
                  sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  Excel
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PdfIcon />}
                  onClick={handleExportPDF}
                  sx={{ minWidth: 'auto', px: 1.5 }}
                >
                  PDF
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Registered Users Table */}
            <Typography variant="h6" gutterBottom>
              Registered Users
            </Typography>
            
            {data.registered_users.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No users have registered for this event yet.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Member Level</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Registration Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.registered_users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {getUserDisplayName(user).charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {getUserDisplayName(user)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getUserTypeIcon(user.user_type)}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {user.user_type}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.member_level}
                            color={getMemberLevelColor(user.member_level)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                          {user.phone && (
                            <Typography variant="body2" color="text.secondary">
                              {user.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.registered_at, 'display')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 2,
                px: 1
              }}>
                {/* Page Info */}
                <Typography variant="body2" color="text.secondary">
                  Showing {pagination.from}-{pagination.to} of {pagination.total} users
                </Typography>
                
                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Page Size Selector */}
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <InputLabel>Per page</InputLabel>
                    <Select
                      value={perPage}
                      label="Per page"
                      onChange={(e) => onPerPageChange(Number(e.target.value))}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Pagination */}
                  <Pagination
                    count={pagination.last_page}
                    page={currentPage}
                    onChange={(_, page) => onPageChange(page)}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventRegistrationModal;
