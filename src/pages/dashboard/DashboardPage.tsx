import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';

const DashboardPage: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: <PeopleIcon />,
      color: 'primary.main',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Sessions',
      value: '567',
      icon: <TrendingUpIcon />,
      color: 'success.main',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'System Status',
      value: 'Online',
      icon: <AssessmentIcon />,
      color: 'success.main',
      change: '100%',
      changeType: 'positive'
    },
    {
      title: 'Notifications',
      value: '23',
      icon: <NotificationsIcon />,
      color: 'warning.main',
      change: '+5',
      changeType: 'neutral'
    }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Created new account', time: '2 minutes ago', status: 'success' },
    { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '5 minutes ago', status: 'info' },
    { id: 3, user: 'Mike Johnson', action: 'Deleted account', time: '10 minutes ago', status: 'error' },
    { id: 4, user: 'Sarah Wilson', action: 'Changed password', time: '15 minutes ago', status: 'warning' }
  ];

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Dashboard"
        breadcrumbs="Dashboard"
      />

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Chip
                    label={stat.change}
                    size="small"
                    color={stat.changeType === 'positive' ? 'success' : 'default'}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Quick Stats */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Stats
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                1,234
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                567
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Sessions
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                89
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New Users Today
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                23
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approvals
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Recent Activities */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          <List sx={{ p: 0 }}>
            {recentActivities.map((activity) => (
              <ListItem key={activity.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: activity.status === 'success' ? 'success.main' :
                             activity.status === 'error' ? 'error.main' :
                             activity.status === 'warning' ? 'warning.main' : 'info.main',
                    width: 32,
                    height: 32
                  }}>
                    {activity.user.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={activity.action}
                  secondary={`${activity.user} • ${activity.time}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage; 