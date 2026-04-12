import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { formatDate } from '../../../constants/dateFormats';
import { usePropertyViewInteractions } from '../../../services/queries/propertyViewInteractions';
import type { PropertyViewInteraction } from '../../../services/api/propertyViewInteractions';

const ANONYMOUS_TAB_LABEL = 'Anonymous user (without login)';

type AudienceTab = 'user' | 'anonymous';

function truncateUa(ua: string, maxLen: number = 48): string {
  if (!ua || ua.length <= maxLen) return ua;
  return `${ua.slice(0, maxLen)}…`;
}

export interface PropertyViewsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  propertyId: number;
}

export const PropertyViewsModal: React.FC<PropertyViewsModalProps> = ({
  open,
  onClose,
  title,
  propertyId,
}) => {
  const [audienceTab, setAudienceTab] = useState<AudienceTab>('user');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: response, isLoading, error } = usePropertyViewInteractions(
    propertyId,
    { page: currentPage, per_page: 20, audience: audienceTab },
    open
  );

  const rows: PropertyViewInteraction[] = Array.isArray(response?.data) ? response.data : [];
  const pagination = response?.pagination;

  useEffect(() => {
    if (open && propertyId) {
      setAudienceTab('user');
      setCurrentPage(1);
    }
  }, [open, propertyId]);

  const handleTabChange = (_event: React.SyntheticEvent, value: string) => {
    if (value === 'user' || value === 'anonymous') {
      setAudienceTab(value);
      setCurrentPage(1);
    }
  };

  const handleLoadMore = () => {
    if (pagination?.has_more_pages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    setAudienceTab('user');
    setCurrentPage(1);
    onClose();
  };

  const emptyMessage =
    audienceTab === 'user' ? 'No logged-in user views yet' : 'No anonymous views yet';

  const rowNumber = (index: number) => {
    const perPage = pagination?.per_page ?? 20;
    const from = pagination?.from;
    if (typeof from === 'number') {
      return from + index;
    }
    return (currentPage - 1) * perPage + index + 1;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '92vh',
          minHeight: '440px',
          width: '98vw',
          maxWidth: '1280px',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {pagination?.total ?? rows.length} deduplicated view{pagination?.total === 1 ? '' : 's'} (IP + browser)
            {audienceTab === 'user' ? ' · logged-in users' : ' · anonymous'}
          </Typography>
        </Box>
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Tabs
          value={audienceTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="user" label="Users" />
          <Tab value="anonymous" label={ANONYMOUS_TAB_LABEL} />
        </Tabs>

        {isLoading && rows.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{(error as Error)?.message || 'Failed to load views'}</Alert>
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {emptyMessage}
            </Typography>
          </Box>
        ) : audienceTab === 'user' ? (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '58vh', mx: 2, my: 1 }}>
            <Table size="small" stickyHeader sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, bgcolor: 'background.paper', width: 56 }}
                  >
                    No.
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>IP address</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>User agent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell align="center" sx={{ verticalAlign: 'top', color: 'text.secondary' }}>
                      {rowNumber(index)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      {row.created_at ? formatDate(row.created_at, 'display') : '—'}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', fontWeight: 500 }}>{row.user_name || '—'}</TableCell>
                    <TableCell sx={{ verticalAlign: 'top', maxWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                        {row.user_email || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {row.ip_address || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', maxWidth: 260 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: 'break-all' }}
                        title={row.user_agent || undefined}
                      >
                        {truncateUa(row.user_agent || '')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '58vh', mx: 2, my: 1 }}>
            <Table size="small" stickyHeader sx={{ minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, bgcolor: 'background.paper', width: 56 }}
                  >
                    No.
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>IP address</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>User agent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell align="center" sx={{ verticalAlign: 'top', color: 'text.secondary' }}>
                      {rowNumber(index)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      {row.created_at ? formatDate(row.created_at, 'display') : '—'}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {row.ip_address || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top', maxWidth: 400 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: 'break-all' }}
                        title={row.user_agent || undefined}
                      >
                        {truncateUa(row.user_agent || '', 96)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          {pagination && pagination.total > 0 && (
            <Typography variant="body2" color="textSecondary">
              Showing {pagination.from}-{pagination.to} of {pagination.total}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {pagination?.has_more_pages && (
            <Button onClick={handleLoadMore} disabled={isLoading} variant="outlined" size="small">
              {isLoading ? <CircularProgress size={16} /> : 'Load more'}
            </Button>
          )}
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
