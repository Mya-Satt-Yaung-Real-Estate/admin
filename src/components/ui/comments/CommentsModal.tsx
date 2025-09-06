import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, Avatar, ListItem, ListItemAvatar, ListItemText, Button, CircularProgress, Alert, Chip, Divider, Tooltip, Collapse } from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, Person as PersonIcon, Schedule as ScheduleIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { formatDate } from '../../../constants/dateFormats';
import { useAlertSystem } from '../../../hooks/useAlertSystem';
import { DeleteConfirmationDialog, ActionAlert } from '../index';
import { useDeleteComment, usePropertyComments } from '../../../services/queries/comments';
import { Comment } from '../../../services/api/comments';

// ============================================================================
// TYPES
// ============================================================================

interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  propertyId: number;
  canDelete?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: (comment: Comment) => void;
  isReply?: boolean;
}

// ============================================================================
// COMMENT ITEM COMPONENT
// ============================================================================

const CommentItem: React.FC<CommentItemProps> = ({ comment, canDelete, onDelete, isReply = false }) => {
  const [repliesExpanded, setRepliesExpanded] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleToggleReplies = () => {
    setRepliesExpanded(!repliesExpanded);
  };

  return (
    <Box sx={{ ml: isReply ? 3 : 0 }}>
      <ListItem
        sx={{
          px: 3,
          py: 2,
          backgroundColor: isReply ? 'grey.50' : 'transparent',
          borderLeft: isReply ? '3px solid' : 'none',
          borderLeftColor: isReply ? 'primary.main' : 'transparent',
          '&:hover': {
            backgroundColor: isReply ? 'grey.100' : 'action.hover',
          },
        }}
        secondaryAction={
          canDelete && (
            <Tooltip title="Delete Comment">
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDelete(comment)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )
        }
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: isReply ? 'secondary.main' : 'primary.main' }}>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {comment.user.name}
              </Typography>
              {isReply && (
                <Chip
                  label="Reply"
                  size="small"
                  color="secondary"
                  sx={{ height: '20px', fontSize: '0.7rem' }}
                />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {comment.comment}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="textSecondary">
                  {formatDate(comment.created_at, 'display')}
                </Typography>
                {comment.updated_at !== comment.created_at && (
                  <>
                    <Typography variant="caption" color="textSecondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Edited {formatDate(comment.updated_at, 'display')}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          }
        />
      </ListItem>

      {/* Replies Section */}
      {hasReplies && (
        <Box sx={{ ml: 2 }}>
          <Button
            onClick={handleToggleReplies}
            startIcon={repliesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size="small"
            sx={{ 
              mb: 1, 
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            {repliesExpanded ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>
          
          <Collapse in={repliesExpanded}>
            <Box sx={{ ml: 1 }}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  canDelete={canDelete}
                  onDelete={onDelete}
                  isReply={true}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CommentsModal: React.FC<CommentsModalProps> = ({
  open,
  onClose,
  title,
  propertyId,
  canDelete = false,
}) => {
  const { alert, showSuccess, showError, clearAlert } = useAlertSystem();
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  // React Query hooks
  const { data: commentsResponse, isLoading, error, refetch } = usePropertyComments(
    propertyId,
    { page: currentPage, per_page: 20 },
    open // Only fetch when modal is open
  );

  // Extract data safely
  const comments = commentsResponse?.data?.comments || [];
  const pagination = commentsResponse?.data?.pagination;
  
  // Calculate total comments including replies
  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  // Delete mutation
  const deleteCommentMutation = useDeleteComment();

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    if (open && propertyId) {
      setCurrentPage(1);
    }
  }, [open, propertyId]);

  // ========================================================================
  // FUNCTIONS
  // ========================================================================

  const handleLoadMore = () => {
    if (pagination?.has_more_pages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    setCommentToDelete(comment);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      await deleteCommentMutation.mutateAsync(commentToDelete.id);
      showSuccess('Comment deleted successfully');
      
      // Refetch comments to get updated data
      refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete comment');
    } finally {
      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleClose = () => {
    setCurrentPage(1);
    onClose();
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '80vh',
            minHeight: '400px',
            width: '90vw',
            maxWidth: '1200px',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {totalComments} total comments ({comments.length} main comments + {totalComments - comments.length} replies)
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {isLoading && comments.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{(error as any)?.message || 'Failed to load comments'}</Alert>
            </Box>
          ) : comments.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No comments found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 0 }}>
              {comments.map((comment, index) => (
                <React.Fragment key={comment.id}>
                  <CommentItem
                    comment={comment}
                    canDelete={canDelete}
                    onDelete={handleDeleteComment}
                  />
                  {index < comments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
            {pagination && pagination.total > 0 && (
              <Typography variant="body2" color="textSecondary">
                Showing {pagination.from}-{pagination.to} of {pagination.total} comments
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {pagination?.has_more_pages && (
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outlined"
                size="small"
              >
                {isLoading ? <CircularProgress size={16} /> : 'Load More'}
              </Button>
            )}
            <Button onClick={handleClose} variant="contained">
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        itemName={`comment by ${commentToDelete?.user?.name}`}
        itemType="comment"
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />
    </>
  );
};
