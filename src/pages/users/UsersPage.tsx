import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Typography
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import PageHeader from '../../components/layout/PageHeader';

const UsersPage: React.FC = () => {
  const users = [
    {
      id: 1,
      name: 'Sandar Moe',
      email: 'sandar.moe@gmail.com',
      date: '01-06-2025',
      avatar: 'SA',
      avatarColor: '#8B5CF6'
    },
    {
      id: 2,
      name: 'Hsu Hsu Hlaing Aye',
      email: 'hsuhsu@gmail.com',
      date: '01-06-2025',
      avatar: 'HS',
      avatarColor: '#10B981'
    },
    {
      id: 3,
      name: 'Admin',
      email: 'admin@gmail.com',
      date: '28-05-2025',
      avatar: 'AD',
      avatarColor: '#06B6D4'
    }
  ];

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log('Add user clicked');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <PageHeader
        breadcrumbs="Users / User List"
        title="User List"
        actionButton={{
          text: "+ Add User",
          icon: <PersonAddIcon />,
          onClick: handleAddUser
        }}
      />

      {/* Search and Filter Bar */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#D1D5DB',
              },
              '&:hover fieldset': {
                borderColor: '#9CA3AF',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3B82F6',
              },
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <Select
            value="DESC"
            displayEmpty
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D1D5DB',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9CA3AF',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3B82F6',
              },
            }}
          >
            <MenuItem value="DESC">DESC</MenuItem>
            <MenuItem value="ASC">ASC</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* User Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
          width: '100%'
        }}
      >
        <Table sx={{ width: '100%' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '8%', fontSize: '0.875rem' }}>No.</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center', py: 1.5, width: '12%', fontSize: '0.875rem' }}>Avatar</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '25%', fontSize: '0.875rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '35%', fontSize: '0.875rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '12%', fontSize: '0.875rem' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', py: 1.5, width: '8%', fontSize: '0.875rem' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                sx={{ 
                  '&:hover': {
                    backgroundColor: '#F9FAFB'
                  }
                }}
              >
                <TableCell sx={{ color: '#6B7280', fontSize: '0.875rem', py: 1.5 }}>
                  {user.id}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: user.avatarColor,
                      width: 36,
                      height: 36,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      mx: 'auto'
                    }}
                  >
                    {user.avatar}
                  </Avatar>
                </TableCell>
                <TableCell sx={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500, py: 1.5 }}>
                  {user.name}
                </TableCell>
                <TableCell sx={{ color: '#6B7280', fontSize: '0.875rem', py: 1.5 }}>
                  {user.email}
                </TableCell>
                <TableCell sx={{ color: '#6B7280', fontSize: '0.875rem', py: 1.5 }}>
                  {user.date}
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <IconButton 
                    size="small"
                    sx={{ 
                      color: '#6B7280',
                      '&:hover': {
                        backgroundColor: '#F3F4F6'
                      }
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: '1.125rem' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mt: 2,
        alignItems: 'center',
        gap: 1
      }}>
        <IconButton 
          size="small"
          sx={{ 
            color: '#6B7280',
            '&:hover': {
              backgroundColor: '#F3F4F6'
            }
          }}
        >
          <Typography sx={{ fontSize: '1.125rem' }}>&lt;</Typography>
        </IconButton>
        <Box 
          sx={{ 
            backgroundColor: '#3B82F6',
            color: '#ffffff',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            fontSize: '0.8125rem',
            fontWeight: 600
          }}
        >
          1
        </Box>
        <IconButton 
          size="small"
          sx={{ 
            color: '#6B7280',
            '&:hover': {
              backgroundColor: '#F3F4F6'
            }
          }}
        >
          <Typography sx={{ fontSize: '1.125rem' }}>&gt;</Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

export default UsersPage; 