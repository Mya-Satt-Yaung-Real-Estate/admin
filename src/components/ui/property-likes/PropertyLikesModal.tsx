import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { formatDate } from '../../../constants/dateFormats';
import { usePropertyLikes } from '../../../services/queries/propertyLikes';
import { PropertyLikeUser } from '../../../services/api/propertyLikes';

export interface PropertyLikesModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  propertyId: number;
}

export const PropertyLikesModal: React.FC<PropertyLikesModalProps> = ({
  open,
  onClose,
  title,
  propertyId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: response, isLoading, error } = usePropertyLikes(
    propertyId,
    { page: currentPage, per_page: 20 },
    open
  );

  const users: PropertyLikeUser[] = Array.isArray(response?.data) ? response.data : [];
  const pagination = response?.pagination;

  useEffect(() => {
    if (open && propertyId) {
      setCurrentPage(1);
    }
  }, [open, propertyId]);

  const handleLoadMore = () => {
    if (pagination?.has_more_pages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    setCurrentPage(1);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
          minHeight: '360px',
          width: '90vw',
          maxWidth: '800px',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {pagination?.total ?? users.length} user{pagination?.total === 1 ? '' : 's'} liked this property
          </Typography>
        </Box>
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {isLoading && users.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{(error as Error)?.message || 'Failed to load likes'}</Alert>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No likes yet
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 0 }}>
            {users.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                  sx={{
                    px: 3,
                    py: 2,
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.name}
                        </Typography>
                        <Chip label={user.member_level} size="small" variant="outlined" />
                        <Chip label={user.user_type} size="small" color="default" />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.phone ? (
                          <Typography variant="body2" color="text.secondary">
                            {user.phone}
                          </Typography>
                        ) : null}
                        {user.last_login_at ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="textSecondary">
                              Last login {formatDate(user.last_login_at, 'display')}
                            </Typography>
                          </Box>
                        ) : null}
                      </Box>
                    }
                  />
                </ListItem>
                {index < users.length - 1 && (
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }} />
                )}
              </React.Fragment>
            ))}
          </Box>
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
