# Layout Components

This directory contains modular, reusable layout components for the admin panel.

## 📁 Component Structure

```
src/components/layout/
├── AdminLayout.tsx    # Main layout orchestrator
├── Sidebar.tsx        # Sidebar navigation component
├── SidebarItem.tsx    # Individual sidebar menu item
├── TopBar.tsx         # Top app bar component
├── Logo.tsx           # Logo component
├── PageHeader.tsx     # Page header with breadcrumbs
└── README.md          # This documentation
```

## 🧩 Components Overview

### **AdminLayout.tsx**
- **Purpose**: Main layout orchestrator that combines all layout components
- **Responsibilities**: 
  - Manages sidebar state (open/closed, collapsed/expanded)
  - Handles responsive behavior
  - Coordinates between TopBar and Sidebar
- **Props**: `children: React.ReactNode`
- **Lines**: ~84 (reduced from 237)

### **Sidebar.tsx**
- **Purpose**: Sidebar navigation component
- **Responsibilities**:
  - Renders navigation menu
  - Handles sidebar collapse/expand
  - Manages mobile vs desktop behavior
- **Props**: Multiple props for state management and callbacks
- **Lines**: ~140

### **SidebarItem.tsx**
- **Purpose**: Individual navigation menu item
- **Responsibilities**:
  - Renders single menu item with icon and text
  - Handles selection state
  - Manages hover and click interactions
- **Props**: `text`, `icon`, `path`, `isSelected`, `isCollapsed`, `onClick`
- **Lines**: ~73

### **TopBar.tsx**
- **Purpose**: Top app bar component
- **Responsibilities**:
  - Shows current page title
  - Provides sidebar toggle button
  - Handles responsive width adjustments
- **Props**: Menu items, current path, drawer width, state flags, callbacks
- **Lines**: ~79

### **Logo.tsx**
- **Purpose**: Reusable logo component
- **Responsibilities**:
  - Displays project logo image
  - Handles collapsed/expanded states
  - Supports different sizes
- **Props**: `collapsed`, `size`, `showText`
- **Lines**: ~57

### **PageHeader.tsx**
- **Purpose**: Page header with breadcrumbs
- **Responsibilities**:
  - Shows page title and breadcrumbs
  - Handles navigation breadcrumbs
- **Props**: `title`, `breadcrumbs`, `subtitle`
- **Lines**: ~60

## 🎯 Benefits of Modular Structure

### **1. Single Responsibility Principle**
- Each component has a single, well-defined purpose
- Easier to understand and maintain
- Reduced complexity per component

### **2. Reusability**
- Components can be reused across different layouts
- Logo component can be used in login page, sidebar, etc.
- SidebarItem can be extended for different menu types

### **3. Testability**
- Smaller components are easier to test
- Each component can be tested in isolation
- Better test coverage and maintainability

### **4. Maintainability**
- Changes to one component don't affect others
- Easier to debug issues
- Clear separation of concerns

### **5. Performance**
- Smaller components can be optimized individually
- Better tree-shaking potential
- Reduced bundle size for specific features

## 🔧 Usage Examples

### **Using Logo Component**
```tsx
// In sidebar (collapsed)
<Logo collapsed={true} size="medium" />

// In login page (large)
<Logo collapsed={false} size="large" showText={true} />
```

### **Using PageHeader Component**
```tsx
<PageHeader
  title="User Management"
  breadcrumbs="Dashboard / Users"
  subtitle="Manage system users"
/>
```

### **Extending SidebarItem**
```tsx
// Custom menu item with badge
<SidebarItem
  text="Notifications"
  icon={<NotificationsIcon />}
  path="/notifications"
  isSelected={currentPath === '/notifications'}
  isCollapsed={false}
  onClick={handleNavigation}
/>
```

## 🚀 Future Enhancements

### **Planned Improvements**
1. **Theme Integration**: Better theme support for all components
2. **Animation**: Smooth transitions and animations
3. **Accessibility**: ARIA labels and keyboard navigation
4. **Internationalization**: Multi-language support
5. **Customization**: More styling options and variants

### **Potential New Components**
1. **BreadcrumbItem**: Individual breadcrumb component
2. **NavigationGroup**: Grouped navigation items
3. **UserMenu**: User profile dropdown menu
4. **SearchBar**: Global search component
5. **NotificationBadge**: Notification indicator component

## 📋 Best Practices

### **Component Design**
- Keep components focused and single-purpose
- Use TypeScript interfaces for all props
- Provide sensible defaults for optional props
- Use consistent naming conventions

### **State Management**
- Keep state as close to where it's used as possible
- Use callbacks for parent-child communication
- Avoid prop drilling by using context when needed

### **Styling**
- Use Material-UI's `sx` prop for component-specific styles
- Follow the theme system for consistent design
- Use responsive design patterns

### **Performance**
- Memoize components when appropriate
- Use React.memo for expensive components
- Optimize re-renders with proper dependency arrays 