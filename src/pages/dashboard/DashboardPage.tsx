import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';

const DashboardPage: React.FC = () => {
  const statsCards: StatCard[] = [
    {
      title: 'Total Users',
      value: '1,234',
      color: 'primary',
      icon: <PeopleIcon />,
    },
    {
      title: 'Active Sessions',
      value: '567',
      color: 'secondary',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'System Status',
      value: 'Online',
      color: 'success',
      icon: <AssessmentIcon />,
    },
    {
      title: 'Notifications',
      value: '23',
      color: 'warning',
      icon: <NotificationsIcon />,
    },
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
        subtitle="Welcome back! Here's what's happening with your system today."
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Recent Activities */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activities
        </Typography>
        <List>
          {recentActivities.map((activity) => (
            <ListItem key={activity.id} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <Typography variant="body2" fontSize="0.75rem">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </Typography>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.action}
                secondary={`${activity.user} • ${activity.time}`}
              />
              <Chip
                label={activity.status}
                size="small"
                color={activity.status === 'success' ? 'success' : 
                       activity.status === 'error' ? 'error' : 
                       activity.status === 'warning' ? 'warning' : 'default'}
                variant="outlined"
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default DashboardPage; 