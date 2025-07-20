# Type Definitions

This directory contains centralized TypeScript type definitions for the entire application.

## 📁 Type Structure

```
src/types/
├── index.ts          # Main export file (re-exports all types)
├── layout.ts         # Layout component types
├── auth.ts           # Authentication and user types
├── ui.ts             # UI component types
├── api.ts            # API and HTTP types
└── README.md         # This documentation
```

## 🧩 Type Categories

### **layout.ts** - Layout Component Types
- `AdminLayoutProps` - Main layout component props
- `LogoProps` - Logo component props
- `PageHeaderProps` - Page header component props
- `SidebarItemProps` - Sidebar menu item props
- `SidebarProps` - Sidebar component props
- `TopBarProps` - Top app bar component props
- `MenuItem` - Navigation menu item structure
- `DRAWER_WIDTH` - Layout constant

### **auth.ts** - Authentication Types
- `User` - User entity interface
- `AuthState` - Authentication state interface
- `AuthActions` - Authentication actions interface
- `AuthStore` - Combined auth state and actions
- `LoginFormData` - Login form data structure
- `LoginResponse` - Login API response

### **ui.ts** - UI Component Types
- `LoadingSpinnerProps` - Loading spinner component props
- `ChartDataPoint` - Chart data structure
- `PieChartData` - Pie chart data structure
- `TableColumn<T>` - Table column configuration
- `TableProps<T>` - Table component props
- `FormField` - Form field configuration
- `ModalProps` - Modal component props
- `Notification` - Notification structure

### **api.ts** - API and HTTP Types
- `ApiResponse<T>` - Generic API response
- `PaginatedResponse<T>` - Paginated API response
- `ApiError` - API error structure
- `PaginationParams` - Pagination parameters
- `SearchParams` - Search parameters
- `RequestParams` - Combined request parameters
- `HttpMethod` - HTTP method types
- `ApiConfig` - API configuration
- `RequestInterceptor` - Request interceptor
- `ResponseInterceptor` - Response interceptor

### **index.ts** - Global Types
- `BaseEntity` - Base entity with common fields
- `SelectOption` - Select dropdown option
- `FileUpload` - File upload state
- `ThemeColors` - Theme color configuration
- `BreakpointConfig` - Responsive breakpoints

## 🎯 Benefits of Centralized Types

### **1. Single Source of Truth**
- All type definitions in one place
- No duplicate interfaces across files
- Consistent type naming and structure

### **2. Better Maintainability**
- Easy to find and update types
- Changes propagate across the entire app
- Reduced type conflicts and errors

### **3. Improved Developer Experience**
- Better IDE support and autocomplete
- Clear type documentation
- Easier refactoring

### **4. Type Safety**
- Consistent type checking across components
- Better error detection at compile time
- Reduced runtime errors

### **5. Reusability**
- Types can be imported anywhere in the app
- No need to redefine common interfaces
- Shared types for similar components

## 🔧 Usage Examples

### **Importing Types**
```tsx
// Import specific types
import { User, AuthStore } from '@/types';

// Import multiple types
import { LogoProps, SidebarProps, MenuItem } from '@/types';

// Import all types (not recommended for large apps)
import * as Types from '@/types';
```

### **Using Types in Components**
```tsx
import React from 'react';
import { LogoProps } from '@/types';

const Logo: React.FC<LogoProps> = ({ collapsed, size, showText }) => {
  // Component implementation
};
```

### **Using Types in Stores**
```tsx
import { create } from 'zustand';
import { User, AuthStore } from '@/types';

export const useAuthStore = create<AuthStore>()((set) => ({
  // Store implementation
}));
```

### **Using Types in API Services**
```tsx
import { ApiResponse, User, ApiError } from '@/types';

const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
  // API implementation
};
```

## 📋 Best Practices

### **Type Naming**
- Use PascalCase for interfaces and types
- Use descriptive names that indicate purpose
- Add `Props` suffix for component props
- Add `State` suffix for state interfaces
- Add `Response` suffix for API responses

### **Type Organization**
- Group related types in the same file
- Use clear file names that indicate content
- Keep types focused and single-purpose
- Avoid circular dependencies

### **Type Documentation**
- Add JSDoc comments for complex types
- Use descriptive property names
- Include examples for complex interfaces
- Document optional vs required properties

### **Type Reusability**
- Create generic types when possible
- Use union types for related values
- Extend base interfaces for variations
- Use utility types for common patterns

## 🚀 Future Enhancements

### **Planned Improvements**
1. **Strict Type Checking**: Enable stricter TypeScript options
2. **Type Guards**: Add runtime type checking functions
3. **Validation Schemas**: Integrate with Zod or Yup
4. **API Type Generation**: Auto-generate types from API specs
5. **Component Type Testing**: Add type testing utilities

### **Potential New Type Files**
1. **`forms.ts`** - Form-specific types
2. **`charts.ts`** - Chart and visualization types
3. **`validation.ts`** - Validation schema types
4. **`events.ts`** - Event handling types
5. **`config.ts`** - Configuration types

## 🔍 Type Checking

### **TypeScript Configuration**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### **ESLint Rules**
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/no-unused-vars": "error"
}
``` 