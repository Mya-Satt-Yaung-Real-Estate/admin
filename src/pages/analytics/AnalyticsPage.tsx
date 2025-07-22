import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';
import { StatisticsCards, StatCard } from '../../components/common/StatisticsCards';

const AnalyticsPage: React.FC = () => {
  // Sample data for charts
  const barData = [
    { name: 'Jan', users: 400, revenue: 2400 },
    { name: 'Feb', users: 300, revenue: 1398 },
    { name: 'Mar', users: 200, revenue: 9800 },
    { name: 'Apr', users: 278, revenue: 3908 },
    { name: 'May', users: 189, revenue: 4800 },
    { name: 'Jun', users: 239, revenue: 3800 },
  ];

  const lineData = [
    { name: 'Jan', active: 400, inactive: 240 },
    { name: 'Feb', active: 300, inactive: 139 },
    { name: 'Mar', active: 200, inactive: 980 },
    { name: 'Apr', active: 278, inactive: 390 },
    { name: 'May', active: 189, inactive: 480 },
    { name: 'Jun', active: 239, inactive: 380 },
  ];

  const pieData = [
    { name: 'Active Users', value: 400, color: '#8884d8' },
    { name: 'Inactive Users', value: 300, color: '#82ca9d' },
    { name: 'New Users', value: 200, color: '#ffc658' },
  ];

  const statsCards: StatCard[] = [
    {
      title: 'Total Users',
      value: '1,234',
      color: 'primary',
      icon: <PeopleIcon />,
    },
    {
      title: 'Active Users',
      value: '892',
      color: 'success',
      icon: <PeopleIcon />,
    },
    {
      title: 'Revenue',
      value: '$12,345',
      color: 'secondary',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Growth Rate',
      value: '+15%',
      color: 'info',
      icon: <AssessmentIcon />,
    },
  ];

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="Analytics"
        breadcrumbs="Dashboard / Analytics"
        subtitle="Comprehensive analytics and insights for your system"
      />

      {/* Statistics Cards */}
      <StatisticsCards cards={statsCards} />

      {/* Charts Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Growth & Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Activity Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="active" stroke="#8884d8" />
                <Line type="monotone" dataKey="inactive" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Summary Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Monthly Active Users
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  892
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  New Registrations
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  156
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Conversion Rate
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  12.5%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Average Session Duration
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  24m 32s
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage; 