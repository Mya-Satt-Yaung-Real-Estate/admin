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
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  lastLogin: string;
  createdAt: string;
  phone?: string;
  department?: string;
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
    role: 'Admin',
    status: 'active',
    avatar: 'JD',
    lastLogin: '2024-01-15 10:30',
    createdAt: '2023-06-15',
    phone: '+1 (555) 123-4567',
    department: 'IT',
    location: 'New York, NY',
    bio: 'Senior IT Administrator with 8+ years of experience in system administration and user management.'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    avatar: 'JS',
    lastLogin: '2024-01-14 15:45',
    createdAt: '2023-08-20',
    phone: '+1 (555) 234-5678',
    department: 'Marketing',
    location: 'Los Angeles, CA',
    bio: 'Marketing Specialist focused on digital campaigns and brand development.'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Manager',
    status: 'inactive',
    avatar: 'MJ',
    lastLogin: '2024-01-10 09:15',
    createdAt: '2023-09-10',
    phone: '+1 (555) 345-6789',
    department: 'Sales',
    location: 'Chicago, IL',
    bio: 'Sales Manager with expertise in B2B sales and team leadership.'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'User',
    status: 'pending',
    avatar: 'SW',
    lastLogin: 'Never',
    createdAt: '2024-01-12',
    phone: '+1 (555) 456-7890',
    department: 'HR',
    location: 'Austin, TX',
    bio: 'HR Coordinator specializing in recruitment and employee relations.'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'User',
    status: 'active',
    avatar: 'DB',
    lastLogin: '2024-01-13 14:20',
    createdAt: '2023-11-05',
    phone: '+1 (555) 567-8901',
    department: 'Finance',
    location: 'Seattle, WA',
    bio: 'Financial Analyst with strong background in budgeting and financial planning.'
  }
];

const mockActivityLog = [
  { id: 1, action: 'Login', timestamp: '2024-01-15 10:30', ip: '192.168.1.100' },
  { id: 2, action: 'Password Changed', timestamp: '2024-01-14 15:45', ip: '192.168.1.100' },
  { id: 3, action: 'Profile Updated', timestamp: '2024-01-13 14:20', ip: '192.168.1.100' },
  { id: 4, action: 'Login', timestamp: '2024-01-12 09:15', ip: '192.168.1.100' },
  { id: 5, action: 'Login', timestamp: '2024-01-11 16:30', ip: '192.168.1.100' },
];

const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const userId = parseInt(id || '1');
    const foundUser = mockUsers.find(u => u.id === userId);
    setUser(foundUser || null);
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
      case 'Admin':
        return 'primary';
      case 'Manager':
        return 'secondary';
      case 'User':
        return 'info';
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
        breadcrumbs={`Dashboard / Users / ${user.name}`}
        subtitle="View detailed information about this user"
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
                    backgroundColor: user.status === 'active' ? '#4caf50' : 
                                    user.status === 'inactive' ? '#f44336' : '#ff9800'
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
                color={getRoleColor(user.role) as any}
                size="small"
                variant="outlined"
              />
              <Chip
                label={user.status}
                color={getStatusColor(user.status) as any}
                size="small"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Department" 
                  secondary={user.department || 'N/A'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Location" 
                  secondary={user.location || 'N/A'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Member Since" 
                  secondary={user.createdAt} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Last Login" 
                  secondary={user.lastLogin} 
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/users/${user.id}/edit`)}
                fullWidth
              >
                Edit User
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* User Details Tabs */}
        <Grid item xs={12} md={8}>
          <Paper>
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
                    About
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.bio || 'No bio available for this user.'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contact Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <EmailIcon />
                          </ListItemIcon>
                          <ListItemText primary="Email" secondary={user.email} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon />
                          </ListItemIcon>
                          <ListItemText primary="Phone" secondary={user.phone || 'N/A'} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Account Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <SecurityIcon />
                          </ListItemIcon>
                          <ListItemText primary="Role" secondary={user.role} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BusinessIcon />
                          </ListItemIcon>
                          <ListItemText primary="Department" secondary={user.department || 'N/A'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTimeIcon />
                          </ListItemIcon>
                          <ListItemText primary="Status" secondary={user.status} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
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
                      <TableCell>Action</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>IP Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockActivityLog.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>{activity.timestamp}</TableCell>
                        <TableCell>{activity.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Account settings and preferences will be displayed here.
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetailPage; 