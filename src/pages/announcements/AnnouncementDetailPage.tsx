import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Avatar,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnnouncement } from '../../services/queries/announcements';
import { useAlertSystem } from '../../hooks';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoadingState, PageErrorState, ActionAlert } from '../../components/ui';

const AnnouncementDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // API Queries
  const { data: announcementResponse, isLoading, error } = useAnnouncement(Number(id));

  // Alert system hook
  const { alert, clearAlert } = useAlertSystem();

  // Extract announcement data
  const announcement = announcementResponse?.data;

  // Event handlers
  const handleBack = () => {
    navigate('/announcements');
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState />;
  }

  // Error state
  if (error) {
    return (
      <Box>
        <PageHeader
          title="Announcement Details"
          subtitle="View announcement information"
          actionButton={{
            text: "Back to Announcements",
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={error}
            title="Error Loading Announcement"
            message={error.message}
            onRetry={() => window.location.reload()}
          />
        </Box>
      </Box>
    );
  }

  // No data state
  if (!announcement) {
    return (
      <Box>
        <PageHeader
          title="Announcement Details"
          subtitle="View announcement information"
          actionButton={{
            text: "Back to Announcements",
            icon: <ArrowBackIcon />,
            onClick: handleBack
          }}
        />
        <Box sx={{ mt: 2 }}>
          <PageErrorState
            error={{ message: 'Announcement not found' }}
            title="Announcement Not Found"
            message="The requested announcement could not be found."
            onRetry={handleBack}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Announcement Details"
        subtitle="View announcement information"
        breadcrumbs="Dashboard / Announcements / Details"
        actionButton={{
          text: "Back to Announcements",
          icon: <ArrowBackIcon />,
          onClick: handleBack
        }}
      />

      <ActionAlert {...alert} sx={{ mb: 2 }} onClose={clearAlert} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Title and Type */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 2, 
                mb: 2,
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <NotificationIcon sx={{ 
                  fontSize: isMobile ? 24 : 32, 
                  color: 'primary.main',
                  flexShrink: 0
                }} />
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="600" 
                    gutterBottom
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {announcement.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={announcement.announcement_type}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

        <Divider sx={{ mb: 3 }} />

            {/* Message Body */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Message Content
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {announcement.body}
                </Typography>
              </Paper>
            </Box>

        <Divider sx={{ mb: 3 }} />

            {/* Target Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Target Audience
              </Typography>
              {announcement.all_users ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <GroupIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="500">
                    All Users
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'secondary.main' }} />
                    <Typography variant="body1" fontWeight="500">
                      Specific Users ({announcement.users?.length || 0} selected)
                    </Typography>
                  </Box>
                  
                  {announcement.users && announcement.users.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Selected Users:
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1,
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}>
                        {announcement.users.map((user) => (
                          <Box
                            key={user.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: { xs: 0.75, sm: 1 },
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 1,
                              backgroundColor: 'white',
                              minWidth: { xs: '100%', sm: 'auto' },
                              maxWidth: { xs: '100%', sm: '300px' }
                            }}
                          >
                            <Avatar sx={{ 
                              width: { xs: 28, sm: 32 }, 
                              height: { xs: 28, sm: 32 }, 
                              bgcolor: 'primary.main',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight="500"
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                  wordBreak: 'break-word'
                                }}
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

    </Box>
  );
};

export default AnnouncementDetailPage;
