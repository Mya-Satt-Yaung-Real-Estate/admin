import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Normal User' | 'Company User';
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  lastLogin: string;
  createdAt: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'JD',
    lastLogin: '2024-01-15 10:30',
    createdAt: '2023-06-15',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Real estate enthusiast looking for investment opportunities in the city.'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Company User',
    status: 'active',
    avatar: 'JS',
    lastLogin: '2024-01-14 15:45',
    createdAt: '2023-08-20',
    phone: '+1 (555) 234-5678',
    location: 'Los Angeles, CA',
    bio: 'Real estate agent specializing in luxury properties and commercial real estate.'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Company User',
    status: 'inactive',
    avatar: 'MJ',
    lastLogin: '2024-01-10 09:15',
    createdAt: '2023-09-10',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    bio: 'Property owner and real estate investor with portfolio across multiple states.'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'Normal User',
    status: 'pending',
    avatar: 'SW',
    lastLogin: 'Never',
    createdAt: '2024-01-12',
    phone: '+1 (555) 456-7890',
    location: 'Miami, FL',
    bio: 'First-time homebuyer looking for family-friendly neighborhoods.'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'Normal User',
    status: 'active',
    avatar: 'DB',
    lastLogin: '2024-01-13 14:20',
    createdAt: '2023-11-05',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    bio: 'Tech professional seeking modern apartments in downtown area.'
  }
];

const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      const foundUser = mockUsers.find(u => u.id === parseInt(id));
      setUser(foundUser || null);
    }
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Normal User':
        return 'primary';
      case 'Company User':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">User not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginLeft: 0, width: '100%' }}>
      <PageHeader
        title="User Details"
        breadcrumbs="Dashboard / User Management / User Details"
        subtitle={`Viewing details for ${user.name}`}
        actionButton={{
          text: 'Back to Users',
          icon: <ArrowBackIcon />,
          onClick: () => navigate('/users')
        }}
      />

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: user.status === 'active' ? '#4caf50' : user.status === 'inactive' ? '#f44336' : '#ff9800'
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {user.avatar}
              </Avatar>
            </Badge>
            
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {user.email}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
              <Chip
                label={user.role}
                color={getRoleColor(user.role)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={user.status}
                color={getStatusColor(user.status)}
                size="small"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/users/${user.id}/edit`)}
              fullWidth
            >
              Edit User
            </Button>
          </Paper>
        </Grid>

        {/* User Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Overview" />
                <Tab label="Activity" />
                <Tab label="Settings" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={user.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={user.phone || 'Not provided'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Location"
                        secondary={user.location || 'Not provided'}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Role"
                        secondary={user.role}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Status"
                        secondary={user.status}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Member Since"
                        secondary={user.createdAt}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {user.bio && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Bio
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.bio}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Activity</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Last Login</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status === 'active' ? 'Online' : 'Offline'}
                          color={user.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Account Created</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Status"
                    secondary={user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Pending'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Type"
                    secondary={user.role === 'Normal User' ? 'Real Estate Seeker' : 'Real Estate Professional'}
                  />
                </ListItem>
              </List>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetailPage; 