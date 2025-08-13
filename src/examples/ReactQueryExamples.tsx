import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, TextField } from '@mui/material';
import {
  useAdminUsers,
  useAdminUser,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useProperties,
  usePendingProperties,
  useLogin,
  useLogout,
} from '@/services/queries';

// Example 1: Simple data fetching with useQuery
export const SimpleQueryExample: React.FC = () => {
  const { data, isLoading, error } = useAdminUsers({ page: 1, per_page: 10 });

  return (
    <Box>
      <Typography variant="h6">Simple Query Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Data is automatically cached and shared between components.
      </Typography>
      
      {isLoading && <CircularProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}
      
      {data && (
        <Box>
          <Typography sx={{ mb: 2 }}>
            Total Users: {data.pagination?.total || 0}
          </Typography>
          
          {data.data?.map((user: any) => (
            <Box key={user.id} sx={{ p: 1, border: '1px solid #ddd', mb: 1 }}>
              <Typography>{user.name}</Typography>
              <Typography variant="body2">{user.email}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Example 2: Single item fetching
export const SingleItemExample: React.FC = () => {
  const [userId, setUserId] = useState('admin-user-slug');
  const { data, isLoading, error } = useAdminUser(userId);

  return (
    <Box>
      <Typography variant="h6">Single Item Query Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Fetch single user with automatic caching.
      </Typography>
      
      <TextField
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        label="User Slug"
        size="small"
        sx={{ mb: 2 }}
      />
      
      {isLoading && <CircularProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}
      
      {data && (
        <Box sx={{ p: 2, border: '1px solid #ddd' }}>
          <Typography variant="h6">{data.data.name}</Typography>
          <Typography>{data.data.email}</Typography>
          <Typography variant="body2">Status: {data.data.is_active ? 'Active' : 'Inactive'}</Typography>
        </Box>
      )}
    </Box>
  );
};

// Example 3: Create operation with useMutation
export const CreateExample: React.FC = () => {
  const createUser = useCreateAdminUser();

  const handleCreate = async () => {
    try {
      await createUser.mutateAsync({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        user_type: 'admin',
        is_active: true,
        role_ids: [1],
      });
      // Success is handled by React Query's built-in states
    } catch (err: any) {
      // Error is handled by React Query's built-in states
      console.error('Failed to create user:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Create Mutation Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Create user with automatic cache invalidation.
      </Typography>
      
      <Button 
        onClick={handleCreate} 
        disabled={createUser.isPending}
        variant="contained"
        sx={{ mb: 2 }}
      >
        {createUser.isPending ? <CircularProgress size={20} /> : 'Create User'}
      </Button>
      
      {createUser.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {createUser.error?.message}
        </Alert>
      )}
      
      {createUser.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          User created successfully!
        </Alert>
      )}
    </Box>
  );
};

// Example 4: Update operation
export const UpdateExample: React.FC = () => {
  const updateUser = useUpdateAdminUser();

  const handleUpdate = async () => {
    try {
      await updateUser.mutateAsync({
        slug: 'admin-user-slug',
        data: {
          name: 'Updated User Name',
          email: 'updated@example.com',
        },
      });
      // Success is handled by React Query's built-in states
    } catch (err: any) {
      // Error is handled by React Query's built-in states
      console.error('Failed to update user:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Update Mutation Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Update user with optimistic cache updates.
      </Typography>
      
      <Button 
        onClick={handleUpdate} 
        disabled={updateUser.isPending}
        variant="contained"
        color="secondary"
        sx={{ mb: 2 }}
      >
        {updateUser.isPending ? <CircularProgress size={20} /> : 'Update User'}
      </Button>
      
      {updateUser.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateUser.error?.message}
        </Alert>
      )}
    </Box>
  );
};

// Example 5: Delete operation
export const DeleteExample: React.FC = () => {
  const deleteUser = useDeleteAdminUser();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser.mutateAsync('admin-user-slug');
        // Success is handled by React Query's built-in states
      } catch (err: any) {
        // Error is handled by React Query's built-in states
        console.error('Failed to delete user:', err);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6">Delete Mutation Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Delete user with automatic cache cleanup.
      </Typography>
      
      <Button 
        onClick={handleDelete} 
        disabled={deleteUser.isPending}
        variant="contained"
        color="error"
        sx={{ mb: 2 }}
      >
        {deleteUser.isPending ? <CircularProgress size={20} /> : 'Delete User'}
      </Button>
      
      {deleteUser.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteUser.error?.message}
        </Alert>
      )}
    </Box>
  );
};

// Example 6: Properties with different queries
export const PropertiesExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'published'>('all');
  
  const allProperties = useProperties({ page: 1, per_page: 5 });
  const pendingProperties = usePendingProperties({ page: 1, per_page: 5 });
  const publishedProperties = useProperties({ page: 1, per_page: 5 });

  const getCurrentData = () => {
    switch (activeTab) {
      case 'pending':
        return pendingProperties;
      case 'published':
        return publishedProperties;
      default:
        return allProperties;
    }
  };

  const currentData = getCurrentData();

  return (
    <Box>
      <Typography variant="h6">Multiple Queries Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Different queries for different data types.
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          onClick={() => setActiveTab('all')}
          variant={activeTab === 'all' ? 'contained' : 'outlined'}
          sx={{ mr: 1 }}
        >
          All Properties
        </Button>
        <Button 
          onClick={() => setActiveTab('pending')}
          variant={activeTab === 'pending' ? 'contained' : 'outlined'}
          sx={{ mr: 1 }}
        >
          Pending
        </Button>
        <Button 
          onClick={() => setActiveTab('published')}
          variant={activeTab === 'published' ? 'contained' : 'outlined'}
        >
          Published
        </Button>
      </Box>
      
      {currentData.isLoading && <CircularProgress sx={{ mb: 2 }} />}
      {currentData.error && <Alert severity="error" sx={{ mb: 2 }}>{currentData.error.message}</Alert>}
      
      {currentData.data && (
        <Box>
          <Typography sx={{ mb: 2 }}>
            Total: {currentData.data.pagination?.total || 0}
          </Typography>
          
          {currentData.data.data?.map((property: any) => (
            <Box key={property.id} sx={{ p: 1, border: '1px solid #ddd', mb: 1 }}>
              <Typography variant="h6">{property.title_en}</Typography>
              <Typography variant="body2">{property.title_mm}</Typography>
              <Typography>Price: ${property.price}</Typography>
              <Typography>Status: {property.status}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Example 7: Authentication
export const AuthExample: React.FC = () => {
  const login = useLogin();
  const logout = useLogout();

  const handleLogin = async () => {
    try {
      await login.mutateAsync({
        email: 'admin@example.com',
        password: 'password123',
      });
      // Success is handled by React Query's built-in states
    } catch (err: any) {
      // Error is handled by React Query's built-in states
      console.error('Failed to login:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      // Success is handled by React Query's built-in states
    } catch (err: any) {
      // Error is handled by React Query's built-in states
      console.error('Failed to logout:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Authentication Example</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Login/logout with automatic cache clearing.
      </Typography>
      
      <Button 
        onClick={handleLogin} 
        disabled={login.isPending}
        variant="contained"
        sx={{ mr: 2, mb: 2 }}
      >
        {login.isPending ? <CircularProgress size={20} /> : 'Login'}
      </Button>
      
      <Button 
        onClick={handleLogout} 
        disabled={logout.isPending}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        {logout.isPending ? <CircularProgress size={20} /> : 'Logout'}
      </Button>
      
      {(login.isError || logout.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {login.error?.message || logout.error?.message}
        </Alert>
      )}
    </Box>
  );
};

// Main example component
export const ReactQueryExamples: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        React Query Examples
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        Simple examples showing how to use React Query for API operations.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SimpleQueryExample />
        <SingleItemExample />
        <CreateExample />
        <UpdateExample />
        <DeleteExample />
        <PropertiesExample />
        <AuthExample />
      </Box>
    </Box>
  );
};
