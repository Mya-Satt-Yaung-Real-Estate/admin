# React Query API Services Documentation

This document explains the React Query implementation for the admin panel.

## 📁 Final Clean Structure

```
src/services/
├── api/                    # API functions (organized by features)
│   ├── base.ts            # Base API configuration and request function
│   ├── auth.ts            # Authentication API functions
│   ├── adminUsers.ts      # Admin users API functions
│   ├── properties.ts      # Properties API functions
│   └── index.ts           # Export all API functions
├── queries/               # React Query hooks (organized by features)
│   ├── auth.ts            # Authentication queries/mutations
│   ├── adminUsers.ts      # Admin users queries/mutations
│   ├── properties.ts      # Properties queries/mutations
│   └── index.ts           # Export all queries
└── README.md              # This documentation
├── providers/
│   └── QueryProvider.tsx  # React Query provider setup
└── examples/
    └── ReactQueryExamples.tsx # Usage examples
```

**Super clean!** Only React Query - no unnecessary complexity.

## 🎯 React Query Benefits

- **Automatic Caching**: Data is cached and shared between components
- **Background Updates**: Data stays fresh automatically
- **Optimistic Updates**: UI updates immediately
- **Built-in States**: Loading, error, success states handled
- **DevTools**: Great debugging experience
- **TypeScript Support**: Full type safety

## 🚀 Quick Start

### Basic Query (Fetching Data)

```tsx
import { useAdminUsers } from '@/services/queries';

function AdminUsersList() {
  const { data, isLoading, error } = useAdminUsers({ page: 1, per_page: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Basic Mutation (Creating Data)

```tsx
import { useCreateAdminUser } from '@/services/queries';

function CreateUserForm() {
  const createUser = useCreateAdminUser();

  const handleSubmit = async (formData) => {
    try {
      await createUser.mutateAsync(formData);
      // Cache is automatically updated!
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

## 📚 Available Hooks

### Authentication

```tsx
import { useLogin, useLogout } from '@/services/queries';

// Login
const login = useLogin();
await login.mutateAsync({ email: 'admin@example.com', password: 'password' });

// Logout
const logout = useLogout();
await logout.mutateAsync();
```

### Admin Users

```tsx
import { 
  useAdminUsers, 
  useAdminUser, 
  useCreateAdminUser, 
  useUpdateAdminUser, 
  useDeleteAdminUser 
} from '@/services/queries';

// Get list
const { data, isLoading, error } = useAdminUsers({ page: 1, per_page: 10 });

// Get single user
const { data: user } = useAdminUser('user-slug');

// Create user
const createUser = useCreateAdminUser();
await createUser.mutateAsync(userData);

// Update user
const updateUser = useUpdateAdminUser();
await updateUser.mutateAsync({ slug: 'user-slug', data: updateData });

// Delete user
const deleteUser = useDeleteAdminUser();
await deleteUser.mutateAsync('user-slug');
```

### Properties

```tsx
import { 
  useProperties, 
  usePendingProperties, 
  usePublishedProperties,
  useProperty,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useApproveProperty,
  useRejectProperty
} from '@/services/queries';

// Get all properties
const { data } = useProperties({ page: 1, per_page: 20 });

// Get pending properties
const { data: pending } = usePendingProperties({ page: 1, per_page: 10 });

// Get published properties
const { data: published } = usePublishedProperties({ page: 1, per_page: 10 });

// Get single property
const { data: property } = useProperty(123);

// Create property
const createProperty = useCreateProperty();
await createProperty.mutateAsync(propertyData);

// Update property
const updateProperty = useUpdateProperty();
await updateProperty.mutateAsync({ id: 123, data: updateData });

// Delete property
const deleteProperty = useDeleteProperty();
await deleteProperty.mutateAsync(123);

// Approve property
const approveProperty = useApproveProperty();
await approveProperty.mutateAsync(123);

// Reject property
const rejectProperty = useRejectProperty();
await rejectProperty.mutateAsync({ id: 123, reason: 'Incomplete info' });
```

## 🔧 Configuration

### Query Provider Setup

The React Query provider is configured in `src/providers/QueryProvider.tsx`:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,                    // Retry failed requests 3 times
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 5 * 60 * 1000,   // Keep data fresh for 5 minutes
      gcTime: 10 * 60 * 1000,     // Cache data for 10 minutes
    },
    mutations: {
      retry: 1,                    // Retry failed mutations 1 time
    },
  },
});
```

### Query Keys

Query keys are used for cache management:

```tsx
// Admin users query keys
export const adminUserKeys = {
  all: ['adminUsers'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...adminUserKeys.lists(), params] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (slug: string) => [...adminUserKeys.details(), slug] as const,
};
```

## 🎨 Error Handling

### Built-in Error States

React Query provides built-in error handling:

```tsx
const { data, isLoading, error, isError } = useAdminUsers();

if (isError) {
  return <div>Error: {error.message}</div>;
}
```

### Error Handling with React Query

React Query provides built-in error handling:

```tsx
function MyComponent() {
  const createUser = useCreateAdminUser();

  const handleCreate = async (data) => {
    try {
      await createUser.mutateAsync(data);
      // Success is handled by React Query's built-in states
    } catch (error) {
      // Error is handled by React Query's built-in states
      console.error('Failed to create user:', error);
    }
  };

  // You can also use the built-in error states
  if (createUser.isError) {
    return <div>Error: {createUser.error?.message}</div>;
  }
}
```

## 🔄 Cache Management

### Automatic Cache Updates

React Query automatically manages cache:

```tsx
// After creating a user, the list is automatically refreshed
const createUser = useCreateAdminUser();
// Cache invalidation happens automatically in onSuccess
```

### Manual Cache Updates

You can manually update cache:

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });

// Update specific data
queryClient.setQueryData(adminUserKeys.detail('user-slug'), newData);

// Remove specific data
queryClient.removeQueries({ queryKey: adminUserKeys.detail('user-slug') });
```

## 📊 React Query States

### Query States

```tsx
const { 
  data,           // The data returned from the query
  isLoading,      // True if the query is loading for the first time
  isFetching,     // True if the query is fetching (including background)
  isError,        // True if the query encountered an error
  error,          // The error object if isError is true
  isSuccess,      // True if the query was successful
  refetch,        // Function to manually refetch the query
} = useAdminUsers();
```

### Mutation States

```tsx
const createUser = useCreateAdminUser();

const {
  mutate,         // Function to trigger the mutation
  mutateAsync,    // Async function to trigger the mutation
  isPending,      // True if the mutation is in progress
  isError,        // True if the mutation encountered an error
  error,          // The error object if isError is true
  isSuccess,      // True if the mutation was successful
  data,           // The data returned from the mutation
  reset,          // Function to reset the mutation state
} = createUser;
```

## 🎯 Best Practices

### 1. Use Query Keys Consistently

```tsx
// Good: Consistent query key structure
const { data } = useAdminUsers({ page: 1, per_page: 10 });

// Good: Use the same structure for related queries
const { data: user } = useAdminUser('user-slug');
```

### 2. Handle Loading States

```tsx
const { data, isLoading, error } = useAdminUsers();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <NoData />;

return <UserList users={data.data} />;
```

### 3. Use Mutations Properly

```tsx
const createUser = useCreateAdminUser();

const handleSubmit = async (formData) => {
  try {
    await createUser.mutateAsync(formData);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

### 4. Optimize with Stale Time

```tsx
// Data stays fresh for 5 minutes
const { data } = useAdminUsers({ page: 1, per_page: 10 });
// This query won't refetch for 5 minutes unless invalidated
```

## 🛠️ DevTools

React Query includes excellent DevTools for development:

- **Query Explorer**: View all queries and their states
- **Mutation Explorer**: View all mutations and their states
- **Cache Explorer**: View cached data
- **Network Tab**: Monitor API calls

The DevTools are automatically included in development mode.

## 📝 Examples

See `src/examples/ReactQueryExamples.tsx` for complete examples of all React Query features.

## 🎯 Why React Query?

### Advantages
- ✅ **Automatic Caching**: No duplicate API calls
- ✅ **Background Updates**: Data stays fresh
- ✅ **Optimistic Updates**: Better UX
- ✅ **Built-in States**: Less boilerplate
- ✅ **DevTools**: Great debugging
- ✅ **Data Synchronization**: Components stay in sync

### When to Use
- ✅ **Production Applications**: With complex data requirements
- ✅ **Real-time Data**: That needs to stay fresh
- ✅ **Complex UIs**: With multiple data dependencies
- ✅ **Performance**: When you need optimal caching

## 🚀 Getting Started

1. **Install React Query**: Already done in this project
2. **Setup Provider**: Already configured in `App.tsx`
3. **Use Hooks**: Import and use the query hooks
4. **Handle States**: Use built-in loading/error states
5. **Enjoy**: Automatic caching and background updates!

The React Query implementation provides the most powerful and efficient way to handle API data in your admin panel!
